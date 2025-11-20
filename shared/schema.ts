import { z } from "zod";

// Artwork/Generation Schema
export const generationSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  provider: z.enum(["openai", "hf", "replicate", "pollinations"]),
  model: z.string(),
  imageDataUri: z.string(),
  width: z.number(),
  height: z.number(),
  seed: z.number().optional(),
  steps: z.number().optional(),
  guidanceScale: z.number().optional(),
  initImage: z.string().optional(),
  createdAt: z.string(),
  cid: z.string().optional(), // IPFS CID if uploaded
});

export type Generation = z.infer<typeof generationSchema>;

// Style Palette Item
export const styleSchema = z.object({
  name: z.string(),
  thumbUri: z.string(),
  dataUri: z.string(),
});

export type Style = z.infer<typeof styleSchema>;

// API Request/Response Schemas
export const generateRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  provider: z.enum(["openai", "hf", "replicate", "pollinations"]).default("openai"),
  initImage: z.string().optional(),
  width: z.number().min(256).max(2048).default(512),
  height: z.number().min(256).max(2048).default(512),
  seed: z.number().optional(),
  steps: z.number().min(1).max(150).optional(),
  guidanceScale: z.number().min(1).max(20).optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const generateResponseSchema = z.object({
  image: z.string(), // data URI
  meta: z.object({
    provider: z.string(),
    model: z.string(),
    seed: z.number().optional(),
    width: z.number(),
    height: z.number(),
    predictionUrl: z.string().optional(), // for Replicate polling
  }),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;

export const extractConceptsRequestSchema = z.object({
  imageDataUri: z.string(),
});

export type ExtractConceptsRequest = z.infer<typeof extractConceptsRequestSchema>;

export const extractConceptsResponseSchema = z.object({
  keywords: z.array(z.string()),
  expandedPrompt: z.string(),
  colors: z.array(z.string()).optional(),
  mood: z.string().optional(),
});

export type ExtractConceptsResponse = z.infer<typeof extractConceptsResponseSchema>;

export const batchGenerateRequestSchema = z.object({
  prompt: z.string().min(1),
  sizes: z.array(z.string()),
  provider: z.enum(["openai", "hf", "replicate", "pollinations"]),
  styleImageDataUri: z.string().optional(),
});

export type BatchGenerateRequest = z.infer<typeof batchGenerateRequestSchema>;

export const ipfsUploadRequestSchema = z.object({
  zipB64: z.string(),
});

export type IpfsUploadRequest = z.infer<typeof ipfsUploadRequestSchema>;

export const ipfsUploadResponseSchema = z.object({
  cid: z.string(),
  url: z.string(),
});

export type IpfsUploadResponse = z.infer<typeof ipfsUploadResponseSchema>;

export const marketplaceListRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageCid: z.string(),
  priceEth: z.number(),
  royaltiesPct: z.number(),
  externalUrl: z.string().url(),
});

export type MarketplaceListRequest = z.infer<typeof marketplaceListRequestSchema>;

// Prompt Templates
export const promptTemplates = [
  {
    id: "abstract-neon",
    name: "Abstract Neon",
    template: "A high-detail abstract neon digital painting, fractal composition, reflective surfaces, volumetric lighting, hyperreal textures, ultra-sharp, 8k, by Vexura — stylized, cinematic color grading, HDR, depth of field.",
  },
  {
    id: "futuristic-surrealism",
    name: "Futuristic Surrealism",
    template: "Surreal futuristic scene with floating bioluminescent structures, muted chrome, cinematic rim lighting, long exposure motion blur, photorealistic rendering, concept art detail.",
  },
  {
    id: "organic-sculpture",
    name: "Organic Sculpture",
    template: "A tactile organic sculpture forged from metallic and glass fibers, macro texture detail, shallow depth of field, studio lighting, pristine finish, photoreal.",
  },
  {
    id: "cyberpunk-collage",
    name: "Cyberpunk Collage",
    template: "Cyberpunk street collage, messy neon signage, wet asphalt reflections, dramatic backlight, film grain, high dynamic range, layered textures.",
  },
  {
    id: "dreamscape-watercolor",
    name: "Dreamscape Watercolor",
    template: "Ethereal watercolor dreamscape, soft gradients, paper texture, drifting shapes, luminous color washes, high-resolution scan.",
  },
  {
    id: "minimalist-geometric",
    name: "Minimalist Geometric",
    template: "Minimalist geometric composition, perfect symmetry, soft shadows, subtle gradients, tactile paper grain, museum poster aesthetic.",
  },
] as const;