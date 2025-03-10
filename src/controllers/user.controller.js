import {asyncHandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "..models/user.model.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser=asyncHandler(async(req,res)=>{
      //get user details from frontend
      //validate user details
      //check if user already exists: username,emails
      //check for images 
      //upload them to cloudinary,avatar
      //create user object -create entry in database
      //hash password(remove password and refresh token field from response)
      //check for user creation
      //return res
      
      
      const {fullName,username,email,password}=req.body
      console.log("email",email)

      if(fullName==""){
        throw new ApiError(400,"FullName is required")
      }
      if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
      ){
        throw new ApiError(400,"Allfields are required")
      }
      const existedUser=User.findOne({
        $or:[{email},{username}]
      })
      if(existedUser){
        throw new ApiError(409,"User already exists")
      }


      const avatarLocalPath=req.files?.avatar[0]?.path;
      const coverImageLocalPath=req.files?.coverImage[0]?.path;

      if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
      }
      const avatar=await uploadCloudinary(avatarLocalPath)
      const coverImage=await uploadCloudinary(coverImageLocalPath)
      if(!avatar){
        throw new ApiError(400,"Avatar is required")
      }


      const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
      })

      User.findById(user._id).select("-password -refreshToken")

      if(!createdUser){
        throw new ApiError(500,"User not created")
      }
      return res.status(201).json(new ApiResponse(200,"User created",createdUser,"User reistered succefully"))


})

export {registerUser}