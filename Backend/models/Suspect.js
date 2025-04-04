import mongoose from "mongoose";

const suspectSchema = new mongoose.Schema(
    {
        suspectPhoto:{
            type:String,
        },
        suspectName:{
            type:String
        },
        suspectGender:{
            type:String
        }
    }
);

export default mongoose.model('Suspect', suspectSchema);

