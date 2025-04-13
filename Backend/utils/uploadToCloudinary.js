import cloudinary from 'cloudinary';
const cloudinaryV2 = cloudinary.v2;

export const uploadToCloudinary = async (file, folder, height, quality) => {
    const options = {
        folder,
        resource_type: "auto"
    };

    if (file.mimetype && file.mimetype.startsWith("image/")) {
        if (height) options.height = height;
        if (quality) options.quality = quality;
        options.crop = "scale";
    }

    return await cloudinaryV2.uploader.upload(file.tempFilePath, options);
};