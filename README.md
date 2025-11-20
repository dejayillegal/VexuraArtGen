# Vexura - AAA Digital Art Generator

Professional-grade AI art generation platform for creating high-value, sellable digital art and NFT-ready packages.

## Features

- **Multi-Provider AI Generation**: Support for OpenAI DALL-E, Hugging Face Stable Diffusion, and Replicate models
- **Style Transfer**: Image-to-image generation with reference style images
- **Concept Extraction**: AI-powered keyword extraction using OpenAI Vision
- **Batch Export**: Generate multiple sizes with metadata CSV and NFT-ready JSON
- **IPFS Integration**: Upload directly to nft.storage for decentralized storage
- **NFT-Ready**: Metadata templates for OpenSea, Rarible, and other marketplaces
- **Production Security**: Rate limiting, helmet headers, admin API key protection

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- API Keys (see Environment Variables below)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory (or use Replit Secrets):

```env
# Required API Keys
OPENAI_API_KEY=your_openai_api_key
HF_API_TOKEN=your_huggingface_token
REPLICATE_API_TOKEN=your_replicate_token
NFT_STORAGE_KEY=your_nft_storage_key
ADMIN_API_KEY=your_admin_secret_key

# Optional
PORT=5000
NODE_ENV=development
```

**Where to get API keys:**
- OpenAI: https://platform.openai.com/api-keys
- Hugging Face: https://huggingface.co/settings/tokens
- Replicate: https://replicate.com/account/api-tokens
- NFT.Storage: https://nft.storage/manage/

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production

```bash
npm run build
npm start
```

## API Endpoints

### GET /api/ping
Check provider availability status.

**Response:**
```json
{
  "openai": true,
  "hf": true,
  "replicate": true
}
```

### GET /api/styles
Get available style images from the palette.

**Response:**
```json
[
  {
    "name": "style1.png",
    "thumbUri": "data:image/jpeg;base64,...",
    "dataUri": "data:image/jpeg;base64,..."
  }
]
```

### POST /api/generate
Generate an AI image.

**Request Body:**
```json
{
  "prompt": "A futuristic cityscape at sunset",
  "provider": "openai",
  "width": 1024,
  "height": 1024,
  "initImage": "data:image/png;base64,...",
  "steps": 30,
  "guidanceScale": 7
}
```

**Response:**
```json
{
  "image": "data:image/png;base64,...",
  "meta": {
    "provider": "openai",
    "model": "dall-e-3",
    "seed": 12345,
    "width": 1024,
    "height": 1024
  }
}
```

### POST /api/extract_concepts
Extract concepts from a style image using OpenAI Vision.

**Request Body:**
```json
{
  "imageDataUri": "data:image/png;base64,..."
}
```

**Response:**
```json
{
  "keywords": ["abstract", "neon", "geometric"],
  "expandedPrompt": "abstract, neon, geometric, high detail, 8k...",
  "colors": ["#FF00FF", "#00FFFF"],
  "mood": "futuristic"
}
```

### POST /api/batch_generate
Generate multiple sizes and export as ZIP (Rate limited: 5 req/min).

**Request Body:**
```json
{
  "prompt": "Abstract neon art",
  "sizes": ["512x512", "1024x1024", "1792x1024"],
  "provider": "openai",
  "styleImageDataUri": "data:image/png;base64,..."
}
```

**Response:** ZIP file download with images, metadata.csv, and metadata JSONs

### POST /api/ipfs_upload
Upload content to IPFS via nft.storage.

**Request Body:**
```json
{
  "zipB64": "base64_encoded_data"
}
```

**Response:**
```json
{
  "cid": "bafkreiabcd1234...",
  "url": "https://ipfs.io/ipfs/bafkreiabcd1234..."
}
```

### POST /api/marketplace/list
Admin-only endpoint for marketplace listing templates (Requires `x-api-key` header).

**Request Body:**
```json
{
  "title": "Vexura Art #1",
  "description": "AI-generated masterpiece",
  "imageCid": "bafkreiabcd1234...",
  "priceEth": 0.1,
  "royaltiesPct": 10,
  "externalUrl": "https://example.com"
}
```

## Deployment

### Vercel (Frontend) + Render/Heroku (Backend)

1. **Frontend (Vercel):**
   ```bash
   npm run build
   # Deploy `client/dist` to Vercel
   ```

2. **Backend (Render/Heroku):**
   - Set environment variables in platform dashboard
   - Deploy with Node.js runtime
   - Set start command: `npm start`

### Environment Variables for Production

Make sure to set all required API keys in your hosting platform's environment variable settings.

## Security

- **Rate Limiting**: 30 requests/min for API, 5 requests/min for batch operations
- **Helmet Headers**: Security headers enabled
- **Body Size Limits**: 50MB max for image uploads
- **Admin Protection**: Marketplace endpoints require ADMIN_API_KEY

### Key Rotation

Use the provided script to rotate your admin API key:

```bash
bash scripts/rotate_keys.sh
```

## Fine-Tuning

See `README_finetuning.md` for detailed instructions on fine-tuning models with your own datasets.

**Cost Estimates:**
- Small dataset (100-500 images): $200-$800
- Medium dataset (500-2000 images): $800-$3000
- Large dataset (2000+ images): $3000+

## Commercial Licensing

**IMPORTANT:** Before using any generated artwork commercially, review `LICENSE_CHECKLIST.md` to ensure compliance with model licenses.

## Support

For issues or questions, please open an issue on GitHub.

## License

Copyright © 2024 Vexura. All rights reserved.
