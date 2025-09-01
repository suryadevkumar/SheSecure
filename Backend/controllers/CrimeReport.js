import CrimeReport from "../models/CrimeReport.js";
import Location from "../models/Location.js";
import Suspect from "../models/Suspect.js";
import Witness from "../models/Witness.js";
import User from "../models/User.js";
import calculateDistance from "../utils/calculateDistance.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from 'cloudinary';

// Cleanup function remains the same
async function cleanupResources(resources) {
    try {
        // Delete database records in reverse creation order
        if (resources.crimeReport) {
            await CrimeReport.deleteOne({ _id: resources.crimeReport });
        }

        if (resources.witnesses.length > 0) {
            await Witness.deleteMany({ _id: { $in: resources.witnesses } });
        }

        if (resources.suspects.length > 0) {
            await Suspect.deleteMany({ _id: { $in: resources.suspects } });
        }

        if (resources.location) {
            await Location.deleteOne({ _id: resources.location });
        }

        for (const file of resources.uploadedFiles) {
            try {
                await cloudinary.uploader.destroy(file.public_id);
            } catch (cloudinaryError) {
                console.error("Failed to delete Cloudinary file:", file.public_id, cloudinaryError);
            }
        }
    } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
    }
};

// Function to assign admin in a round-robin fashion
const getNextAdmin = async () => {
    const admins = await User.find({ userType: "Admin", approved: "Verified" }).sort('_id'); // Get all admins
    if (admins.length === 0) return null; // No admins available

    // Find the last assigned report to determine the last admin
    const lastAssignedReport = await CrimeReport.findOne().sort('-createdAt');

    let lastAdminIndex = admins.some(a => a._id.equals(lastAssignedReport?.assignedAdmin))
        ? admins.findIndex(a => a._id.equals(lastAssignedReport.assignedAdmin))
        : -1;

    // Select the next admin in a round-robin manner
    const nextAdminIndex = (lastAdminIndex + 1) % admins.length;
    return admins[nextAdminIndex]._id;
};

