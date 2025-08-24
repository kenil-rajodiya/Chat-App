

import { Message } from "../models/Message.model.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import cloudinary from "../utils/cloudinary.js";
import {io , userSocketMap} from  "../server.js"
import mongoose from "mongoose";

export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        const unSeenMessages = {}
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({
                senderId: user._id,
                reeiverId: userId,
                seen: false
            })

            if (messages.length > 0) {
                unSeenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);

        return res.status(200).json(
            new ApiResponse(200, { filteredUsers, unSeenMessages }, "All users with unseen messages fetched successfully.")
        )


    } catch (error) {
        console.log(error.message);
        throw new ApiResponse(400, error.message)
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        })
        await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true });
        return res.status(200).json(
            new ApiResponse(200, messages, "Messages fetched successfully.")
        )

    } catch (error) {
        console.log(error.message);
        throw new ApiResponse(400, error.message)

    }
}
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate({ _id: id }, { seen: true })
        return res.json(
            new ApiResponse(200, {}, "Message seen successfully")
        )


    } catch (error) {
        console.log(error.message);
        throw new ApiResponse(400, error.message)

    }

}


export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user?._id;
        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "Both senderId and receiverId are required." });
        }

        const senderObjectId = new mongoose.Types.ObjectId(senderId);
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

        let imageurl = "";
        if (image) {
            const uploaded = await cloudinary.uploader.upload(image);
            imageurl = uploaded.secure_url;
        }

        const message = await Message.create({
            senderId: senderObjectId,
            receiverId: receiverObjectId,
            text,
            ...(imageurl && { image: imageurl })
        });
        
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message);
        }

        return res.status(200).json(
            new ApiResponse(200, message, "Message sent successfully")
        );
    } catch (error) {
        console.error("Send Message Error:", error.message);
        return res.status(400).json({ message: error.message });
    }
};
