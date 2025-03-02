import dotenv from "dotenv"
import connectDB from "./db/index.js";
import mongoose from "mongoose"
import { DB_NAME  } from "./constant.js";


dotenv.config({
    path:'./env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 80000 ,()=>{
        console.log(`App is litening on port ${process.env.PORT}`);
    })
    app.on("error",(error)=>{
        console.log("Error",error)
        throw error
    }
    )
})
.catch((err)=>{
    console.log("Error",err)
    
})






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

