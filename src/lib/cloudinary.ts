import axios from 'axios';

const CLOUDINARY_UPLOAD_PRESET = 'ballotbase_candidate';
const CLOUDINARY_CLOUD_NAME = 'drugoojpa';
const CLOUDINARY_API_URL = 'https://api.cloudinary.com/v1_1';

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await axios.post(
            `${CLOUDINARY_API_URL}/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};