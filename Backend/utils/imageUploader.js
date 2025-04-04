import cloudinary from 'cloudinary';

// Initialize as v2 (your way also works)
const cloudinaryV2 = cloudinary.v2;

export const uploadImageToCloudinary = async(file,folder,height=null,quality=null)=>{
    const options = {folder};

    if(height){
        options.height= height;
    }
    if(quality){
        options.quality= quality;
    }

    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}