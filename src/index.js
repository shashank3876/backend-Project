import dotenv from "dotenv"
import connectDB from "./db/index.js";
import mongoose from "mongoose"
import { DB_NAME  } from "./constant.js";


dotenv.config({
    path:'./env'
})


connectDB()






// import express from "express"
// const app=express();


// ;(async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",()=>{
//             console.log("Error",error)
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`App is litening on port ${process.env.PORT}`);
//         })
//     }catch(error){
//         console.error("error:",error);
//         throw error
//     }

// })()

