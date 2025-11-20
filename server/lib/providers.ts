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
  // Segmind has a free tier - using their public API
  const width = params.width || 512;
  const height = params.height || 512;
  
  const url = "https://api.segmind.com/v1/sd1.5-txt2img";
  
  try {
    console.log("Trying Segmind API");
    const response = await axios.post(
      url,
      {
        prompt: params.prompt,
        negative_prompt: "blurry, low quality, distorted",
        samples: 1,
        width: width,
        height: height,
        steps: 20,
        seed: Math.floor(Math.random() * 1000000),
        scheduler: "euler_a",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
        timeout: 60000,
      }
    );

    if (!response.data || response.data.byteLength === 0) {
      throw new Error("Segmind returned empty image data");
    }

    console.log("Segmind generation successful");
    return { imageBuffer: Buffer.from(response.data) };
  } catch (error: any) {
    console.error("Segmind error:", error.message);
    throw new Error(`Segmind generation failed: ${error.message}`);
  }
}

export async function generateWithPollinations(params: {
  prompt: string;
  width?: number;
  height?: number;
}): Promise<{ imageBuffer: Buffer }> {
  // Pollinations.ai is completely free, no API key needed
  const width = params.width || 512;
  const height = params.height || 512;
  
  // Clean and encode the prompt
  const encodedPrompt = encodeURIComponent(params.prompt);
  
  // Try multiple Pollinations endpoints with retry logic
  const models = ['flux', 'turbo', 'flux-realism'];
  let lastError: Error | null = null;
  
  for (const model of models) {
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=${model}`;
    
    try {
      console.log(`Trying Pollinations with model: ${model}`);
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 60000, // 1 minute timeout per attempt
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
        validateStatus: (status) => status === 200, // Only accept 200
      });

      if (!response.data || response.data.byteLength === 0) {
        throw new Error("Pollinations returned empty image data");
      }

      console.log(`Pollinations success with model: ${model}`);
      return { imageBuffer: Buffer.from(response.data) };
    } catch (error: any) {
      console.error(`Pollinations ${model} failed:`, error.response?.status || error.message);
      lastError = error;
      // Continue to next model
    }
  }
  
  throw new Error(`Pollinations.ai generation failed after trying all models: ${lastError?.message || 'Unknown error'}`);
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
  const { prompt, width = 512, height = 512 } = params;
  let provider = params.provider;

  let imageUrl: string | undefined;
  let imageBuffer: Buffer | undefined;
  let predictionUrl: string | undefined;
  let model = "";
  let actualProvider = provider;

  // Try the requested provider first, then fallback to free options
  const providersToTry: Array<"openai" | "hf" | "replicate" | "pollinations" | "segmind"> = [provider];
  
  // Add fallback providers (free options) - always try both free providers
  if (provider !== "pollinations") {
    providersToTry.push("pollinations");
  }
  if (provider !== "segmind") {
    providersToTry.push("segmind" as any);
  }
  
  // Add the other free provider as final fallback
  if (provider === "pollinations" && !providersToTry.includes("segmind" as any)) {
    providersToTry.push("segmind" as any);
  }
  if (provider === "segmind" && !providersToTry.includes("pollinations")) {
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
        });
        imageBuffer = result.imageBuffer;
        model = "flux";
        actualProvider = "pollinations";
        break;
      } else if (currentProvider === "segmind") {
        const result = await generateWithSegmind({
          prompt,
          width,
          height,
        });
        imageBuffer = result.imageBuffer;
        model = "stable-diffusion-1.5";
        actualProvider = "segmind" as any;
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
          `All providers failed. Pollinations may be temporarily down. Last error: ${errorMsg}. ` +
          `Please try again in a few moments or use a different provider.`
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
