import { z } from 'zod';
import { Database } from 'sqlite';
import { AIStyleInput, AIStyleRecommendation } from '../types';

// Zod Schema for Structured Validation
export const AIStyleResponseSchema = z.object({
  title: z.string().min(3),
  neck_design: z.string().min(3),
  sleeve_design: z.string().min(3),
  pattern_suggestion: z.string().min(3),
  color_combination: z.string().min(3),
  occasion_suitability: z.string().min(3),
  styling_tips: z.array(z.string()).min(1),
  fabric_recommendation: z.string().optional(),
  provider: z.string().default('Bespoke Fashion Ontology Engine'),
  is_ai_generated: z.boolean().default(false)
});

export type AIStyleStructuredResponse = z.infer<typeof AIStyleResponseSchema>;

export class AIStyleService {
  private geminiApiKey?: string;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
  }

  getProviderStatus(): {
    isConfigured: boolean;
    provider: string;
    model: string;
    mode: 'LIVE_LLM' | 'RULE_ONTOLOGY_FALLBACK';
  } {
    const isConfigured = Boolean(this.geminiApiKey && this.geminiApiKey.length > 10);
    return {
      isConfigured,
      provider: isConfigured ? 'Google Gemini' : 'Bespoke Fashion Ontology (Rule Engine)',
      model: isConfigured ? 'gemini-1.5-flash' : 'ontology-v2.0',
      mode: isConfigured ? 'LIVE_LLM' : 'RULE_ONTOLOGY_FALLBACK'
    };
  }

  /**
   * Generate style recommendation considering garment, occasion, fabric, fit, and styling preferences
   */
  async generateStyleRecommendation(
    input: AIStyleInput,
    customerId: string,
    orderId?: string,
    options: { strictAi?: boolean } = {}
  ): Promise<AIStyleStructuredResponse> {
    const garmentLower = (input.garment || 'shirt').toLowerCase();
    const occasionLower = (input.occasion || 'casual').toLowerCase();

    // 1. Live LLM Integration (Google Gemini API) if configured
    if (this.geminiApiKey) {
      try {
        const prompt = `You are a master bespoke tailor and fashion design director.
Provide professional tailoring and design recommendations for the following client request:
Garment Type: ${input.garment}
Occasion: ${input.occasion}
Color Preference: ${input.color_preference || 'Complementary tone'}
Neck / Collar Preference: ${input.neck_preference || 'Standard'}
Sleeve Preference: ${input.sleeve_preference || 'Standard'}
Fit Preference: ${input.fit_preference || 'Tailored / Slim'}
Fabric: ${input.fabric || 'Client choice / Premium mill'}
Client Notes: ${input.notes || 'None'}

Return ONLY a valid JSON object matching this schema:
{
  "title": "string",
  "neck_design": "string",
  "sleeve_design": "string",
  "pattern_suggestion": "string",
  "color_combination": "string",
  "occasion_suitability": "string",
  "styling_tips": ["string", "string", "string"],
  "fabric_recommendation": "string"
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsed = JSON.parse(candidateText);
            const validated = AIStyleResponseSchema.safeParse({
              ...parsed,
              provider: 'Google Gemini 1.5 Flash LLM',
              is_ai_generated: true
            });
            if (validated.success) {
              return validated.data;
            }
          }
        }
      } catch (err) {
        console.warn('[AIStyleService] Live Gemini inference error:', err);
        if (options.strictAi) {
          throw new Error('AI Style Assistant service is currently unavailable. Please try again later.');
        }
      }
    }

    if (options.strictAi && !this.geminiApiKey) {
      throw new Error(
        'Generative AI Style Assistant is not configured. GEMINI_API_KEY environment variable is required for generative LLM responses.'
      );
    }

    // 2. High Precision Tailoring Fashion Ontology Rule Engine (Explicitly Labelled as Rule-Based)
    return this.generateOntologyRecommendation(garmentLower, occasionLower, input);
  }

  private generateOntologyRecommendation(
    garment: string,
    occasion: string,
    input: AIStyleInput
  ): AIStyleStructuredResponse {
    if (garment.includes('kurta') || garment.includes('sherwani')) {
      return {
        title: occasion.includes('wedding') ? 'Royal Heritage Asymmetric Kurta' : 'Contemporary Bandhgala Kurta',
        neck_design: input.neck_preference || 'Mandarin collar with contrast thread piping and antique metallic buttons',
        sleeve_design: input.sleeve_preference || 'Full sleeve with 2.5-inch French cuff and concealed button placket',
        pattern_suggestion: occasion.includes('wedding') ? 'Subtle self-jacquard silk with tone-on-tone embroidery' : 'Solid linen-silk blend with side concealed slit',
        color_combination: input.color_preference || 'Deep Ivory with Raw Silk Antique Gold accents and churidar pairing',
        occasion_suitability: `Perfect for ${occasion || 'festive celebrations'}, family functions, and evening galas`,
        styling_tips: [
          'Pair with mojris in matching raw silk or antique tan leather',
          'Add a folded silk pocket square for a regal touch',
          'Opt for churidar or straight pants with a 1.5-inch hem break'
        ],
        fabric_recommendation: 'Pure Tussar Silk or 80-count Linen with hand-spun cotton lining',
        provider: 'Bespoke Fashion Ontology Engine (Rule-based)',
        is_ai_generated: false
      };
    }

    if (garment.includes('blouse') || garment.includes('saree')) {
      return {
        title: 'Artisanal Designer Cut Blouse',
        neck_design: input.neck_preference || 'Deep U-Neck with handmade Potli buttons and lace detailing',
        sleeve_design: input.sleeve_preference || 'Elbow-length sleeves with delicate scalloped gold border',
        pattern_suggestion: 'Handcrafted Zari embroidery on Raw Silk or Velvet base',
        color_combination: input.color_preference || 'Royal Crimson with Gold brocade borders',
        occasion_suitability: `Ideal for ${occasion || 'weddings'}, traditional pujas, and reception functions`,
        styling_tips: [
          'Ensure 4-inch back tie-up latkans with matching pearls',
          'Include princess cut darting for seamless bust contouring',
          'Reinforce neckline with canvas fusing to preserve sharp shape'
        ],
        fabric_recommendation: 'Raw Mulberry Silk with pure cotton canvas inner fusing',
        provider: 'Bespoke Fashion Ontology Engine (Rule-based)',
        is_ai_generated: false
      };
    }

    if (garment.includes('suit') || garment.includes('blazer') || garment.includes('coat')) {
      return {
        title: 'Bespoke Executive Tailored Suit',
        neck_design: input.neck_preference || '3.25-inch Notch Lapel with subtle hand-stitched pick detailing',
        sleeve_design: input.sleeve_preference || 'Structured sleeve with 4 kissing horn buttons on working cuff',
        pattern_suggestion: 'Super 120s Italian wool in micro-herringbone or solid matte twill',
        color_combination: input.color_preference || 'Midnight Navy paired with Crisp White poplin and Burgundy silk tie',
        occasion_suitability: `Tailored for ${occasion || 'formal corporate affairs'}, black-tie events, and upscale dinners`,
        styling_tips: [
          'Jacket should cover seat with a double vent for mobility and drape',
          'Trousers tailored with slight break and 1.5-inch bottom cuff',
          'Use genuine cupro lining for breathable thermal comfort'
        ],
        fabric_recommendation: 'Super 130s Merino Wool with natural horsehair canvas chest piece',
        provider: 'Bespoke Fashion Ontology Engine (Rule-based)',
        is_ai_generated: false
      };
    }

    // Default Sharp Tailored Shirt / Pant
    return {
      title: `Custom Bespoke ${input.garment || 'Formal Shirt'}`,
      neck_design: input.neck_preference || 'Semi-Spread Cutaway Collar with removable brass stays',
      sleeve_design: input.sleeve_preference || 'Single round cuff with dual button placement and gauntlet button',
      pattern_suggestion: '100% 2-ply Egyptian Giza cotton with satin finish',
      color_combination: input.color_preference || 'Powder Blue with Mother-of-Pearl buttons and navy contrast stitching',
      occasion_suitability: `Engineered for ${occasion || 'daily executive wear'} and smart casual presentations`,
      styling_tips: [
        'Add 0.5-inch chest ease for effortless movement and posture comfort',
        'Back yoke split at 45-degree bias to eliminate shoulder pulling',
        'Reinforce side gussets with embroidered pentagonal fabric shields'
      ],
      fabric_recommendation: '100% 2-ply Egyptian Long-Staple Giza Cotton (120/2 yarn count)',
      provider: 'Bespoke Fashion Ontology Engine (Rule-based)',
      is_ai_generated: false
    };
  }

  /**
   * Save recommendation to database
   */
  async saveRecommendation(
    db: Database,
    customerId: string,
    orderId: string | undefined,
    inputData: AIStyleInput,
    recommendation: AIStyleStructuredResponse
  ): Promise<AIStyleRecommendation> {
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO ai_recommendations (id, customer_id, order_id, input_data, recommendation, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      customerId,
      orderId || null,
      JSON.stringify(inputData),
      JSON.stringify(recommendation),
      now
    );

    return {
      id,
      customer_id: customerId,
      order_id: orderId,
      input_data: inputData,
      recommendation,
      created_at: now
    };
  }
}

export const aiStyleService = new AIStyleService();
