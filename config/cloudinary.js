
import { v2 as cloudinary } from 'cloudinary';
 import fs from "fs"
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
  secure: true,
});

 export const uploadfile_2_cloudinary=async(multer_path,type)=>{
    try {

        const result = await cloudinary.uploader.upload(multer_path, { resource_type: 'auto' });
         fs.unlinkSync(multer_path)              
         const link=result.url;
         return link;
      } catch (error) {

        console.error(error);
        return false;

      }
}


