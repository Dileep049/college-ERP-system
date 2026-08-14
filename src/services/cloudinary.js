/**
 * Cloudinary Unsigned Upload Service
 * Provides frontend file uploads to Cloudinary without exposing API secrets.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'college-erp-system';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'college_erp_preset';

/**
 * Uploads a file directly to Cloudinary using unsigned upload.
 * @param {File|Blob} file - The file to upload.
 * @param {string} folder - Destination folder on Cloudinary (e.g., 'college-erp/assignments').
 * @returns {Promise<{url: string, publicId: string, originalName: string, resourceType: string}>}
 */
export const uploadFileToCloudinary = async (file, folder = 'college-erp/uploads') => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Validate file size (Max 50MB)
  const MAX_SIZE_BYTES = 50 * 1024 * 1024;
  if (file.size && file.size > MAX_SIZE_BYTES) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 50 MB limit.`);
  }

  // Determine resource type
  let resourceType = 'auto';
  const fileType = file.type || '';
  if (fileType.startsWith('image/')) {
    resourceType = 'image';
  } else if (fileType.startsWith('video/') || fileType.startsWith('audio/')) {
    resourceType = 'video';
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || UPLOAD_PRESET;

  console.log(`[Cloudinary] Starting upload for ${file.name} to folder "${folder}" (preset: ${uploadPreset})`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (folder) {
    formData.append('folder', folder);
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  try {
    let response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    let data = await response.json();

    // Fallback: If 'auto' or 'image' fails for PDFs/raw documents, retry with 'raw' endpoint
    if (!response.ok && resourceType !== 'raw') {
      console.warn(`[Cloudinary] ${resourceType} endpoint returned error. Retrying with 'raw' endpoint...`);
      const rawUploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
      response = await fetch(rawUploadUrl, {
        method: 'POST',
        body: formData
      });
      data = await response.json();
    }

    if (!response.ok || data.error) {
      const errorMsg = data.error?.message || response.statusText || 'Cloudinary upload failed';
      console.error('[Cloudinary] Upload failed:', errorMsg);
      throw new Error(`Cloudinary upload failed: ${errorMsg}`);
    }

    console.log('[Cloudinary] Upload successful. URL:', data.secure_url || data.url);

    return {
      url: data.secure_url || data.url,
      publicId: data.public_id,
      originalName: file.name || 'file',
      resourceType: data.resource_type || resourceType
    };
  } catch (err) {
    console.error('[Cloudinary] Exception during upload:', err);
    throw new Error(err.message || 'File upload failed. Please try again.');
  }
};
