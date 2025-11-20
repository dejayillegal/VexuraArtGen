# Vexura - Quick Start Guide

## ✨ Getting Started

Your Vexura AI Art Generator is **ready to use immediately**! No API keys required to start creating amazing artwork.

### 1. Create Your First Artwork

1. Click the **"Create"** button in the navigation
2. Enter a prompt describing what you want to create
   - Example: "A vibrant sunset over mountains, professional photography"
3. Click **"Generate"** button
4. Wait 5-10 seconds for your masterpiece to appear!

### 2. Available Features

#### Free Generation (No API Key Required)
- **Pollinations.ai**: Completely free, uses Flux model
- **Segmind**: Free tier available, uses Stable Diffusion 1.5
- Both automatically fallback to each other if one is down

#### Download & Export
- Click **"Download"** to save your artwork as PNG
- Use **"View Full"** to see full-resolution preview
- **"Batch Export"** generates multiple sizes with metadata (CSV + JSON)

#### Gallery
- All generated artwork is automatically saved locally (IndexedDB)
- View your creation history in the **Gallery** tab
- Delete or re-download previous creations

### 3. Optional: Add Premium Providers

For higher quality results, you can add API keys (optional):

#### OpenAI DALL-E 3
1. Get API key from: https://platform.openai.com/api-keys
2. In Replit Secrets, add: `OPENAI_API_KEY`= your key
3. Restart the application
4. Select "OpenAI" in the AI Provider dropdown

#### Replicate (Stable Diffusion)
1. Get API token from: https://replicate.com/account/api-tokens
2. In Replit Secrets, add: `REPLICATE_API_TOKEN` = your token
3. Restart the application
4. Select "Replicate" in the AI Provider dropdown

#### NFT Storage (IPFS Upload)
1. Get API key from: https://nft.storage/manage/
2. In Replit Secrets, add: `NFT_STORAGE_KEY` = your key
3. Use the **"Upload to IPFS"** button after generating artwork

### 4. Advanced Features

#### Style Transfer
1. Upload a style image using the **"Upload New Style"** button in the Style Palette
2. Select the style to apply it to your generation
3. Generate with the style applied as reference

#### Concept Extraction (Requires OpenAI)
- Select a style image
- Click **"Extract Concepts"** to automatically analyze the image
- AI-generated keywords will be added to your prompt

#### Batch Export for NFTs
1. Generate an artwork you like
2. Click **"Batch Export"**
3. Select multiple sizes (e.g., 512x512, 1024x1024, 1792x1024)
4. Download ZIP containing:
   - All image sizes
   - metadata.csv with details
   - NFT-ready JSON files
   - License information

### 5. Tips for Best Results

#### Prompt Writing
- Be specific and descriptive
- Include style keywords: "photorealistic", "oil painting", "digital art"
- Add quality modifiers: "high detail", "8k", "professional"
- Use the preset buttons for quick templates

#### Provider Selection
- **Pollinations (Free)**: Great for creative, artistic styles
- **OpenAI**: Best for photorealistic and high-quality results
- **Replicate**: Good for specific Stable Diffusion models

#### Dimensions
- **512x512**: Fast generation, good for testing
- **1024x1024**: Standard high-quality
- **1792x1024**: Widescreen format (OpenAI only)

### 6. Troubleshooting

#### "Generation Failed" Error
- If Pollinations is down, try again (it auto-retries Segmind)
- Check your internet connection
- For premium providers, verify your API key is correct

#### Image Not Displaying
- Check browser console for errors (F12)
- Try refreshing the page
- Clear browser cache if issues persist

#### Slow Generation
- Pollinations can take 5-15 seconds depending on server load
- OpenAI typically generates in 10-30 seconds
- Larger dimensions take longer

### 7. Production Deployment

When you're ready to publish your application:

1. Click the **"Publish"** button in Replit
2. Your app will be deployed with autoscaling
3. Share the public URL with users

The deployment is configured to:
- Build optimized production bundle
- Serve via Node.js on port 5000
- Auto-scale based on traffic

### 8. Support & Documentation

- **Full API Documentation**: See `README.md`
- **Fine-Tuning Guide**: See `README_finetuning.md`
- **License Checklist**: See `LICENSE_CHECKLIST.md`
- **Test Suite**: Visit `/test.html` to test all API endpoints

---

## 🎨 Enjoy Creating!

You're all set! Start generating amazing AI artwork right now - no setup required!
