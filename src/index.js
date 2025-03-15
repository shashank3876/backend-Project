import dotenv from "dotenv"
import connectDB from "./db/index.js";
import express from "express"
import {app}from "./app.js"

dotenv.config({
    path:'../env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 80000 ,()=>{
        console.log(`App is litening on port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Error occured 2",err)
    
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

