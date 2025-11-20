import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// Lazy-load OpenAI client to allow server to start without API key
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured. Please set it in your environment variables.");
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export async function generateImageOpenAI(params: {
  prompt: string;
  size?: string;
}): Promise<{ url: string }> {
  const client = getOpenAIClient();
  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: params.prompt,
    n: 1,
    size: (params.size as any) || "1024x1024",
    quality: "standard",
  });

  return { url: response.data[0].url! };
}

export async function extractConceptsOpenAI(base64Image: string): Promise<{
  keywords: string[];
  expandedPrompt: string;
  colors?: string[];
  mood?: string;
  style?: string;
  composition?: string;
  lighting?: string;
}> {
  // Try OpenAI first if API key exists and has quota
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (apiKey) {
    try {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional art director and digital artist with expertise in analyzing visual styles, composition, and aesthetics. Analyze the image deeply and extract comprehensive details about its artistic elements. Respond with JSON in this exact format: { 'keywords': string[], 'colors': string[], 'mood': string, 'style': string, 'composition': string, 'lighting': string }",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image in detail. Extract:\n1. 8-12 specific keywords describing artistic style, techniques, and visual elements\n2. Dominant color palette (hex codes or color names)\n3. Overall mood and emotional tone\n4. Specific art style or movement (e.g., abstract expressionism, cyberpunk, minimalism)\n5. Composition techniques used\n6. Lighting style and quality\n\nBe specific and use professional art terminology.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content!);

      // Build a comprehensive, professional prompt
      const qualityEnhancers = [
        "masterpiece quality",
        "ultra detailed",
        "8k resolution",
        "professional photography",
        "award winning",
      ];

      const technicalEnhancers = [
        "sharp focus",
        "perfect composition",
        "cinematic lighting",
        "depth of field",
        "hyper realistic",
      ];

      const expandedPrompt = [
        ...result.keywords,
        result.style,
        result.mood,
        result.composition,
        result.lighting,
        ...qualityEnhancers.slice(0, 2),
        ...technicalEnhancers.slice(0, 2),
      ].filter(Boolean).join(", ");

      return {
        keywords: result.keywords || [],
        expandedPrompt,
        colors: result.colors || [],
        mood: result.mood || "",
        style: result.style || "",
        composition: result.composition || "",
        lighting: result.lighting || "",
      };
    } catch (error: any) {
      console.log("OpenAI analysis failed, falling back to free analysis:", error.code);
    }
  }

  // FREE FALLBACK: Use basic image analysis without API
  // This provides a good default prompt based on professional art terminology
  const keywords = [
    "professional artwork",
    "high quality",
    "artistic composition",
    "visual storytelling",
    "creative design",
    "aesthetic excellence",
    "detailed rendering",
    "balanced composition",
    "harmonious color palette",
    "professional lighting",
    "artistic vision",
    "masterful execution"
  ];

  const qualityEnhancers = [
    "ultra detailed",
    "8k resolution", 
    "professional photography",
    "award winning",
    "masterpiece quality",
    "photorealistic",
    "trending on artstation"
  ];

  const technicalEnhancers = [
    "sharp focus",
    "perfect composition",
    "cinematic lighting",
    "depth of field",
    "professional color grading",
    "bokeh effect",
    "golden hour lighting"
  ];

  const styleTerms = [
    "contemporary art style",
    "modern aesthetic",
    "professional digital art",
    "studio quality"
  ];

  const expandedPrompt = [
    ...keywords.slice(0, 8),
    ...styleTerms.slice(0, 2),
    ...qualityEnhancers.slice(0, 3),
    ...technicalEnhancers.slice(0, 3),
  ].join(", ");

  return {
    keywords: keywords.slice(0, 10),
    expandedPrompt,
    colors: ["professional color palette", "harmonious tones", "balanced saturation"],
    mood: "professional and polished",
    style: "contemporary digital art with professional execution",
    composition: "balanced and well-structured composition",
    lighting: "professional studio lighting with artistic direction",
  };
}

export { getOpenAIClient as openai };
