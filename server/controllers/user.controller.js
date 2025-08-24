import { User } from "../models/User.model.js";
import {ApiError} from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import bcrypt from 'bcryptjs'
import { generateToken } from "../utils/createToken.js";
import cloudinary from "../utils/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            throw new ApiError(400, "All Fields are required!");
        }

        const user = await User.findOne({ email });
        if (user) {
            throw new ApiError(400 , "User with this email Id exists .")
        }
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);


        const newUser = await User.create(
            {
                email,fullName,password :encryptedPassword,bio
            }
        )
        console.log(newUser);
        const token = await generateToken(newUser._id);
        console.log(token);

        return res.status(200).json(
            new ApiResponse(200, { userData: newUser, token }, "New account created successfully")
        );

        
    } catch (error) {
        console.log(error.message);
        throw new ApiError(400, error.message);
        
    }
    
}


export const login = async (req, res) => {
    try {
        console.log(req.body);
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            throw new ApiError(400,"Both email and password are required for login")
        }
        const user = await User.findOne({email});
        if (!user) {
            throw new ApiError(400,"User doesn't exits with this email id")
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
           throw new ApiError(400 , "Password is wrong.")
        }
        const token =  await generateToken(user._id);
        return res.json(
            new ApiResponse(200, {
                userData: user,
                token
                
            },"User logged in successfully")
        )
        
    } catch (error) {
        console.log(error.message);
        throw new ApiError(400, error.message);
    }
}

export const checkAuth = (req, res) => {
   return  res.json(
        new ApiResponse(200, {user : req.user})
    );
    
}

export const updateProfile = async (req, res) => {
    try {
        console.log(req.body);
        
        const { profilePic, bio, fullName } = req.body;
        
        const userId = req.user._id;
        console.log(userId);
        let updatedUser;
        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate( userId , { bio, fullName }, { new: true });
            console.log(updatedUser);
            
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            console.log(upload);
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true });
        }

        return res.status(200).json(
            new ApiResponse(200,{user:updatedUser} , "User profile updated successfully.")
        )
        
    } catch (error) {
        console.log(error);
        throw new ApiError(400, error.message);
        
    }
    
}
