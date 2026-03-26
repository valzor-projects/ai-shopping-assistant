import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

// Configure Cloudinary with credentials from env
cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
});

// Export the configured cloudinary instance for use in other modules
export default cloudinary;