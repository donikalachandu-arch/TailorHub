import { createWorker } from 'tesseract.js';
import { Database } from 'sqlite';
import { ExtractedCustomerCandidate, OCRFieldConfidence, DuplicateMatchInfo, UpperBodyMeasurements, LowerBodyMeasurements } from '../types';

export interface OCRRawOutput {
  rawText: string;
  provider: string;
  lines: Array<{ text: string; confidence: number }>;
  isAiVision?: boolean;
}

export interface LensOCRProvider {
  extractText(imageUrlOrBase64: string): Promise<OCRRawOutput>;
}

/**
 * Production Multimodal Vision OCR Provider (Google Gemini 1.5 Flash)
 * Specialized for difficult, cursive, and regional language handwritten tailoring registers.
 */
export class GeminiVisionOCRProvider implements LensOCRProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
  }

  async extractText(imageUrlOrBase64: string): Promise<OCRRawOutput> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured for Gemini Multimodal Vision OCR.');
    }

    let mimeType = 'image/jpeg';
    let base64Data = imageUrlOrBase64;

    if (imageUrlOrBase64.startsWith('data:image')) {
      const match = imageUrlOrBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const prompt = `You are a computer vision specialist transcribing physical tailoring register books and handwritten order slips.
Transcribe all text from this tailoring notebook/record sheet verbatim.
Identify:
1. Customer names and phone numbers
2. Garment types (Shirt, Pant, Kurta, Blouse, Suit, etc.)
3. All handwritten body measurements (Chest, Waist, Shoulder, Sleeve, Neck, Armhole, Length, Hip, Bottom, etc.)
4. Pricing (Total Rate, Advance, Balance)
5. Delivery dates and stitching instructions.

Output ONLY the raw transcription line by line as written on the page. Do not include markdown codeblocks or conversational filler.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini Vision API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!rawText.trim()) {
        throw new Error('Gemini Vision returned empty text from the provided image.');
      }

      const lines = rawText
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0)
        .map((text: string) => ({
          text,
          confidence: text.includes('?') ? 0.65 : 0.95
        }));

      return {
        rawText,
        provider: 'Google Gemini 1.5 Flash Multimodal Vision',
        lines,
        isAiVision: true
      };
    } catch (err: any) {
      console.error('[GeminiVisionOCRProvider] Error:', err);
      throw err;
    }
  }
}

/**
 * Real Tesseract.js OCR Computer Vision Provider
 * Extracts actual text from uploaded images, documents, and physical tailoring register books.
 * Does NOT generate fake text based on filenames.
 */
export class TesseractOCRProvider implements LensOCRProvider {
  async extractText(imageUrlOrBase64: string): Promise<OCRRawOutput> {
    try {
      let imageInput: string | Buffer = imageUrlOrBase64;
      if (imageUrlOrBase64.startsWith('data:image')) {
        const base64Data = imageUrlOrBase64.split(',')[1];
        if (base64Data) {
          imageInput = Buffer.from(base64Data, 'base64');
        }
      }

      const worker = await createWorker('eng');
      const ret = await worker.recognize(imageInput);
      await worker.terminate();

      const rawData = ret.data as any;
      const lines = ((rawData.lines || []) as any[])
        .map((l: any) => ({
          text: String(l.text || '').trim(),
          confidence: (Number(l.confidence) || 85) / 100
        }))
        .filter((l: any) => l.text.length > 0);

      const rawText = (ret.data.text || '').trim();

      if (rawText.length >= 5) {
        return {
          rawText,
          provider: 'Tesseract.js Neural Optical Character Recognition v5.0',
          lines,
          isAiVision: false
        };
      }

      throw new Error(
        'Tesseract OCR was unable to detect recognizable text. Please ensure the image is clear, well-lit, and in focus.'
      );
    } catch (err: any) {
      console.warn('[TesseractOCRProvider] Direct OCR parsing failure:', err.message);
      throw new Error(
        `OCR Processing Failed: ${err.message || 'Unable to read text from image. Please ensure the document is clear and legible.'}`
      );
    }
  }
}

export class LensExtractionService {
  private ocrProvider: LensOCRProvider;

  constructor(provider?: LensOCRProvider) {
    if (provider) {
      this.ocrProvider = provider;
    } else if (process.env.GEMINI_API_KEY && (process.env.OCR_PROVIDER === 'gemini' || !process.env.OCR_PROVIDER)) {
      this.ocrProvider = new GeminiVisionOCRProvider(process.env.GEMINI_API_KEY);
    } else {
      this.ocrProvider = new TesseractOCRProvider();
    }
  }

  getProviderInfo(): { provider: string; isAiVision: boolean } {
    if (this.ocrProvider instanceof GeminiVisionOCRProvider) {
      return { provider: 'Google Gemini 1.5 Flash Multimodal Vision', isAiVision: true };
    }
    return { provider: 'Tesseract.js Neural OCR Engine', isAiVision: false };
  }

  async processDocumentScan(imageUrlOrBase64: string): Promise<{
    rawText: string;
    provider: string;
    candidates: ExtractedCustomerCandidate[];
    isAiVision: boolean;
  }> {
    if (!imageUrlOrBase64 || !imageUrlOrBase64.trim()) {
      throw new Error('Image URL or Base64 image data is required for Lens OCR.');
    }

    const ocrResult = await this.ocrProvider.extractText(imageUrlOrBase64);
    const candidates = this.extractCandidatesFromText(ocrResult.rawText);

    return {
      rawText: ocrResult.rawText,
      provider: ocrResult.provider,
      candidates,
      isAiVision: Boolean(ocrResult.isAiVision)
    };
  }

  /**
   * Domain-specific tailoring lexer & parser.
   * Can be invoked directly with transcribed text.
   */
  extractCandidatesFromText(rawText: string): ExtractedCustomerCandidate[] {
    const segments = this.splitIntoCustomerSegments(rawText);
    const candidates: ExtractedCustomerCandidate[] = [];

    segments.forEach((seg, idx) => {
      const candidate = this.parseCustomerSegment(seg, `cand-${idx + 1}`);
      const hasRealName = candidate.name && !candidate.name.includes('Unlabeled') && !candidate.name.includes('REGISTER BOOK');
      const hasMeasurements = Object.keys(candidate.upper_body).length > 0 || Object.keys(candidate.lower_body).length > 0;
      if (hasRealName || candidate.phone || hasMeasurements) {
        candidates.push(candidate);
      }
    });

    if (candidates.length === 0) {
      candidates.push(this.parseCustomerSegment(rawText, 'cand-1'));
    }

    return candidates;
  }

  private splitIntoCustomerSegments(text: string): string[] {
    if (text.includes('----------------') || text.includes('==============')) {
      const parts = text.split(/[-=]{5,}/).map((s) => s.trim()).filter((s) => s.length > 20);
      const filteredParts = parts.filter(p => !p.startsWith('TAILOR REGISTER') || p.includes('Name:'));
      if (filteredParts.length > 0) return filteredParts;
    }

    const customerRegex = /(?:Customer\s*\d+:|Cust\s*\d+:|\bRecord\s*\d+:)/gi;
    const splitByCust = text.split(customerRegex).map((s) => s.trim()).filter((s) => s.length > 20);
    if (splitByCust.length > 1) {
      return splitByCust;
    }

    return [text];
  }

  private parseCustomerSegment(segment: string, candidateId: string): ExtractedCustomerCandidate {
    const rawLines = segment.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const confidences: Record<string, OCRFieldConfidence> = {};

    let name = '';
    let phone = '';
    let altPhone = '';
    let address = '';
    let garmentType = 'Shirt';
    let quantity = 1;
    let price = 0;
    let advance = 0;
    let balance = 0;
    let orderDate = '';
    let deliveryDate = '';
    let notes = '';
    let stitchingInstructions = '';

    const upper: UpperBodyMeasurements = {};
    const lower: LowerBodyMeasurements = {};

    const tokens: string[] = [];
    rawLines.forEach((l) => {
      tokens.push(l);
      if (l.includes('|') || l.includes(';')) {
        l.split(/[|;]/).map((t) => t.trim()).filter((t) => t.length > 0).forEach((t) => tokens.push(t));
      }
    });

    tokens.forEach((line) => {
      // 1. Name Detection
      const nameMatch = line.match(/(?:Name|Customer|Sri|Mr|Smt|Master|Client)\s*[:=-]?\s*([A-Za-z\s.]+)/i);
      if (nameMatch && !name) {
        const potentialName = nameMatch[1].replace(/Customer\s*\d+/i, '').trim();
        if (potentialName.length > 2 && !potentialName.includes('REGISTER')) {
          name = potentialName;
          const hasUncertain = name.includes('?');
          confidences.name = {
            field: 'name',
            value: name,
            confidence: hasUncertain ? 0.60 : 0.95,
            is_uncertain: hasUncertain
          };
        }
      }

      // 2. Phone Detection
      const phoneMatch = line.match(/(?:Ph|Phone|Mobile|Tel|Cell|M)\s*[:=-]?\s*([0-9?+\s-]{8,15})/i) ||
                         line.match(/\b([6-9][0-9?]{9})\b/);
      if (phoneMatch && !phone) {
        let rawPhone = phoneMatch[1].replace(/[^0-9?]/g, '');
        const hasUncertain = rawPhone.includes('?');
        if (rawPhone.length >= 10 || hasUncertain) {
          phone = rawPhone;
          confidences.phone = {
            field: 'phone',
            value: phone,
            confidence: hasUncertain ? 0.55 : 0.98,
            is_uncertain: hasUncertain
          };
        }
      }

      // Alt Phone
      const altPhoneMatch = line.match(/(?:Alt\s*Ph|Alt\s*Phone|Alternate)\s*[:=-]?\s*([0-9+\s-]{8,15})/i);
      if (altPhoneMatch && !altPhone) {
        altPhone = altPhoneMatch[1].replace(/[^0-9]/g, '');
        confidences.alternate_phone = { field: 'alternate_phone', value: altPhone, confidence: 0.92 };
      }

      // Address
      const addrMatch = line.match(/(?:Address|Addr|Location|Loc)\s*[:=-]?\s*(.+)/i);
      if (addrMatch && !address) {
        address = addrMatch[1].trim();
        confidences.address = { field: 'address', value: address, confidence: 0.88 };
      }

      // 3. Garment Type & Quantity
      const garmentMatch = line.match(/(?:Garment|Item|Dress|Order|Cloth)\s*[:=-]?\s*([A-Za-z\s]+)(?:[xX*]\s*(\d+))?/i) ||
                           line.match(/\b(Shirt|Pant|Kurta|Blouse|Suit|Safari|Sherwani|Uniform|Dress|Lehenga)\b/i);
      if (garmentMatch && (!garmentType || garmentType === 'Shirt')) {
        const gName = garmentMatch[1]?.trim();
        if (gName && !gName.startsWith('W:') && !gName.startsWith('H:')) {
          garmentType = gName;
          if (garmentMatch[2]) quantity = parseInt(garmentMatch[2], 10);
          confidences.garment_type = { field: 'garment_type', value: garmentType, confidence: 0.94 };
        }
      }

      const qtyMatch = line.match(/[xX*]\s*(\d+)|\b(\d+)\s*(?:nos|pcs|pairs)\b/i);
      if (qtyMatch) {
        quantity = parseInt(qtyMatch[1] || qtyMatch[2], 10);
      }

      // 4. Upper Body Measurements
      this.extractMeasurementValue(line, /(?:Chest|Chst|Ch|C)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!upper.chest) {
          upper.chest = val;
          confidences.chest = { field: 'chest', value: String(val), confidence: uncertain ? 0.60 : 0.94, is_uncertain: uncertain };
        }
      });

      this.extractMeasurementValue(line, /(?:Shoulder|Shld|Sh|Tera)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!upper.shoulder) {
          upper.shoulder = val;
          confidences.shoulder = { field: 'shoulder', value: String(val), confidence: uncertain ? 0.60 : 0.93, is_uncertain: uncertain };
        }
      });

      this.extractMeasurementValue(line, /(?:Sleeve|Slv|Sl|Hand|Aasteen)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!upper.sleeve) {
          upper.sleeve = val;
          confidences.sleeve = { field: 'sleeve', value: String(val), confidence: uncertain ? 0.58 : 0.92, is_uncertain: uncertain };
        }
      });

      this.extractMeasurementValue(line, /(?:Neck|Nk|N|Gala)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!upper.neck) {
          upper.neck = val;
          confidences.neck = { field: 'neck', value: String(val), confidence: uncertain ? 0.65 : 0.95, is_uncertain: uncertain };
        }
      });

      this.extractMeasurementValue(line, /(?:Armhole|AH|Arm|Muddha)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!upper.armhole) {
          upper.armhole = val;
          confidences.armhole = { field: 'armhole', value: String(val), confidence: uncertain ? 0.60 : 0.91, is_uncertain: uncertain };
        }
      });

      this.extractMeasurementValue(line, /(?:Shirt\s*L|Kurta\s*L|Length|L)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!upper.shirt_length && val > 20 && val < 50) {
          upper.shirt_length = val;
          confidences.shirt_length = { field: 'shirt_length', value: String(val), confidence: uncertain ? 0.60 : 0.92, is_uncertain: uncertain };
        }
      });

      // 5. Lower Body Measurements
      this.extractMeasurementValue(line, /(?:Waist|W|Kamar)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!lower.waist) {
          lower.waist = val;
          confidences.waist = { field: 'waist', value: String(val), confidence: uncertain ? 0.60 : 0.94, is_uncertain: uncertain };
        }
      });

      this.extractMeasurementValue(line, /(?:Hip|Seat|H)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!lower.hip) {
          lower.hip = val;
          confidences.hip = { field: 'hip', value: String(val), confidence: uncertain ? 0.60 : 0.92, is_uncertain: uncertain };
        }
      });

      this.extractMeasurementValue(line, /(?:Thigh|Th|Jhaang|Raan)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!lower.thigh) {
          lower.thigh = val;
          confidences.thigh = { field: 'thigh', value: String(val), confidence: uncertain ? 0.60 : 0.90, is_uncertain: uncertain };
        }
      });

      this.extractMeasurementValue(line, /(?:Knee|Kn|Ghutna)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!lower.knee) {
          lower.knee = val;
          confidences.knee = { field: 'knee', value: String(val), confidence: uncertain ? 0.60 : 0.89, is_uncertain: uncertain };
        }
      });

      this.extractMeasurementValue(line, /(?:Bottom|B|Morri|Mori|Pancha)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!lower.bottom) {
          lower.bottom = val;
          confidences.bottom = { field: 'bottom', value: String(val), confidence: uncertain ? 0.60 : 0.91, is_uncertain: uncertain };
        }
      });

      this.extractMeasurementValue(line, /(?:Pant\s*L|Pant\s*Length|Outseam)\s*[:=-]?\s*([0-9.]+)(\?)?/i, (val, uncertain) => {
        if (!lower.pant_length && val >= 35) {
          lower.pant_length = val;
          confidences.pant_length = { field: 'pant_length', value: String(val), confidence: uncertain ? 0.60 : 0.93, is_uncertain: uncertain };
        }
      });

      // 6. Pricing
      const priceMatch = line.match(/(?:Rate|Price|Tot|Total|Amount|Rs\.?|₹)\s*[:=-]?\s*(\d+)/i);
      if (priceMatch && !price) {
        price = parseFloat(priceMatch[1]);
        confidences.price = { field: 'price', value: String(price), confidence: 0.95 };
      }

      const advMatch = line.match(/(?:Adv|Advance)\s*[:=-]?\s*(\d+)/i);
      if (advMatch && !advance) {
        advance = parseFloat(advMatch[1]);
        confidences.advance = { field: 'advance', value: String(advance), confidence: 0.95 };
      }

      const balMatch = line.match(/(?:Bal|Balance)\s*[:=-]?\s*(\d+)/i);
      if (balMatch && !balance) {
        balance = parseFloat(balMatch[1]);
        confidences.balance = { field: 'balance', value: String(balance), confidence: 0.95 };
      } else if (price > 0 && advance > 0 && !balance) {
        balance = Math.max(0, price - advance);
      }

      // 7. Dates
      const dateMatch = line.match(/(?:Date|Order\s*Date)\s*[:=-]?\s*([0-9/.-]{8,12})/i);
      if (dateMatch && !orderDate) {
        orderDate = dateMatch[1].trim();
        confidences.order_date = { field: 'order_date', value: orderDate, confidence: 0.90 };
      }

      const delMatch = line.match(/(?:Delivery|Del|D\/D|Due)\s*[:=-]?\s*([0-9/.-]{8,12})/i);
      if (delMatch && !deliveryDate) {
        deliveryDate = delMatch[1].trim();
        confidences.delivery_date = { field: 'delivery_date', value: deliveryDate, confidence: 0.90 };
      }

      // 8. Notes
      const notesMatch = line.match(/(?:Notes|Instructions|Remarks|Style|Fabric)\s*[:=-]?\s*(.+)/i);
      if (notesMatch && !notes) {
        notes = notesMatch[1].trim();
        stitchingInstructions = notes;
        confidences.notes = { field: 'notes', value: notes, confidence: 0.90 };
      }
    });

    if (!name) {
      name = 'Customer (Unlabeled Entry)';
      confidences.name = { field: 'name', value: name, confidence: 0.50, is_uncertain: true };
    }

    if (!garmentType) {
      garmentType = upper.chest ? 'Shirt' : 'Pant';
    }

    // Attach human verification hint for low-confidence fields (< 0.70)
    Object.keys(confidences).forEach((key) => {
      const fieldConf = confidences[key];
      if (fieldConf && (fieldConf.confidence < 0.70 || fieldConf.is_uncertain)) {
        fieldConf.is_uncertain = true;
        (fieldConf as any).verification_hint = 'Please verify this measurement';
      }
    });

    const confValues = Object.values(confidences).map((c) => c.confidence);
    const overallConfidence = confValues.length > 0
      ? Number((confValues.reduce((a, b) => a + b, 0) / confValues.length).toFixed(2))
      : 0.85;

    return {
      candidate_id: candidateId,
      name,
      phone,
      alternate_phone: altPhone || undefined,
      address: address || undefined,
      garment_type: garmentType,
      quantity,
      order_date: orderDate || '2023-08-15',
      delivery_date: deliveryDate || undefined,
      price,
      advance,
      balance,
      stitching_instructions: stitchingInstructions || undefined,
      notes: notes || undefined,
      upper_body: upper,
      lower_body: lower,
      confidence: confidences,
      overall_confidence: overallConfidence
    };
  }

  private extractMeasurementValue(
    text: string,
    regex: RegExp,
    setter: (val: number, isUncertain: boolean) => void
  ) {
    const match = text.match(regex);
    if (match) {
      const num = parseFloat(match[1]);
      const uncertain = !!match[2] || text.includes(`${match[1]}?`);
      if (!isNaN(num) && num > 0 && num < 100) {
        setter(num, uncertain);
      }
    }
  }

  async checkDuplicateCustomer(
    tailorId: string,
    phone: string,
    name: string,
    db: Database
  ): Promise<DuplicateMatchInfo> {
    if (!phone && !name) {
      return { is_duplicate: false };
    }

    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

    if (cleanPhone.length >= 8) {
      const existingUser = await db.get(
        `SELECT u.id, u.name, u.phone, u.email
         FROM users u
         JOIN customers c ON c.user_id = u.id
         WHERE c.tailor_id = ? AND (u.phone LIKE ? OR u.phone LIKE ?)`,
        [tailorId, `%${cleanPhone}%`, `%${cleanPhone.slice(-8)}%`]
      );

      if (existingUser) {
        const orderCount = await db.get(
          'SELECT COUNT(*) as cnt FROM orders WHERE customer_id = ? AND tailor_id = ?',
          [existingUser.id, tailorId]
        );
        const lastMeas = await db.get(
          'SELECT created_at FROM measurements WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1',
          [existingUser.id]
        );

        return {
          is_duplicate: true,
          match_type: 'EXACT_PHONE',
          existing_customer: {
            id: existingUser.id,
            name: existingUser.name,
            phone: existingUser.phone,
            email: existingUser.email,
            total_orders: orderCount?.cnt || 0,
            last_measurement_date: lastMeas?.created_at
          }
        };
      }
    }

    if (name && name.length >= 4) {
      const existingUserByName = await db.get(
        `SELECT u.id, u.name, u.phone, u.email
         FROM users u
         JOIN customers c ON c.user_id = u.id
         WHERE c.tailor_id = ? AND LOWER(u.name) = ?`,
        [tailorId, name.toLowerCase().trim()]
      );

      if (existingUserByName) {
        const orderCount = await db.get(
          'SELECT COUNT(*) as cnt FROM orders WHERE customer_id = ? AND tailor_id = ?',
          [existingUserByName.id, tailorId]
        );

        return {
          is_duplicate: true,
          match_type: 'NAME_SIMILARITY',
          existing_customer: {
            id: existingUserByName.id,
            name: existingUserByName.name,
            phone: existingUserByName.phone,
            email: existingUserByName.email,
            total_orders: orderCount?.cnt || 0
          }
        };
      }
    }

    return { is_duplicate: false };
  }
}
