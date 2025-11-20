# Fine-tuning Guide for Vexura

This guide covers fine-tuning AI image generation models with your custom datasets to create a unique "brand style" for Vexura.

## Why Fine-tune?

- **Consistent Style**: Generate images with your unique artistic style
- **Brand Identity**: Create a recognizable visual brand for your NFT collection
- **Better Control**: More predictable outputs matching your aesthetic
- **Commercial Value**: Unique models can increase artwork value

## Prerequisites

- GPU access (A100 recommended, minimum A10G)
- 100-2000+ training images in your desired style
- Captions or descriptions for each image
- Budget for compute costs ($200-$3000+)

## Dataset Preparation

### 1. Collect Images

**Recommended Dataset Sizes:**
- **Small** (100-500 images): Good for specific style, limited variations
- **Medium** (500-2000 images): Balanced approach, good style consistency
- **Large** (2000+ images): Best results, highest cost

**Image Requirements:**
- Format: PNG, JPG, or WEBP
- Resolution: 512x512 or 768x768 (consistent size)
- Quality: High resolution, clear subjects
- Diversity: Vary compositions, colors, subjects while maintaining style

### 2. Create Captions

Each image needs a descriptive caption:

**Good captions:**
```
"A neon-lit cyberpunk street scene with reflective wet pavement, dramatic lighting"
"Abstract geometric composition with vibrant purple and teal gradients"
"Organic flowing sculpture made of translucent glass, studio lighting"
```

**Bad captions:**
```
"image 1"
"cool art"
"nice picture"
```

### 3. Dataset Structure

**For Replicate:**
```
dataset/
  images/
    img0001.png
    img0002.png
    img0003.png
    ...
  captions.txt
```

`captions.txt` format (one caption per line, matching image order):
```
A neon-lit cyberpunk street scene...
Abstract geometric composition...
Organic flowing sculpture...
```

**For Hugging Face:**
```
dataset/
  images/
    img0001.png
    img0002.png
    ...
  metadata.jsonl
```

`metadata.jsonl` format (one JSON object per line):
```json
{"file_name": "img0001.png", "text": "A neon-lit cyberpunk street scene..."}
{"file_name": "img0002.png", "text": "Abstract geometric composition..."}
```

### 4. Use Your Style Palette

Vexura's style palette (from Archive 4 & 5) can be your training dataset:

```bash
# Copy style images
cp client/public/styles/samples/* dataset/images/

# Generate captions using OpenAI Vision
node scripts/generate_captions.js
```

## Fine-tuning on Replicate

### Setup

1. Install Replicate CLI:
```bash
npm install -g replicate
```

2. Set API token:
```bash
export REPLICATE_API_TOKEN=your_token_here
```

### Run Training

```bash
cd finetune
bash replicate_finetune.sh
```

Follow the script's instructions to:
1. Upload dataset to cloud storage (S3, GCS)
2. Create training job via API
3. Monitor progress on Replicate dashboard

### Cost Estimate (Replicate)

| Dataset Size | Steps | Training Time | Estimated Cost |
|--------------|-------|---------------|----------------|
| 100 images   | 10k   | 2-3 hours     | $200-$500      |
| 500 images   | 25k   | 6-8 hours     | $500-$800      |
| 1000 images  | 40k   | 12-16 hours   | $800-$1500     |
| 2000+ images | 50k+  | 24+ hours     | $1500-$3000+   |

**Additional costs:**
- Storage: ~$0.10/GB/month
- Inference: ~$0.01 per image generated

## Fine-tuning on Hugging Face

### Setup

1. Install dependencies:
```bash
pip3 install diffusers[torch] accelerate transformers datasets
```

2. Set API token:
```bash
export HF_API_TOKEN=your_token_here
```

### Run Training

```bash
cd finetune
bash hf_finetune.sh
```

This creates a `train.py` script. Run with:

```bash
accelerate launch train.py \
  --model_name=stabilityai/stable-diffusion-2-1 \
  --dataset_path=./dataset \
  --output_dir=./vexura-finetuned-model \
  --train_text_encoder \
  --resolution=512 \
  --train_batch_size=1 \
  --num_train_epochs=100 \
  --learning_rate=1e-5
```

### GPU Options

**Cloud Providers:**
- **Lambda Labs**: $1.10/hour (A100 40GB)
- **RunPod**: $0.79/hour (A100 40GB)
- **Vast.ai**: $0.50-1.00/hour (varies)
- **Google Colab Pro+**: $50/month unlimited
- **AWS**: $4.10/hour (p4d.24xlarge)

**Recommendation**: Lambda Labs or RunPod for best price/performance

### Cost Estimate (Hugging Face)

| Dataset Size | GPU Hours | GPU Type | Estimated Cost |
|--------------|-----------|----------|----------------|
| 100 images   | 4-6       | A100     | $50-$150       |
| 500 images   | 12-16     | A100     | $150-$400      |
| 1000 images  | 24-32     | A100     | $400-$800      |
| 2000+ images | 48+       | A100     | $800-$1500+    |

