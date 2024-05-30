import mongoose from "mongoose"
import { Video } from "../models/videos.model.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/users.model.js";




// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
//     //TODO: get all videos based on query, sort, pagination
// })

const uploadVideo = asyncHandler(async (req, res) => {
    
    const { title, description,isPublished} = req.body
    // TODO: get video, upload to cloudinary, create video
    console.log(title);
    console.log(description);
    
    // 
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required in video controller");
    }
    if(!isPublished){
            throw new ApiError(400,"isPublished is required")
        }
    try {
        const exitedVideo = await Video.findOne(
            {
                $or: [{ title:title.trim() }, { description:description.trim() }]
            }
        )
        if(exitedVideo){
            throw new ApiError(400,"This title or description video exited")
        }
        
        const thumbnailLocalPath=req.files?.thumbnail[0]?.path;
        const videoLocalPath = req.files?.videoFile[0]?.path;
        console.log(thumbnailLocalPath);

        if(!thumbnailLocalPath ||!videoLocalPath){
            throw new ApiError(400,"Thumbnail and video are required")
        }

        const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)
        const video=await uploadOnCloudinary(videoLocalPath)

        if(!thumbnail || !video){
            throw new ApiError(400,"Error while uploading video on Cloudinary")
        }
    
        const newVideo=await Video.create({
            title,
            description,
            duration: video?.duration || null,
            thumbnail: thumbnail?.url || null,
            videoFile: video?.url || null,
            isPublished,
            owner: new mongoose.Types.ObjectId(req.user._id),
            views: 0,
        })

        if(!newVideo){
            throw new ApiError(500, "Error while uploading video");
        }

        res
            .status(201)
            .json(new ApiResponse(200, newVideo, "Video uploaded successfully"));
        
    } catch (error) {
        throw new ApiError(500,error.message ||"Somthing went wrong while uploading video")
    }

})

const getChannalsVideo = asyncHandler(async (req, res) => {
    const { username } = req.params;

    try {
        const userId = await User.findOne({ username }).select("_id");

        if (!userId) {
            throw new ApiError(404, "User not found");
        }

        const videos = await Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId),
                    isPublished: true,
                },
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    thumbnail: 1,
                    videoFile: 1,
                    duration: 1,
                    views: 1,
                    createdAt: 1,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
        ]);

        if (!videos) {
            throw new ApiError(404, "Videos not found");
        }

        res
            .status(200)
            .json(new ApiResponse(200, videos, "Videos are fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error.message || "Error while fetching videos");

    }
});


const deleteVideo = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findById(id);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        if (video.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(401, "Unauthorized to delete this video");
        }

        const thumbnail = video.thumbnail;
        const videoFile = video.videoFile;

        const deletedVideo = await Video.findByIdAndDelete(id);

        if (!deletedVideo) {
            throw new ApiError(500, "Error while deleting video");
        }

        await deleteFileFromCloudinary(thumbnail);
        await deleteFileFromCloudinary(videoFile);

        res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
    } catch (error) {
        throw new ApiError(500, error.message || "Error while deleting video");
    }
});

const updateTitleAndDescription = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    if ([title, description].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    try {
        const video = await Video.findById(id);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        const existingVideo = await Video.findOne({
            $or: [{ title: title.trim() }, { description: description.trim() }],
        })

        if (existingVideo) {
            throw new ApiError(409, "Video already exists with this title or description");
        }

        if (video.title.trim() === title.trim() && video.description.trim() === description.trim()) {
            throw new ApiError(400, "No changes found");
        }

        if (video.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(401, "Unauthorized to update this video");
        }

        video.title = title.trim();
        video.description = description.trim();

        const updatedVideo = await video.save().select("-createdAt -updatedAt -__v");

        if (!updatedVideo) {
            throw new ApiError(500, "Error while updating video");
        }

        res
            .status(200)
            .json(new ApiResponse(200, updatedVideo, "Video title and description updated successfully"));
    } catch (error) {
        throw new ApiError(500, error.message || "Error while updating video");

    }
});

// const getVideoById = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: get video by id
// })

// const updateVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: update video details like title, description, thumbnail

// })

// const deleteVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: delete video
// })

// const togglePublishStatus = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
// })

export {
    uploadVideo,
    getChannalsVideo,
    deleteVideo,
    updateTitleAndDescription
}