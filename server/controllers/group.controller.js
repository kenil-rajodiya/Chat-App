import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Group } from "../models/Group.model.js";
import { GroupMessage } from "../models/GroupMessage.model.js";
import { io, userSocketMap } from "../server.js";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";

export const createGroup = async (req, res) => {
    try {
        const { name, membersIds } = req.body;
        const adminId = req.user._id;

        if (!name || !Array.isArray(membersIds) || membersIds.length < 1) {
            throw new ApiError(400, "Group name with at least 1 member is required!");
        }

        const uniqueMembers = [...new Set([...membersIds, adminId.toString()])];
        console.log("creating group");


        const group = await Group.create({
            admin: adminId,
            members: uniqueMembers,
            name,
        });
        console.log(group);


        res.status(201).json(
            new ApiResponse(201, group, "Group created successfully!")
        );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while creating the group"));
    }
};



export const getMyGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const response = await Group.find({ members: { $in: [userId] } })
            .populate("admin", "fullName profilePic")
            .populate("members", "fullName profilePic");

        res.status(200).json(
            new ApiResponse(200, response, "Groups of user are fetched.")
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(new ApiError(500, error.message));
    }
};


export const sendGroupMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const groupId = req.params.groupId;
        const senderId = req.user._id;

        if (!groupId) {
            throw new ApiError(400, "Groupid is require for sending group message!");
        }
        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(400, "Group doesnt exists with this id.")
        }

        const senderObjectId = new mongoose.Types.ObjectId(senderId);
        const groupObjectId = new mongoose.Types.ObjectId(groupId);

        let imageurl = "";
        if (image) {
            const uploaded = await cloudinary.uploader.upload(image);
            imageurl = uploaded.secure_url;
        }

        const message = await GroupMessage.create({
            senderId: senderObjectId,
            groupId: groupObjectId,
            text,
            ...(imageurl && { image: imageurl })
        });

        io.to(groupId).emit("newGroupMessage", message);

        return res.status(200).json(
            new ApiResponse(200, message, "Message sent successfully")
        );
    } catch (error) {
        console.error("Send Message Error:", error);
        return res.status(400).json({ message: error.message });
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const messages = await GroupMessage.find({ groupId }).sort({ createdAt: 1 }).populate("senderId", "fullName profilePic");

        res.json(
            new ApiResponse(200, messages, "Group messages fetched.")
        )

    } catch (error) {
        console.log(error);

        throw new ApiError(400, error.message)

    }
}

export const editName = async (req, res) => {
    try {
        const id = req.user?._id;
        console.log(id);

        const groupId = req.params.groupId;
        const { name } = req.body;
        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(400, "Group with this id doesn't exists.");
        }
        if (!name) {
            throw new ApiError(400, "New group name is required.");
        }
        console.log(group.admin);

        if (id.toString() !== group.admin.toString()) {
            throw new ApiError(400, "Only Admin can change name of the group.")
        }
        const response = await Group.findByIdAndUpdate(groupId, { name: name }, { new: true });
        res.json(
            new ApiResponse(200, response, "Group name changed successfully.")
        )

    } catch (error) {
        console.log(error);
        throw new ApiError(400, error.message)
    }
}


export const changeAdmin = async (req, res) => {
    try {
        const id = req.user?._id;
        const groupId = req.params.groupId;
        const { newAdminId } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(400, "Group with this id doesn't exist.");
        }

        if (!newAdminId) {
            throw new ApiError(400, "New Admin userId is required.");
        }

        if (id.toString() !== group.admin.toString()) {
            throw new ApiError(400, "Only Admin can change information of the group.");
        }

        const isMember = group.members.some(
            member => member.toString() === newAdminId.toString()
        );

        if (!isMember) {
            throw new ApiError(400, "New Admin is not a member of the group. First add them to the group, then assign as admin.");
        }

        const response = await Group.findByIdAndUpdate(
            groupId,
            { admin: newAdminId },
            { new: true }
        );

        res.json(
            new ApiResponse(200, response, "Group admin changed successfully.")
        );

    } catch (error) {
        console.log(error);
        throw new ApiError(400, error.message);
    }
};


