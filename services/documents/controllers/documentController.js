import multer from 'multer';
import OpenAI from 'openai';
import s3 from '../config/s3.js';
import { producer } from '../config/kafka.js';

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.GEMINI_BASE_URL
});

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadDocument = async (req, res) => {
  try {
    const { loadId, documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const key = `${req.user.tenantId || 'default'}/${loadId}/${documentType}_${Date.now()}_${req.file.originalname}`;
    
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const s3Result = await s3.upload(uploadParams).promise();
    console.log(`File uploaded to S3: ${s3Result.Location}`);

    console.log('Sending to Gemini for extraction...');

    // Mock extraction — replace with real AI when OpenAI credits available
    const extractedData = {
      shipperName: "Ontario Auto Parts Ltd",
      consigneeName: "Pacific Distribution Inc",
      pickupCity: "Toronto",
      deliveryCity: "Vancouver",
      commodity: "Automotive parts",
      weight: "50000 lbs",
      proNumber: "PRO-2024-88234",
      signaturePresent: true
    };

    console.log('AI extraction complete (mock):', extractedData);

    await producer.send({
      topic: 'document.processed',
      messages: [
        {
          value: JSON.stringify({
            loadId,
            documentType,
            s3Key: key,
            s3Url: s3Result.Location,
            extractedData,
            processedAt: new Date()
          })
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and processed',
      s3Url: s3Result.Location,
      extractedData
    });

  } catch (error) {
    console.error('Document processing error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getPresignedUrl = async (req, res) => {
  try {
    const { key } = req.params;
    
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: decodeURIComponent(key),
      Expires: 3600
    });

    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};