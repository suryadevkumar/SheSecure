import mongoose from "mongoose";

const userSchema=mongoose.Schema(
    {
        firstName:{
            required:true,
            type:String,
            trim:true,
        },
        lastName:{
            required:true,
            type:String,
            trim:true,
        },
        email:{
            type:String,
            required:true,
            trim:true,
        },
        mobileNumber:{
            type:Number,
            required:true,
        },
        accountType:{
            type:String,
            enum:["User","counselor","Admin"],
            required:true,
        },
        additionalDetails:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Profile",
        },
        dob:{
            type:Date,
            required:true,
        }
    }
);

export default mongoose.model("User",userSchema);