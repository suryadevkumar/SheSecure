import mongoose from "mongoose";

const qualificationSchema=mongoose.Schema(
    {
        courseName:{
            type:String,
            required:true,
        },
        percentage:{
            type:Number,
        },
        certificate:{
            type:String,
            required:true,
        }
    }
);

export default mongoose.model("Qualification", qualificationSchema);