export const addMember = async (req, res) => {
    try {
        const id = req.user?._id;
        const groupId = req.params.groupId;
        const { memberId } = req.body;

        if (!groupId || groupId === "undefined") {
            throw new ApiError(400, "groupId is required in URL parameters.");
        }

        if (!memberId) {
            throw new ApiError(400, "memberId is required.");
        }

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(400, "Group with this id doesn't exist.");
        }

        if (id.toString() !== group.admin.toString()) {
            throw new ApiError(400, "Only Admin can change information of the group.");
        }

        const isMember = group.members.some(
            (member) => member.toString() === memberId.toString()
        );

        if (isMember) {
            throw new ApiError(400, "This user is already a member of the group.");
        }

        // Add member
        await Group.findByIdAndUpdate(
            groupId,
            { $push: { members: memberId } },
            { new: true }
        );

        // Fetch updated group with populated members
        const updatedGroup = await Group.findById(groupId)
            .populate("members", "_id fullName profilePic")
            .populate("admin", "_id fullName profilePic");

        res.json(new ApiResponse(200, updatedGroup, "New member added successfully."));
    } catch (error) {
        console.log(error);
        throw new ApiError(400, error.message);
    }
};
  

export const removeMember = async (req, res) => {
    try {
        const id = req.user?._id;
        const groupId = req.params.groupId;
        const { memberId } = req.body;

        if (!memberId) {
            throw new ApiError(400, "memberId is required.");
        }

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(400, "Group with this id doesn't exist.");
        }

        if (id.toString() !== group.admin.toString()) {
            throw new ApiError(400, "Only Admin can change information of the group.");
        }

        if (memberId.toString() === group.admin.toString()) {
            throw new ApiError(400, "You cannot remove the admin from the group.");
        }

        const isMember = group.members.some(
            member => member.toString() === memberId.toString()
        );

        if (!isMember) {
            throw new ApiError(400, "User is not a member of the group.");
        }

        const updatedMembers = group.members.filter(
            m => m.toString() !== memberId.toString()
        );

        const response = await Group.findByIdAndUpdate(
            groupId,
            { members: updatedMembers },
            { new: true }
        );

        res.json(new ApiResponse(200, response, "Member removed successfully."));
    } catch (error) {
        console.log(error);
        throw new ApiError(400, error.message);
    }
};


export const deleteGroup = async (req, res) => {
    try {
        const id = req.user?._id;
        const groupId = req.params.groupId;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(400, "Group with this id doesn't exist.");
        }

        if (id.toString() !== group.admin.toString()) {
            throw new ApiError(400, "Only Admin can delete the group.");
        }

        const response = await Group.findByIdAndDelete(groupId);

       

        res.json(new ApiResponse(200, response, "Group deleted successfully."));
    } catch (error) {
        console.log(error);
        throw new ApiError(400, error.message);
    }
};
export const removeSelf = async (req, res) => {
    try {
        const userId = req.user._id;
        const groupId = req.params.groupId;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json(new ApiResponse(404, null, "Group not found."));
        }

        if (group.admin.toString() === userId.toString()) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    null,
                    "As admin, you must transfer admin rights before leaving the group."
                )
            );
        }

        const isMember = group.members.some(
            (memberId) => memberId.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(400).json(
                new ApiResponse(400, null, "You are not a member of this group.")
            );
        }

        group.members = group.members.filter(
            (memberId) => memberId.toString() !== userId.toString()
        );

        await group.save();

        return res.status(200).json(
            new ApiResponse(200, group, "You have been removed from the group.")
        );
    } catch (error) {
        console.error("Error removing self from group:", error);
        return res.status(500).json(
            new ApiResponse(500, null, "Server error: " + error.message)
        );
    }
};


