/**
 * Cloudinary & Firebase Storage Multi-Tier Upload Service
 * Provides robust file uploads with Cloudinary and Firebase Storage fallback.
 */
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const cleanStr = (val, defaultVal = '') => {
  if (!val) return defaultVal;
  return String(val).trim().replace(/^["']|["']$/g, '').trim() || defaultVal;
};

const getCloudName = () => cleanStr(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, 'qwpbuobv');
const getUploadPreset = () => cleanStr(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET, 'react_uploads');

/**
 * Converts a file/blob to a Base64 data URL
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a file directly to Cloudinary using unsigned upload, falling back to Firebase Storage.
 * @param {File|Blob} file - The file to upload.
 * @param {string} folder - Destination folder (e.g., 'college-erp/study-notes').
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
  } else if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
    resourceType = 'raw';
  }

  const cloudName = getCloudName();
  const uploadPreset = getUploadPreset();

  console.log(`[Storage] Uploading ${file.name || 'file'} to "${folder}" (Cloud: ${cloudName}, Preset: ${uploadPreset})`);

  // --- ATTEMPT 1: CLOUDINARY UNSIGNED UPLOAD ---
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      if (folder) {
        formData.append('folder', folder);
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
      let response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      let data = await response.json();

      // Retry with raw if auto failed for non-image
      if (!response.ok && resourceType !== 'raw') {
        console.warn(`[Cloudinary] ${resourceType} endpoint returned ${response.status}. Retrying with 'raw' endpoint...`);
        const rawUploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
        response = await fetch(rawUploadUrl, {
          method: 'POST',
          body: formData
        });
        data = await response.json();
      }

      if (response.ok && !data.error && (data.secure_url || data.url)) {
        console.log('[Cloudinary] Upload successful:', data.secure_url || data.url);
        return {
          url: data.secure_url || data.url,
          publicId: data.public_id || `cld-${Date.now()}`,
          originalName: file.name || 'file',
          resourceType: data.resource_type || resourceType
        };
      } else {
        const errorMsg = data.error?.message || response.statusText || 'Unknown Cloudinary error';
        console.warn('[Cloudinary] Cloudinary upload returned error:', errorMsg);
      }
    } catch (cldErr) {
      console.warn('[Cloudinary] Cloudinary network/request exception:', cldErr.message);
    }
  }

  // --- ATTEMPT 2: FIREBASE STORAGE FALLBACK ---
  if (storage) {
    try {
      console.log(`[Firebase Storage] Attempting Firebase Storage upload for ${file.name}...`);
      const safeName = `${Date.now()}_${(file.name || 'file').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const fileRef = ref(storage, `${folder}/${safeName}`);
      const snap = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snap.ref);
      console.log('[Firebase Storage] Upload successful:', downloadUrl);
      return {
        url: downloadUrl,
        publicId: fileRef.fullPath,
        originalName: file.name || 'file',
        resourceType: resourceType
      };
    } catch (fbErr) {
      console.warn('[Firebase Storage] Storage upload failed:', fbErr.message);
    }
  }

  // --- ATTEMPT 3: DATA URL / BASE64 FALLBACK (Guarantees no crash) ---
  try {
    console.log(`[Storage Fallback] Encoding ${file.name} to Data URL for instant preview & persistence...`);
    const dataUrl = await fileToDataUrl(file);
    return {
      url: dataUrl,
      publicId: `local-${Date.now()}`,
      originalName: file.name || 'file',
      resourceType: resourceType
    };
  } catch (dataErr) {
    console.error('[Storage Fallback] Data URL conversion failed:', dataErr);
    throw new Error('Failed to process and store file upload.');
  }
};
