import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Allow large image uploads (up to 50MB base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Receipt OCR Extraction Endpoint
app.post('/api/extract-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', filename } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Clean base64 string if it contains data URI header
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets settings.',
      });
    }

    const promptText = `
You are a specialized medical expense claim and receipt OCR parser.
Analyze this medical receipt/invoice/bill image thoroughly and extract the required medical cost submission details.

Pay attention to:
1. "employeeName": Name of the patient or employee. Often near "Patient Name:", "Name:", "Bill To:", "Member:", "Client:". If only initials or partial name is present, extract it clearly. If not mentioned at all, use "Not Specified".
2. "clinicName": Name of the clinic, medical centre, dental clinic, specialist, hospital, or pharmacy. Typically displayed prominently at the top header or logo text.
3. "subTotal": Numerical sub-total amount before tax/GST/discounts. If only grand total is shown and GST is 0, subTotal is the grand total. If subTotal is not explicitly labeled, calculate (grandTotal - gst).
4. "gst": Numerical GST / Tax / VAT / SST amount. If 0% or none charged, return 0.
5. "grandTotal": The final net payable / paid amount.
6. "summaryOfIllness": Medical diagnosis, reason for visit, symptoms, or treatment summary (e.g., "Acute Upper Respiratory Infection", "Routine Dental Scaling & Polish", "General Outpatient Consultation for Fever & Sore Throat", "Hypertension Medication Refill", "Sprained Ankle X-Ray & Dressing"). If explicit diagnosis is absent, infer accurately from prescribed medications, doctor's notes, or consultation line items.
7. "date": Consultation or receipt date in YYYY-MM-DD format (or as close as readable).
8. "invoiceNumber": Receipt number, Invoice #, Tax Invoice #, or Bill reference number.
9. "currency": Currency symbol or abbreviation (e.g., "$", "SGD", "USD", "MYR", "EUR").
10. "lineItems": Array of itemized consultation, treatment, medication, or procedure names and amounts.
11. "confidence": "high", "medium", or "low" based on receipt legibility and field certainty.
12. "notes": Any additional relevant notes (e.g. payment mode such as Cash/VISA/NETS, medical leave/MC days if indicated, doctor name).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            employeeName: {
              type: Type.STRING,
              description: 'Name of the employee or patient',
            },
            clinicName: {
              type: Type.STRING,
              description: 'Name of the clinic, hospital, dental or medical centre',
            },
            subTotal: {
              type: Type.NUMBER,
              description: 'Sub-total amount before taxes/GST',
            },
            gst: {
              type: Type.NUMBER,
              description: 'GST / tax amount (0 if zero-rated or exempt)',
            },
            grandTotal: {
              type: Type.NUMBER,
              description: 'Grand total amount paid or payable',
            },
            summaryOfIllness: {
              type: Type.STRING,
              description: 'Summary of illness, diagnosis, symptoms, or treatment',
            },
            date: {
              type: Type.STRING,
              description: 'Date of visit or receipt (preferably YYYY-MM-DD)',
            },
            invoiceNumber: {
              type: Type.STRING,
              description: 'Receipt, invoice, or bill reference number',
            },
            currency: {
              type: Type.STRING,
              description: 'Currency symbol or ISO code (e.g. SGD, USD, RM, $)',
            },
            lineItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                },
              },
              description: 'Breakdown of line items or medicines',
            },
            confidence: {
              type: Type.STRING,
              description: 'high, medium, or low',
            },
            notes: {
              type: Type.STRING,
              description: 'Remarks, doctor name, MC days or payment method',
            },
          },
          required: [
            'employeeName',
            'clinicName',
            'subTotal',
            'gst',
            'grandTotal',
            'summaryOfIllness',
          ],
        },
      },
    });

    const rawText = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawText.trim());
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output:', rawText);
      return res.status(500).json({
        error: 'Failed to parse AI OCR response as JSON',
        raw: rawText,
      });
    }

    // Ensure default fallbacks for numbers and strings
    const result = {
      employeeName: parsedData.employeeName || 'Unknown Employee',
      clinicName: parsedData.clinicName || 'Unknown Clinic',
      subTotal: typeof parsedData.subTotal === 'number' ? parsedData.subTotal : 0,
      gst: typeof parsedData.gst === 'number' ? parsedData.gst : 0,
      grandTotal: typeof parsedData.grandTotal === 'number' ? parsedData.grandTotal : 0,
      summaryOfIllness: parsedData.summaryOfIllness || 'General Medical Consultation',
      date: parsedData.date || new Date().toISOString().split('T')[0],
      invoiceNumber: parsedData.invoiceNumber || '',
      currency: parsedData.currency || '$',
      lineItems: Array.isArray(parsedData.lineItems) ? parsedData.lineItems : [],
      confidence: parsedData.confidence || 'medium',
      notes: parsedData.notes || '',
      filename: filename || 'receipt.jpg',
    };

    // Double check sanity: if subTotal is 0 and grandTotal > 0, set subTotal = grandTotal - gst
    if (result.subTotal === 0 && result.grandTotal > 0) {
      result.subTotal = Math.max(0, +(result.grandTotal - result.gst).toFixed(2));
    }

    return res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Error during receipt OCR extraction:', err);
    return res.status(500).json({
      error: err.message || 'An error occurred during medical receipt OCR extraction.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
