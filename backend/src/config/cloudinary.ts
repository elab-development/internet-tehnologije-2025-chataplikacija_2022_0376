import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("--- CLOUDINARY DEBUG ---");
console.log("Cloud Name:", cloudinary.config().cloud_name);
console.log("API Key:", cloudinary.config().api_key);
const secret = cloudinary.config().api_secret || "";
console.log("Secret Start:", secret.substring(0, 3) + "..."); 
console.log("Secret Length:", secret.length);
console.log("------------------------");

export const uploadToCloudinary = (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'auto' }, 
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(buffer);
  });
};