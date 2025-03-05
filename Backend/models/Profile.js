

const mongoose=require("mongoose");

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

module.exports=mongoose.model("Profile",profileSchema);