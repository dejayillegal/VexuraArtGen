#!/bin/bash

# Vexura - Hugging Face Fine-tuning Script
# Fine-tune Stable Diffusion using Diffusers + Accelerate

echo "========================================="
echo "Vexura Hugging Face Fine-tuning"
echo "========================================="
echo ""

# Configuration
MODEL_ID="stabilityai/stable-diffusion-2-1"
OUTPUT_DIR="./vexura-finetuned-model"
DATASET_PATH="./dataset"
HF_API_TOKEN=${HF_API_TOKEN:-""}

# Check for API token
if [ -z "$HF_API_TOKEN" ]; then
    echo "Error: HF_API_TOKEN not set"
    echo "Please set: export HF_API_TOKEN=your_token"
    exit 1
fi

# Check Python and dependencies
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 not found"
    exit 1
fi

echo "Checking dependencies..."
pip3 list | grep -q diffusers || echo "⚠️  diffusers not installed"
pip3 list | grep -q accelerate || echo "⚠️  accelerate not installed"
pip3 list | grep -q transformers || echo "⚠️  transformers not installed"

echo ""
echo "To install required packages:"
echo "pip3 install diffusers[torch] accelerate transformers datasets"
echo ""

# Check dataset
if [ ! -d "$DATASET_PATH/images" ]; then
    echo "Error: Dataset directory not found"
    echo ""
    echo "Expected structure:"
    echo "dataset/"
    echo "  images/"
    echo "    img001.png"
    echo "    img002.png"
    echo "    ..."
    echo "  metadata.jsonl  # {\"file_name\": \"img001.png\", \"text\": \"caption\"}"
    echo ""
    exit 1
fi

IMAGE_COUNT=$(ls -1 "$DATASET_PATH/images" | wc -l)
echo "Found $IMAGE_COUNT images in dataset"

# Estimate cost and time
if [ $IMAGE_COUNT -lt 100 ]; then
    echo "⚠️  Warning: Dataset too small (minimum 100 images recommended)"
    TIME_ESTIMATE="2-4 hours"
    COST_ESTIMATE="$50-$150 (GPU time)"
elif [ $IMAGE_COUNT -lt 500 ]; then
    TIME_ESTIMATE="6-12 hours"
    COST_ESTIMATE="$150-$400"
elif [ $IMAGE_COUNT -lt 2000 ]; then
    TIME_ESTIMATE="12-24 hours"
    COST_ESTIMATE="$400-$1200"
else
    TIME_ESTIMATE="24-48+ hours"
    COST_ESTIMATE="$1200+"
fi

echo "Estimated time: $TIME_ESTIMATE"
echo "Estimated cost: $COST_ESTIMATE (using A100 GPU)"
echo ""

read -p "Continue with fine-tuning setup? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Fine-tuning cancelled"
    exit 0
fi

# Create training script
cat > train.py << 'EOF'
#!/usr/bin/env python3
"""
Vexura Fine-tuning Script for Hugging Face Diffusers
Based on: https://github.com/huggingface/diffusers/blob/main/examples/text_to_image/train_text_to_image.py
"""

import argparse
from accelerate import Accelerator
from diffusers import StableDiffusionPipeline, UNet2DConditionModel
from transformers import CLIPTextModel

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_name", default="stabilityai/stable-diffusion-2-1")
    parser.add_argument("--dataset_path", default="./dataset")
    parser.add_argument("--output_dir", default="./vexura-finetuned-model")
    parser.add_argument("--train_text_encoder", action="store_true")
    parser.add_argument("--resolution", type=int, default=512)
    parser.add_argument("--train_batch_size", type=int, default=1)
    parser.add_argument("--num_train_epochs", type=int, default=100)
    parser.add_argument("--learning_rate", type=float, default=1e-5)
    parser.add_argument("--lr_scheduler", default="constant")
    parser.add_argument("--adam_beta1", type=float, default=0.9)
    parser.add_argument("--adam_beta2", type=float, default=0.999)
    parser.add_argument("--adam_weight_decay", type=float, default=1e-2)
    parser.add_argument("--adam_epsilon", type=float, default=1e-8)
    parser.add_argument("--max_grad_norm", type=float, default=1.0)
    
    args = parser.parse_args()
    
    print("=" * 50)
    print("Vexura Fine-tuning Configuration")
    print("=" * 50)
    print(f"Model: {args.model_name}")
    print(f"Dataset: {args.dataset_path}")
    print(f"Output: {args.output_dir}")
    print(f"Resolution: {args.resolution}")
    print(f"Epochs: {args.num_train_epochs}")
    print(f"Batch size: {args.train_batch_size}")
    print(f"Learning rate: {args.learning_rate}")
    print("=" * 50)
    
    # Initialize accelerator
    accelerator = Accelerator()
    
    # Load model
    print("Loading model...")
    # TODO: Implement actual training loop
    # See: https://github.com/huggingface/diffusers/tree/main/examples/text_to_image
    
    print("✅ Training script created")
    print("⚠️  This is a template. Implement full training loop based on:")
    print("   https://github.com/huggingface/diffusers/blob/main/examples/text_to_image/train_text_to_image.py")

if __name__ == "__main__":
    main()
EOF

chmod +x train.py

echo "✅ Training script created: train.py"
echo ""
echo "Next steps:"
echo "1. Prepare your dataset with captions:"
echo "   - Create metadata.jsonl with image captions"
echo "   - Ensure images are 512x512 or 768x768"
echo ""
echo "2. Run training (requires GPU):"
echo "   accelerate launch train.py \\"
echo "     --model_name=$MODEL_ID \\"
echo "     --dataset_path=$DATASET_PATH \\"
echo "     --output_dir=$OUTPUT_DIR \\"
echo "     --train_text_encoder \\"
echo "     --resolution=512 \\"
echo "     --train_batch_size=1 \\"
echo "     --num_train_epochs=100 \\"
echo "     --learning_rate=1e-5"
echo ""
echo "3. After training, push to Hugging Face Hub:"
echo "   huggingface-cli login"
echo "   huggingface-cli upload your-username/$OUTPUT_DIR ./$OUTPUT_DIR"
echo ""
echo "4. Use in Vexura by updating the model ID"
echo ""

echo "========================================="
echo "Hardware Requirements"
echo "========================================="
echo "Minimum: 1x A100 (40GB) or 2x A10G"
echo "Recommended: 1x A100 (80GB) or 4x A100 (40GB)"
echo ""
echo "Cloud Options:"
echo "- Lambda Labs: ~$1.10/hour (A100)"
echo "- RunPod: ~$0.79/hour (A100)"
echo "- Vast.ai: ~$0.50/hour (varies)"
echo "- Google Colab Pro+: $50/month"
echo "========================================="
