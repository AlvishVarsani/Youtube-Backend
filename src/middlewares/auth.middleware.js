import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/users.model.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,  "Invalid access toksdfdwsen")
    }
    
})



//cookies --->it store some data(id,email.,token etc)
//when it is send from the server the browser will store in it 
//Its is used because not to send so many time request to the server (cost beecome more)
//cookies data is store in the browser and it is domain specific