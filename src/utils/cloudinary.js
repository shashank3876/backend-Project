// import {v2 as cloudinary} from "cloudinary"
// import fs from "fs"


// cloudinary.config({
//     cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
//     api_key:process.env.CLOUDINARY_API_KEY,
//     api_secret:process.env.CLOUDINARY_API_SECRET
// });

// const uploadOnCloudinary = async (localFilePath) => {
//     try{
//         if(!localFilePath || fs.existsSync(localFilePath))return null
//         //upload the file in directory
//         const response=await cloudinary.uploader.upload(localFilePath,{
//             resource_type: "auto"
//         })
//         console.log("file is uploaded on cloudinary",response.url);
//         return response.url;
        
//     }catch(error){
//         fs.unlinkSync(localFilePath)//remove the locally saved temprory files a s the upload get fail
//         return null;
//     }
// }


// export {uploadOnCloudinary}



import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath )return null
        //upload the file in directory
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // console.log("file is uploaded on cloudinary",response.url);
        fs.unlinkSync(localFilePath)//remove the locally saved temprory files a s the upload get fail
        return response;
        
    }catch(error){
        fs.unlinkSync(localFilePath)//remove the locally saved temprory files a s the upload get fail
        return null;
    }
}


export {uploadOnCloudinary}