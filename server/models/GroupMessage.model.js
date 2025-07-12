import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        text: String,
        image: String,
    },
    { timestamps: true }
);

export const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);
