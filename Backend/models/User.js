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
      userType:{
          type:String,
          enum:["User","Counsellor","Admin","SuperAdmin"],
          required:true,
      },
      additionalDetails:{
          type:mongoose.Schema.Types.ObjectId,
          required:true,
          ref:"Profile",
      },
      qualification:[
          {
              type:mongoose.Schema.Types.ObjectId,
              ref:"Qualification"
          }
      ],
      approved:{
          type:String,
          enum:["Unverified","Verified","Blocked"],
          required:true,
      },
      assignedAdmin:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"User",
      },
      token: {
          type : String,
      }
  }, 
  { timestamps: true }
);

export default mongoose.model("User", userSchema);