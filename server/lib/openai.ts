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
}> {
  // Using GPT-4 Turbo for vision analysis
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an art analysis expert. Analyze the image and extract 6-8 keywords describing the style, dominant colors, textures, mood, and artistic elements. Respond with JSON in this format: { 'keywords': string[], 'colors': string[], 'mood': string }",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this image and extract key style elements, colors, and mood.",
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
    max_completion_tokens: 500,
  });

  const result = JSON.parse(response.choices[0].message.content!);

  const expandedPrompt = [
    ...result.keywords,
    "neon",
    "high detail",
    "8k",
    "cinematic lighting",
    "stylized by Vexura",
  ].join(", ");

  return {
    keywords: result.keywords || [],
    expandedPrompt,
    colors: result.colors || [],
    mood: result.mood || "",
  };
}

export { getOpenAIClient as openai };
