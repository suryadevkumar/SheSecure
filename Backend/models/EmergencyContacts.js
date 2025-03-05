



const mongoose=require("mongoose");

const emergencyContactsSchema=mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        contactNumber:{
            type:Number,
            required:true,
        },
    }
);

module.exports=mongoose.model("EmergencyContacts",emergencyContactsSchema);