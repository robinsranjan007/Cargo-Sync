import multer from 'multer';
import OpenAI from 'openai';
import s3 from '../config/s3.js';
import { producer } from '../config/kafka.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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

    // Upload to S3
    const key = `${req.user.tenantId || 'default'}/${loadId}/${documentType}_${Date.now()}_${req.file.originalname}`;
    
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const s3Result = await s3.upload(uploadParams).promise();
    console.log(`File uploaded to S3: ${s3Result.Location}`);

    // Convert to base64 for OpenAI
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Send to OpenAI for extraction
    console.log('Sending to OpenAI for extraction...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a freight document parser. Extract the following fields from this Bill of Lading or shipping document and return ONLY a JSON object with these exact keys:
              {
                "shipperName": "",
                "shipperAddress": "",
                "consigneeName": "",
                "consigneeAddress": "",
                "pickupCity": "",
                "deliveryCity": "",
                "commodity": "",
                "weight": "",
                "weightUnit": "",
                "proNumber": "",
                "poNumber": "",
                "signaturePresent": true/false
              }
              If a field is not found, use null. Return ONLY the JSON, no other text.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const extractedText = response.choices[0].message.content;
    let extractedData = {};
    
    try {
      extractedData = JSON.parse(extractedText);
    } catch (e) {
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      }
    }

    console.log('AI extraction complete:', extractedData);

    // Publish Kafka event
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