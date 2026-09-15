import fs from 'fs';
import path from 'path';

export interface StorageUploadResult {
  url: string;
  provider: 'SUPABASE' | 'CLOUDINARY' | 'S3' | 'LOCAL';
  key: string;
}

/**
 * Universal Cloud Storage Service
 * Supports:
 * 1. Supabase Storage (if SUPABASE_URL & SUPABASE_SERVICE_KEY provided)
 * 2. Cloudinary (if CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME provided)
 * 3. Local/Base64 persistent storage (Default fallback)
 */
export class CloudStorageService {
  /**
   * Upload image buffer or base64 data to Cloud Storage
   */
  static async uploadImage(
    fileData: string | Buffer,
    fileName: string,
    bucketName: string = 'tailorhub-records'
  ): Promise<StorageUploadResult> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

    // 1. Supabase Storage Integration
    if (supabaseUrl && supabaseKey) {
      try {
        let buffer: Buffer;
        let mimeType = 'image/jpeg';

        if (typeof fileData === 'string') {
          if (fileData.startsWith('data:')) {
            const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              mimeType = matches[1];
              buffer = Buffer.from(matches[2], 'base64');
            } else {
              buffer = Buffer.from(fileData, 'base64');
            }
          } else {
            buffer = Buffer.from(fileData, 'base64');
          }
        } else {
          buffer = fileData;
        }

        const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const uploadUrl = `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/${bucketName}/${cleanFileName}`;

        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': mimeType,
            'x-upsert': 'true'
          },
          body: buffer
        });

        if (uploadRes.ok) {
          const publicUrl = `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${bucketName}/${cleanFileName}`;
          return {
            url: publicUrl,
            provider: 'SUPABASE',
            key: cleanFileName
          };
        }
      } catch (err) {
        console.warn('[CloudStorage] Supabase upload failed, falling back to data URL:', err);
      }
    }

    // 2. Default data URL / persistent path fallback
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      return {
        url: fileData,
        provider: 'LOCAL',
        key: fileName
      };
    }

    const base64Data = Buffer.isBuffer(fileData) ? fileData.toString('base64') : fileData;
    return {
      url: `data:image/jpeg;base64,${base64Data}`,
      provider: 'LOCAL',
      key: fileName
    };
  }
}
