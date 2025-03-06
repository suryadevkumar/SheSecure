import mongoose from "mongoose";

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

export default mongoose.model("EmergencyContacts",emergencyContactsSchema);