//Controller for reporting a crime
export const reportCrime = async (req, res) => {
    const createdResources = {
        location: null,
        suspects: [],
        witnesses: [],
        crimeReport: null,
        uploadedFiles: []
    };

    try {
        // Validate basic required fields
        const { typeOfCrime, description, dateOfCrime, longitude, latitude, displayName, formattedAddress } = req.body;
        const requiredFields = { typeOfCrime, description, dateOfCrime, longitude, latitude };

        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value) {
                await cleanupResources(createdResources);
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`
                });
            }
        }

        // Parse array data with validation
        let suspects = [];
        let witnesses = [];

        try {
            suspects = req.body.suspects ? JSON.parse(req.body.suspects) : [];
            witnesses = req.body.witnesses ? JSON.parse(req.body.witnesses) : [];

            if (!Array.isArray(suspects) || !Array.isArray(witnesses)) {
                await cleanupResources(createdResources);
                return res.status(400).json({
                    success: false,
                    message: 'Suspects and witnesses must be arrays'
                });
            }
        } catch (parseError) {
            await cleanupResources(createdResources);
            return res.status(400).json({
                success: false,
                message: `Invalid suspects/witnesses format: ${parseError.message}`
            });
        }

        // Create location
        try {
            const location = await Location.create({
                longitude,
                latitude,
                displayName,
                formattedAddress,
                startTime: new Date(dateOfCrime),
                endTime: new Date(dateOfCrime)
            });
            createdResources.location = location._id;
        } catch (locationError) {
            await cleanupResources(createdResources);
            return res.status(500).json({
                success: false,
                message: `Location creation failed: ${locationError.message}`
            });
        }

        // Process FIR file
        let firUrl = null;
        if (req.files?.FIR) {
            try {
                const image = await uploadToCloudinary(
                    req.files.FIR,
                    "sheSecure_crime_firCopy",
                    1000,
                    1000
                );
                firUrl = image.secure_url;
                createdResources.uploadedFiles.push({ url: firUrl, public_id: image.public_id });
            } catch (uploadError) {
                await cleanupResources(createdResources);
                return res.status(500).json({
                    success: false,
                    message: `FIR upload failed: ${uploadError.message}`
                });
            }
        }

        // Process suspects
        const suspectIds = [];
        for (const [index, suspect] of suspects.entries()) {
            try {
                let suspectPhotoUrl = null;

                if (req.files?.[`suspectPhotos[${index}]`]) {
                    const uploadedPhoto = await uploadToCloudinary(
                        req.files[`suspectPhotos[${index}]`],
                        "sheSecure_suspects",
                        500,
                        500
                    );
                    suspectPhotoUrl = uploadedPhoto.secure_url;
                    createdResources.uploadedFiles.push({
                        url: suspectPhotoUrl,
                        public_id: uploadedPhoto.public_id
                    });
                }

                // Map the incoming field names to the model field names
                const newSuspect = await Suspect.create({
                    suspectPhoto: suspectPhotoUrl,
                    suspectName: suspect.name,
                    suspectGender: suspect.gender
                });

                suspectIds.push(newSuspect._id);
                createdResources.suspects.push(newSuspect._id);
            } catch (suspectError) {
                await cleanupResources(createdResources);
                return res.status(500).json({
                    success: false,
                    message: `Failed to process suspect ${index}: ${suspectError.message}`
                });
            }
    }

        // Process witnesses
        const witnessIds = [];
        for (const [index, witness] of witnesses.entries()) {
            try {
                let witnessPhotoUrl = null;

                if (req.files?.[`witnessPhotos[${index}]`]) {
                    const uploadedPhoto = await uploadToCloudinary(
                        req.files[`witnessPhotos[${index}]`],
                        "sheSecure_witnesses",
                        500,
                        500
                    );
                    witnessPhotoUrl = uploadedPhoto.secure_url;
                    createdResources.uploadedFiles.push({
                        url: witnessPhotoUrl,
                        public_id: uploadedPhoto.public_id
                    });
                }

                // Map the incoming field names to the model field names
                const newWitness = await Witness.create({
                    witnessPhoto: witnessPhotoUrl,
                    witnessName: witness.name,               
                    witnessGender: witness.gender,    
                    witnessContactNumber: witness.contactNumber, 
                    witnessAddress: witness.address
                });

                witnessIds.push(newWitness._id);
                createdResources.witnesses.push(newWitness._id);
            } catch (witnessError) {
                await cleanupResources(createdResources);
                return res.status(500).json({
                    success: false,
                    message: `Failed to process witness ${index}: ${witnessError.message}`
                });
            }
        }

        // Process crime photos
        const crimePhotoUrls = [];
        if (req.files?.crimePhotos) {
            try {
                const photos = Array.isArray(req.files.crimePhotos)
                    ? req.files.crimePhotos
                    : [req.files.crimePhotos];

                for (const photo of photos) {
                    const uploadedPhoto = await uploadToCloudinary(
                        photo,
                        "sheSecure_crime_pictures",
                        1000,
                        1000
                    );
                    crimePhotoUrls.push(uploadedPhoto.secure_url);
                    createdResources.uploadedFiles.push({
                        url: uploadedPhoto.secure_url,
                        public_id: uploadedPhoto.public_id
                    });
                }
            } catch (photoError) {
                await cleanupResources(createdResources);
                return res.status(500).json({
                    success: false,
                    message: `Crime photo upload failed: ${photoError.message}`
                });
            }
        }
        // Process crime videos
        const crimeVideoUrls = [];
        if (req.files?.crimeVideos) {
            try {
                const videos = Array.isArray(req.files.crimeVideos)
                    ? req.files.crimeVideos
                    : [req.files.crimeVideos];

                for (const video of videos) {
                    const uploadedVideo = await uploadToCloudinary(
                        video,
                        "sheSecure_crime_videos"
                    );
                    crimeVideoUrls.push(uploadedVideo.secure_url);
                    createdResources.uploadedFiles.push({
                        url: uploadedVideo.secure_url,
                        public_id: uploadedVideo.public_id
                    });
                }
            } catch (videoError) {
                await cleanupResources(createdResources);
                return res.status(500).json({
                    success: false,
                    message: `Crime video upload failed: ${videoError.message}`
                });
            }
        }

        // Assign admin
        let assignedAdmin;
        try {
            assignedAdmin = await getNextAdmin();
        } catch (adminError) {
            await cleanupResources(createdResources);
            return res.status(500).json({
                success: false,
                message: `Admin assignment failed: ${adminError.message}`
            });
        }

        // Create final crime report
        try {
            const crimeReport = await CrimeReport.create({
                typeOfCrime,
                description,
                dateOfCrime: new Date(dateOfCrime),
                location: createdResources.location,
                status: "In Progress",
                crimePhotos: crimePhotoUrls,
                crimeVideos: crimeVideoUrls,
                FIR: firUrl,
                reportedBy: req.user._id,
                assignedAdmin,
                suspects: suspectIds,
                witnesses: witnessIds
            });
            createdResources.crimeReport = crimeReport._id;
        } catch (reportError) {
            await cleanupResources(createdResources);
            return res.status(500).json({
                success: false,
                message: `Crime report creation failed: ${reportError.message}`
            });
        }

        return res.status(201).json({
            success: true,
            message: "Crime reported successfully",
            crimeReport: {
                _id: createdResources.crimeReport,
                typeOfCrime,
                description,
                dateOfCrime,
                status: "In Progress",
                crimePhotos: crimePhotoUrls,
                crimeVideos: crimeVideoUrls,
                FIR: firUrl,
                assignedAdmin
            }
        });

    } catch (error) {
        await cleanupResources(createdResources);
        console.error("Unexpected error in crime report:", error);
        return res.status(500).json({
            success: false,
            message: "Unexpected error occurred during crime reporting"
        });
    }
};

//get All reports which is reported by a user
export const getAllReportsByUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const reports = await CrimeReport.find({ reportedBy: userId })
            .populate("location")
            .populate("assignedAdmin", "firstName lastName email")
            .populate("suspects")
            .populate("witnesses")
            .sort("-createdAt");
        return res.status(200).json({
            success: true,
            message: "All reports submitted by the user.",
            reports,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllReportsForAdmin = async (req, res) => {
    try {
        const adminId = req.user.id; // Get the logged-in admin's ID

        const reports = await CrimeReport.find({
            assignedAdmin: adminId,
        })
            .populate("location")
            .populate("reportedBy", "firstName lastName email")
            .populate("assignedAdmin", "firstName lastName email")
            .populate("suspects")
            .populate("witnesses")
            .sort("-createdAt");

        return res.status(200).json({
            success: true,
            message: "All In Progress reports assigned to this admin.",
            reports,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyCrimeReport = async (req, res) => {
    try {
        const { reportId } = req.params; // Extract report ID from URL
        // Find and update the crime report
        const crimeReport = await CrimeReport.findByIdAndUpdate(
            reportId,
            { status: "Verified" },
            { new: true }
        )
            .populate("location")
            .populate("reportedBy", "firstName lastName email")
            .populate("assignedAdmin", "firstName lastName email")
            .populate("suspects")
            .populate("witnesses");


        if (!crimeReport) {
            return res.status(404).json({ success: false, message: "Crime report not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Crime report verified successfully.",
            crimeReport,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const removeReport = async (req, res) => {
    try {
        // 1. Get the report ID from URL
        const { reportId } = req.params;

        // 2. Find the report with all its related data
        const report = await CrimeReport.findById(reportId)
            .populate('witnesses suspects');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Crime report not found"
            });
        }

        // 3. Collect all Cloudinary files to delete
        const filesToDelete = [
            ...report.crimePhotos,
            ...report.crimeVideos,
            report.FIR,
            ...report.witnesses.map(w => w.witnessPhoto).filter(Boolean),
            ...report.suspects.map(s => s.suspectPhoto).filter(Boolean)
        ];

        // 4. Delete all files from Cloudinary
        for (const fileUrl of filesToDelete) {
            if (fileUrl) {
                try {
                    // Extract public_id from Cloudinary URL
                    const publicId = fileUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error(`Failed to delete file ${fileUrl}:`, error);
                }
            }
        }

        // 5. Delete all database records
        await Promise.all([
            CrimeReport.findByIdAndDelete(reportId),
            Location.findByIdAndDelete(report.location),
            Witness.deleteMany({ _id: { $in: report.witnesses.map(w => w._id) } }),
            Suspect.deleteMany({ _id: { $in: report.suspects.map(s => s._id) } })
        ]);

        // 6. Send success response
        return res.status(200).json({
            success: true,
            message: "Report and all related data deleted successfully",
            report
        });

    } catch (error) {
        console.error("Error deleting report:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete report",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getCrimesNearLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required parameters."
            });
        }

        // Convert to numbers
        const userLat = parseFloat(latitude);
        const userLng = parseFloat(longitude);

        // Get all crime reports with populated location data
        const allCrimeReports = await CrimeReport.find()
            .populate({
                path: 'location',
                select: 'latitude longitude displayName formattedAddress'
            })
            .select('-reportedBy -assignedAdmin -__v -status -FIR -suspects -witnesses')
            .lean();

        // Calculate distance for each report and filter within 10km radius
        const crimesWithDistance = allCrimeReports.map(report => {
            if (!report.location) return null;
            
            const distance = calculateDistance(
                userLat, userLng, 
                report.location.latitude, report.location.longitude
            );
            
            return {
                ...report,
                distance
            };
        }).filter(report => report !== null && report.distance <= 10);

        // Sort by distance (nearest first)
        crimesWithDistance.sort((a, b) => a.distance - b.distance);

        // Transform the data to include only needed fields plus distance
        const result = crimesWithDistance.map(crime => ({
            _id: crime._id,
            typeOfCrime: crime.typeOfCrime,
            description: crime.description,
            crimePhotos: crime.crimePhotos,
            crimeVideos: crime.crimeVideos,
            likeCount: crime.likeCount,
            unlikeCount: crime.unlikeCount,
            createdAt: crime.createdAt,
            distance: crime.distance,
            location: {
                displayName: crime.location.displayName,
                formattedAddress: crime.location.formattedAddress,
                latitude: crime.location.latitude,
                longitude: crime.location.longitude
            }
        }));

        return res.status(200).json({
            success: true,
            message: "Crimes within 10km radius sorted by distance",
            count: result.length,
            crimes: result
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
