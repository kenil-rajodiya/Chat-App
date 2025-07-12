import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ]
}, { timestamps: true })

export const Group = mongoose.model("Group", groupSchema);