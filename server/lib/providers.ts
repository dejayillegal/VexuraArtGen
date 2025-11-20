import axios from "axios";
import { generateImageOpenAI } from "./openai";

export async function generateWithHuggingFace(params: {
  prompt: string;
  initImage?: string;
  width?: number;
  height?: number;
}): Promise<{ imageBuffer: Buffer }> {
  throw new Error("Hugging Face Inference API has been deprecated. This provider is no longer available. Please use Replicate or Pollinations (both free).");
}

export async function generateWithSegmind(params: {
  prompt: string;
  width?: number;
  height?: number;
}): Promise<{ imageBuffer: Buffer }> {
  // Note: Segmind now requires API key, so this is deprecated
  // Keeping for backwards compatibility but it will fail without key
  throw new Error("Segmind now requires an API key. Please use Pollinations or add SEGMIND_API_KEY to your environment.");
}

export async function generateWithPollinations(params: {
  prompt: string;
  width?: number;
  height?: number;
  referenceImage?: string;
  referenceStrength?: number;
}): Promise<{ imageBuffer: Buffer }> {
  // Pollinations.ai is completely free, no API key needed
  const width = params.width || 512;
  const height = params.height || 512;
  
  // Enhance prompt based on reference strength if reference image is provided
  let finalPrompt = params.prompt;
  if (params.referenceImage && params.referenceStrength !== undefined) {
    const strength = params.referenceStrength;
    
    // Map strength to creativity level (0.3-0.95 range)
    let creativity: string;
    let instructions: string;
    
    if (strength >= 0.85) {
      // 0.85-0.95: Very close to reference
      creativity = "faithful recreation";
      instructions = "closely following the reference image's composition, style, colors, and atmosphere";
    } else if (strength >= 0.7) {
      // 0.7-0.84: Balanced
      creativity = "inspired variation";
      instructions = "maintaining the core aesthetic and mood of the reference while introducing subtle creative variations";
    } else if (strength >= 0.5) {
      // 0.5-0.69: More creative
      creativity = "creative interpretation";
      instructions = "drawing inspiration from the reference's style and themes but with significant artistic freedom";
    } else {
      // 0.3-0.49: Very creative
      creativity = "loosely inspired creation";
      instructions = "taking conceptual inspiration from the reference while creating something distinctly unique";
    }
    
    finalPrompt = `${params.prompt}, ${creativity}, ${instructions}, professional digital art quality`;
  }
  
  // Clean and encode the prompt
  const encodedPrompt = encodeURIComponent(finalPrompt);
  
  // Try multiple Pollinations endpoints with retry logic and delays
  const models = ['flux', 'turbo', 'flux-realism'];
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < models.length; attempt++) {
    const model = models[attempt];
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=${model}&seed=${Date.now()}`;
    
    try {
      console.log(`Trying Pollinations with model: ${model} (attempt ${attempt + 1}/${models.length})`);
      
      // Add delay between retries to avoid rate limiting
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 90000, // Increased to 90 seconds
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
        validateStatus: (status) => status === 200,
      });

      if (!response.data || response.data.byteLength === 0) {
        throw new Error("Empty response from Pollinations");
      }

      console.log(`✓ Pollinations success with model: ${model}`);
      return { imageBuffer: Buffer.from(response.data) };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const errorMsg = statusCode === 502 ? "Server temporarily unavailable" : error.message;
      console.error(`✗ Pollinations ${model} failed:`, errorMsg);
      lastError = error;
    }
  }
  
  // If all attempts failed, throw a user-friendly error
  const statusCode = (lastError as any)?.response?.status;
  if (statusCode === 502 || statusCode === 503) {
    throw new Error("Pollinations.ai is temporarily unavailable (server maintenance). Please try again in a few minutes.");
  }
  
  throw new Error(`Unable to generate image: ${lastError?.message || 'Service temporarily unavailable'}`);
}

export async function generateWithReplicate(params: {
  prompt: string;
  initImage?: string;
  width?: number;
  height?: number;
}): Promise<{ predictionUrl: string }> {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  const response = await axios.post(
    "https://api.replicate.com/v1/predictions",
    {
      version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // stable-diffusion
      input: {
        prompt: params.prompt,
        width: params.width || 512,
        height: params.height || 512,
      },
    },
    {
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  return { predictionUrl: response.data.urls.get };
}

export async function checkProviderAvailability() {
  return {
    openai: !!process.env.OPENAI_API_KEY,
    hf: false, // Deprecated
    replicate: !!process.env.REPLICATE_API_TOKEN,
    pollinations: true, // Always available, no API key needed
  };
}

export async function generateImage(params: {
  prompt: string;
  provider: "openai" | "hf" | "replicate" | "pollinations";
  initImage?: string;
  width?: number;
  height?: number;
  seed?: number;
  steps?: number;
  guidanceScale?: number;
  referenceImage?: string;
  referenceStrength?: number;
}): Promise<{
  image: string;
  meta: {
    provider: string;
    model: string;
    seed?: number;
    width: number;
    height: number;
    predictionUrl?: string;
  };
}> {
  const { prompt, width = 512, height = 512, referenceImage, referenceStrength } = params;
  let provider = params.provider;

  let imageUrl: string | undefined;
  let imageBuffer: Buffer | undefined;
  let predictionUrl: string | undefined;
  let model = "";
  let actualProvider = provider;

  // Try the requested provider first, then fallback to free options
  const providersToTry: Array<"openai" | "hf" | "replicate" | "pollinations"> = [provider];
  
  // Add Pollinations as fallback (only free provider currently working)
  if (provider !== "pollinations") {
    providersToTry.push("pollinations");
  }

  let lastError: Error | null = null;

  for (const currentProvider of providersToTry) {
    try {
      console.log(`Attempting generation with provider: ${currentProvider}`);
      
      if (currentProvider === "openai") {
        const result = await generateImageOpenAI({
          prompt,
          size: `${width}x${height}`,
        });
        imageUrl = result.url;
        model = "dall-e-3";
        actualProvider = "openai";
        break;
      } else if (currentProvider === "hf") {
        // HF is deprecated, skip
        continue;
      } else if (currentProvider === "replicate") {
        const result = await generateWithReplicate({
          prompt,
          width,
          height,
        });
        predictionUrl = result.predictionUrl;
        model = "stable-diffusion";
        actualProvider = "replicate";
        break;
      } else if (currentProvider === "pollinations") {
        const result = await generateWithPollinations({
          prompt,
          width,
          height,
          referenceImage,
          referenceStrength,
        });
        imageBuffer = result.imageBuffer;
        model = "flux";
        actualProvider = "pollinations";
        break;
      }
    } catch (error: any) {
      const errorMsg = error.response?.status 
        ? `${error.message} (HTTP ${error.response.status})`
        : error.message;
      console.error(`Provider ${currentProvider} failed:`, errorMsg);
      lastError = error;
      
      // If this was the last provider to try, throw a more helpful error
      if (currentProvider === providersToTry[providersToTry.length - 1]) {
        throw new Error(
          `Image generation currently unavailable. ${errorMsg}. ` +
          `Pollinations.ai may be experiencing high traffic or maintenance. ` +
          `Please try again in a few minutes, or add an OpenAI API key for DALL-E 3.`
        );
      }
      
      // Otherwise continue to next provider
      console.log(`Falling back to next provider...`);
      continue;
    }
  }

  // Convert to data URI
  let dataUri: string;

  if (imageUrl) {
    // Download from URL
    const response = await axios.get(imageUrl, { 
      responseType: "arraybuffer",
      maxContentLength: 50 * 1024 * 1024,
    });
    const base64 = Buffer.from(response.data).toString("base64");
    dataUri = `data:image/png;base64,${base64}`;
  } else if (imageBuffer) {
    // Verify buffer is valid before encoding
    if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
      throw new Error("Invalid image buffer received");
    }
    const base64 = imageBuffer.toString("base64");
    dataUri = `data:image/png;base64,${base64}`;
  } else {
    throw new Error("No image generated");
  }

  // Validate the data URI
  if (!dataUri || !dataUri.startsWith('data:image/')) {
    throw new Error("Invalid image data generated");
  }

  return {
    image: dataUri,
    meta: {
      provider: actualProvider,
      model,
      seed: params.seed,
      width: width || 512,
      height: height || 512,
      predictionUrl,
    },
  };
}
