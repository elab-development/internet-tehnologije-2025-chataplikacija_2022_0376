// controllers/uploadController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import { uploadToCloudinary } from '../config/cloudinary';

// Multer config (čuvaj fajl u memoriji, ne na disku)
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Dozvoljeni tipovi fajlova
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tip fajla nije podržan'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
  },
});

/**
 * Upload fajla na Cloudinary
 * POST /api/upload
 */
export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📤 [UPLOAD] Request received');

    if (!req.file) {
      console.log('❌ [UPLOAD] No file provided');
      return res.status(400).json({ message: 'Nema fajla za upload' });
    }

    console.log('📂 [UPLOAD] File info:', {
      name: req.file.originalname,
      size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      mimeType: req.file.mimetype,
    });

    // Pozivamo funkciju samo sa buffer-om
    const result = await uploadToCloudinary(req.file.buffer);

    console.log('✅ [UPLOAD] File uploaded to Cloudinary:', result.secure_url);

    // Odredi tip poruke na osnovu resource_type-a
    let messageType = 'file';
    if (result.resource_type === 'image') {
      messageType = req.file.mimetype === 'image/gif' ? 'gif' : 'image';
    } else if (result.resource_type === 'video') {
      messageType = 'video';
    }

    res.json({
      success: true,
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      mimeType: req.file.mimetype,
      messageType,
      cloudinaryData: {
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
      },
    });
  } catch (error: any) {
    console.error('❌ [UPLOAD] Error:', error.message);
    res.status(500).json({
      message: 'Greška pri upload-u fajla',
      error: error.message,
    });
  }
};