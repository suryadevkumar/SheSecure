import mongoose from "mongoose";

const witnessSchema = new mongoose.Schema(
    {
        witnessPhoto:{
            type:String,
        },
        witnessName:{
            type:String
        },
        witnessGender:{
            type:String
        },
        witnessContactNumber:{
            type:String
        },
        witnessAddress:{
            type:String
        }
    }
);

export default mongoose.model('Witness', witnessSchema);

