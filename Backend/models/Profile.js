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
        dob:{
            type:Date,
        },
        gender:{
            type:String,
        },
        location:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Location"
            }
        ]
    }
);

export default mongoose.model("Profile",profileSchema);