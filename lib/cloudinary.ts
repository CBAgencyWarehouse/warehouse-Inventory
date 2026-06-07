import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  file: File,
  folder: string = "inventory"
): Promise<string> => {
  // File ko arrayBuffer aur phir Buffer mein convert karna taaki upload ho sake
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          // Cloudinary ka secure URL return karein jo DB mein save hoga
          resolve(result?.secure_url || "");
        }
      )
      .end(buffer);
  });
};

export default cloudinary;