import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import { Schema } from "mongoose";
const videoSchema=new mongoose(
    {
        videosFile:{
            type:String,
             //cloudinary URL
             required:true
        },
        thumbnail:{
            type:String,
            //cloudinary URL
            required:true
        },
        title:{
            type:String,
            required:true,
        
        },
        desription:{
            type:String,
            required:true,
        
        },
        duration:{
            type:Number,
            required:true,
        },
        views:{
            type:Number,
            default:true
        },
        isPublished:{
            type:Boolean,
            default:false
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    },
    {
        timestamps:true
    }
)
videoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoSchema)