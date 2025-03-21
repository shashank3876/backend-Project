import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { json } from "express";

const generateAccessTokenAndRefreshToken = async (userId) => {
    // Generate access token
    try {
        const user = await User.findById(userId);
        const accesToken = user.generateAccessToken();
        const refreshToken = user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return { accesToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token");
    }
};
const registerUser = asyncHandler(async (req, res) => {
    // Get user details from frontend
    // validation - not empty
     // check if user already exists: username, email
     // check for images, check for avatar
     // upload them to cloudinary, avatar
     // create user object - create entry in db
     // remove password and refresh token field from response
     // check for user creation
     // return response
    const { fullName, email, username, password } = req.body;

    // Validation - check if fields are empty
    if (
      [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
      throw new ApiError(400, "All fields are required")
  }

    // Check if user already exists (by email or username)
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(400, "User with email or username already exists");
    }

    // Check for uploaded files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
  }

    if (!avatarLocalPath) {
        throw new ApiError(409, "Avatar file is required");
    }

    // Upload to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath); ;

    if (!avatar) {
        throw new ApiError(400, "Failed to upload avatar");
    }

    // Create new user in the database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // Remove sensitive data
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});
const loginUser=asyncHandler(async(req,res)=>{
    //req body->data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email,username,password}=req.body

    if(!email && !username ){
        throw new ApiError(400, "username or email is required")
    }
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404, "User does not exist")
    }
    const isPasswordCorrect = user.password && await user.isPasswordCorrect(password);

if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
}

    const{accesToken,refreshToken}= await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")


    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accesToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{
        user:loggedInUser,
        accesToken,
        refreshToken
    },"User logged in successfully"))


})
const logoutUser=asyncHandler(async(req,res)=>{ 
       await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        }
    ,{
        new:true
    }
)

const options={
    httpOnly:true,
    secure:true
}

return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"User logged out successfully"))

})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) { 
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})
const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword}=req.body

    const user=await User.findById(req.user._id)
    const isPasswordCorrect=await 
    user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid user credentials")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"User details fetched successfully"))
})
const updateAccountDetails=asyncHandler(async(req,res)=>{
    const{fullName,email}=req.body

    if(!fullName || !email){
        throw new ApiError(400,"Full name and email are required")
    }

    User.findByIdAndUpdate(req.user._id,{
        $set:{
            fullName,
            email,
        }
    },{
        new:true
    }).select("-password ")


    return res.status(200).json(new ApiResponse(200,{},"Account details updated successfully"))

})
const UpdateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.files?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Failed to upload avatar")
    }
    const user =await User.findByIdAndUpdate(req.user._id,{
        $set:{
            avatar:avatar.url
        }
    },{
        new:true
    })
    .select("-password ")
    return res.status(200).json(new ApiResponse(200,user,"Avatar updated successfully"))
})
const UpdateUserCoverAvatar=asyncHandler(async(req,res)=>{
    const CoverImageLocalPath=req.files?.path
    if(!CoverImageLocalPath){
        throw new ApiError(400,"Coverimage file is required")
    }
    const coverImage=await uploadOnCloudinary(CoverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Failed to upload avatar")
    }
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            coverImage:coverImage.url
        }
    },{
        new:true
    })
    .select("-password ")
})
const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params
    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }
    const channel=await aggregate([
        { 
            $match:{
                username:username.toLowerCase()
        
            }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                }
            },{
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscriberTo"
                }
            },{
                $addFields:{
                    subscriberscount:{
                        $size:"$subscribers"

                    },
                    channelSubscriberToCount:{
                        $size:"$subscriberTo"
                    },
                    isSubsribed:{
                        $cond:{
                            if:{$in:[req.user?._id,"subscribers.subscriber"]},
                            then:true,
                            else:fasle
                        }
                    }
                }
            },
            {
                $project:{
                    fullName:1,
                    username:1,     
                    subscriberscount:1,
                    channelSubscriberToCount:1,
                    isSubcribed:1,
                    avatar :1,  
                    coverImage:1,   
                    email:1,
                    createdAt:1,
                    updatedAt:1
                }
            }
        
    ])
    console.log(channel)
    if(!channel?.length){
        throw new ApiError(404,"Channel not found")
    }
    return res.status(200)
    .json(new ApiResponse(200,channel[0],"Channel details fetched successfully"))
})
return res.status(200).json(new ApiResponse(200,{},"Cover image updated successfully"))


const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new moongose.Types.ObjectId(req.user._id)
            }
        },      
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $projects:{
                                        
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $project:{
                _id:0,
                watchHistory:1
            }
        }
    ])
    console.log(user)   
})
export { registerUser ,loginUser,logoutUser,refreshAccessToken,getCurrentUser,updateAccountDetails,UpdateUserAvatar,changeCurrentPassword,UpdateUserCoverAvatar,getUserChannelProfile,getWatchHistory};              
