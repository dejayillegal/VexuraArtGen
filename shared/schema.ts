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
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    template: "Cyberpunk neon cityscape, futuristic megacity, vibrant neon colors, rain-soaked streets, holographic advertisements, flying vehicles, dystopian atmosphere, blade runner aesthetic, volumetric fog, cinematic composition, 8k ultra detailed",
  },
  {
    id: "abstract",
    name: "Abstract Art",
    template: "Abstract geometric shapes, bold contrasting colors, dynamic swirling composition, modern art style, fluid motion, artistic expression, contemporary design, vibrant energy, masterpiece quality, award winning",
  },
  {
    id: "fantasy",
    name: "Fantasy Landscape",
    template: "Epic fantasy landscape, magical atmosphere, mystical volumetric lighting, enchanted forest with ancient trees, ethereal beauty, floating islands, glowing crystals, dreamlike quality, concept art style, cinematic wide angle, 8k resolution",
  },
  {
    id: "portrait",
    name: "Portrait",
    template: "Professional portrait photography, studio lighting setup, shallow depth of field, elegant pose, refined facial details, photorealistic skin texture, bokeh background, high-end fashion aesthetic, medium format camera quality",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    template: "Minimalist design, clean geometric lines, simple balanced composition, strategic negative space, modern Scandinavian aesthetic, muted pastel colors, zen atmosphere, architectural photography style",
  },
  {
    id: "surreal",
    name: "Surrealism",
    template: "Surrealist dreamscape, impossible architecture, melting clocks aesthetic, Salvador Dali inspired, hyperrealistic details, mind-bending perspective, philosophical symbolism, museum quality artwork, 8k masterpiece",
  },
  {
    id: "anime",
    name: "Anime Art",
    template: "Anime art style, cel shading technique, vibrant colors, expressive eyes, dynamic action pose, Studio Ghibli quality, detailed background, professional anime illustration, high resolution, trending on ArtStation",
  },
  {
    id: "nature",
    name: "Nature Photography",
    template: "Stunning nature photography, golden hour lighting, dramatic landscape, pristine wilderness, perfect composition, National Geographic quality, crystal clear details, vivid natural colors, wide angle lens, breathtaking vista",
  },
  {
    id: "scifi",
    name: "Sci-Fi",
    template: "Science fiction scene, advanced alien technology, futuristic spacecraft, otherworldly planets, volumetric nebula clouds, hard surface modeling, concept art quality, cinematic lighting, photorealistic rendering, 8k ultra HD",
  },
  {
    id: "vintage",
    name: "Vintage",
    template: "Vintage aesthetic, retro 1970s style, film grain texture, faded colors, nostalgic atmosphere, analog photography look, classic composition, timeless elegance, warm color grading, authentic period details",
  },
  {
    id: "horror",
    name: "Dark Horror",
    template: "Dark horror atmosphere, ominous shadows, eerie abandoned location, fog and mist, dramatic chiaroscuro lighting, gothic architecture, supernatural presence, cinematic suspense, moody color palette, photorealistic terror",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    template: "Delicate watercolor painting, soft flowing brushstrokes, translucent layers, pastel color palette, artistic paper texture, whimsical style, loose impressionistic details, peaceful atmosphere, traditional media aesthetic",
  },
];