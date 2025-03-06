import mongoose from "mongoose";

const profileSchema=mongoose.Schema(
    {
        image:{
            type:String,
        },
        address:{
            type:String,
        },
        emergencyContacts:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"emergencyContacts",
            }
        ],
        gender:{
            type:String,
        },
        MedicalInfo:{
            type:String,
        },
    }
);

export default mongoose.model("Profile",profileSchema);