## Training Parameters

### Key Hyperparameters

**Learning Rate:**
- Small datasets (100-500): 1e-5
- Medium datasets (500-1000): 5e-6
- Large datasets (1000+): 1e-6

**Training Steps:**
- Minimum: 5000 steps
- Recommended: 10000-50000 steps
- Large datasets: 50000+ steps

**Batch Size:**
- A100 40GB: 1-2
- A100 80GB: 2-4
- Multiple GPUs: Scale accordingly

**Resolution:**
- Standard: 512x512
- High quality: 768x768 (2x cost)

### Monitoring Training

**Watch for:**
- ✅ Loss decreasing steadily
- ✅ Sample images improving
- ❌ Loss oscillating (reduce learning rate)
- ❌ Artifacts appearing (overfitting, reduce steps)

**Save checkpoints every:**
- 2500 steps for small datasets
- 5000 steps for medium datasets
- 10000 steps for large datasets

## Using Your Fine-tuned Model

### Update Vexura

1. Get your model ID:
   - Replicate: `your-username/vexura-custom-model`
   - Hugging Face: `your-username/vexura-finetuned-model`

2. Update `server/lib/providers.ts`:

```typescript
// For Hugging Face
const model = "your-username/vexura-finetuned-model";

// For Replicate
const version = "your-model-version-id";
```

3. Test generation:
```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Abstract neon artwork in Vexura style",
    "provider": "hf",
    "width": 512,
    "height": 512
  }'
```

## Best Practices

### Dataset Quality

1. **Consistency**: All images should share core style elements
2. **Diversity**: Vary subjects, compositions, colors within style
3. **Quality**: High resolution, good lighting, clear subjects
4. **Captions**: Descriptive, specific, consistent terminology

### Training Tips

1. **Start Small**: Test with 100 images before scaling up
2. **Monitor Closely**: Check sample outputs every 2500 steps
3. **Save Checkpoints**: Keep multiple checkpoints to compare
4. **Avoid Overfitting**: Stop before memorizing training data
5. **Test Prompts**: Try various prompts to ensure versatility

### Cost Optimization

1. **Start with small test run**: 5000 steps, 100 images
2. **Use spot instances**: Save 60-80% on cloud GPU costs
3. **Lower resolution first**: Train 512x512, upscale later
4. **Batch efficiently**: Maximize GPU utilization
5. **Stop early if not improving**: Don't waste compute

## Troubleshooting

### Training Issues

**High loss, poor results:**
- Increase learning rate
- Check dataset quality
- Ensure captions are descriptive

**Overfitting (memorizing training images):**
- Reduce training steps
- Add more diverse training images
- Lower learning rate

**Out of memory:**
- Reduce batch size
- Lower resolution (512 instead of 768)
- Enable gradient checkpointing
- Use smaller GPU or optimize code

**Slow training:**
- Increase batch size (if memory allows)
- Use mixed precision (fp16)
- Optimize data loading
- Use faster GPU

### Quality Issues

**Generated images don't match style:**
- Train longer (more steps)
- Improve caption quality
- Add more training images
- Adjust learning rate

**Artifacts or distortions:**
- Reduce learning rate
- Check for corrupted training images
- Stop training earlier

**Limited variety:**
- Add more diverse training images
- Improve caption variety
- Reduce training steps (may be overfitting)

## Commercial Considerations

### Licensing

**Your fine-tuned model inherits the base model's license:**
- Stable Diffusion 2.1: CreativeML Open RAIL++-M (Commercial OK)
- Check base model license before commercial use
- Document your model's license clearly

### Attribution

Include in your NFT metadata:
```json
{
  "attributes": [
    {"trait_type": "Base Model", "value": "Stable Diffusion 2.1"},
    {"trait_type": "Fine-tuned", "value": "Yes"},
    {"trait_type": "Custom Model", "value": "Vexura Style v1"},
    {"trait_type": "Training Dataset", "value": "2000 images"}
  ]
}
```

### Costs to Budget

- **Training**: $200-$3000 (one-time)
- **Storage**: $5-20/month (model hosting)
- **Inference**: $0.01-0.02 per generation
- **Maintenance**: Periodic retraining ($200-500/update)

## Resources

- Diffusers Documentation: https://huggingface.co/docs/diffusers
- Replicate Training Docs: https://replicate.com/docs/guides/fine-tune-a-language-model
- Stability AI Model Card: https://huggingface.co/stabilityai/stable-diffusion-2-1
- Best Practices: https://huggingface.co/blog/fine-tune-stable-diffusion

## Support

For fine-tuning issues:
1. Check Replicate/Hugging Face documentation
2. Review training logs for error messages
3. Test with smaller dataset first
4. Join Hugging Face or Replicate Discord for community support

---

**Remember:** Fine-tuning is an investment. Start small, test thoroughly, and scale up once you validate the approach works for your style.
