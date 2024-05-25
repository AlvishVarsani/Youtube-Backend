import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //uploading the files to the cloudinary 

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            invalidate: true
        })

        // files has been upload sucessfully 
        // console.log("Files has been uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    }
    catch (error) {
        
        fs.unlinkSync(localFilePath) //this is use because the files in the locally server has to be remove the files 
        return null
    }
}

const deleteFileFromCloudinary = async (filePathToBeDelete) => {
    try {
        if (!filePathToBeDelete) {
            console.log("FilePathToBeDelete is required");
            return null;
        }
        const responce = await cloudinary.uploader.destroy(filePathToBeDelete);
        return responce  
    } catch (error) {
        return null 
    }
}
export { uploadOnCloudinary ,deleteFileFromCloudinary }