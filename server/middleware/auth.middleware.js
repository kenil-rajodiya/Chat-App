import { User } from "../models/User.model.js";
import jwt, { decode } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
export const protectRoute = async (req, res, next) => {

    try {
        const token = req.headers.token;
        // console.log(token);
        if (!token) {
            return;
        }
        
        const decodedId = await jwt.decode(token, process.env.JWT_SECRET)
        // console.log(decodedId);
        
        const user = await User.findById(decodedId.userId).select("-password");
        if (!user) {
            throw new ApiError(400, "Unauthorized request!");
        }
        // console.log(user);
        
        req.user = user;
        next();
        
    } catch (error) {
        console.log(error.message);
        throw new ApiError(400, error.message);
        
    }
}