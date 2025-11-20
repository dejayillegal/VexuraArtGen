#!/bin/bash

# Vexura - Replicate Fine-tuning Script
# Fine-tune Stable Diffusion on your custom dataset

echo "========================================="
echo "Vexura Replicate Fine-tuning"
echo "========================================="
echo ""

# Configuration
MODEL_NAME="vexura-custom-model"
DATASET_PATH="./dataset"
REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN:-""}

# Check for API token
if [ -z "$REPLICATE_API_TOKEN" ]; then
    echo "Error: REPLICATE_API_TOKEN not set"
    echo "Please set: export REPLICATE_API_TOKEN=your_token"
    exit 1
fi

# Check dataset structure
if [ ! -d "$DATASET_PATH/images" ]; then
    echo "Error: Dataset directory not found"
    echo ""
    echo "Expected structure:"
    echo "dataset/"
    echo "  images/"
    echo "    img001.png"
    echo "    img002.png"
    echo "    ..."
    echo "  captions.txt"
    echo ""
    exit 1
fi

# Count images
IMAGE_COUNT=$(ls -1 "$DATASET_PATH/images" | wc -l)
echo "Found $IMAGE_COUNT images in dataset"

# Estimate cost
if [ $IMAGE_COUNT -lt 100 ]; then
    echo "⚠️  Warning: Dataset too small (minimum 100 images recommended)"
    COST_ESTIMATE="$200-$500"
elif [ $IMAGE_COUNT -lt 500 ]; then
    COST_ESTIMATE="$500-$800"
elif [ $IMAGE_COUNT -lt 2000 ]; then
    COST_ESTIMATE="$800-$3000"
else
    COST_ESTIMATE="$3000+"
fi

echo "Estimated cost: $COST_ESTIMATE"
echo ""

read -p "Continue with fine-tuning? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Fine-tuning cancelled"
    exit 0
fi

# Create dataset archive
echo "Creating dataset archive..."
cd "$DATASET_PATH"
tar -czf ../dataset.tar.gz images/ captions.txt
cd ..

echo "✅ Dataset archive created: dataset.tar.gz"
echo ""

# Upload to Replicate (example - actual implementation varies)
echo "Next steps:"
echo "1. Upload dataset.tar.gz to a publicly accessible URL (S3, Google Cloud Storage, etc.)"
echo "2. Create a training job on Replicate:"
echo ""
echo "   curl -s -X POST \\"
echo "     -H 'Authorization: Token $REPLICATE_API_TOKEN' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"version\": \"...\", \"input\": {\"dataset_url\": \"https://your-url/dataset.tar.gz\"}}' \\"
echo "     https://api.replicate.com/v1/trainings"
echo ""
echo "3. Monitor training progress:"
echo "   https://replicate.com/trainings"
echo ""
echo "4. Once complete, use your custom model:"
echo "   - Model ID will be: your-username/$MODEL_NAME"
echo "   - Update Vexura to use this model"
echo ""

# Cost breakdown
echo "========================================="
echo "Cost Breakdown (Approximate)"
echo "========================================="
echo "Training compute: Variable based on steps"
echo "- Small (10k steps): ~$100-300"
echo "- Medium (25k steps): ~$300-800"
echo "- Large (50k+ steps): ~$800+"
echo ""
echo "Storage: ~$0.10/GB/month"
echo "Inference: ~$0.005-0.02 per generation"
echo ""
echo "See README_finetuning.md for detailed cost analysis"
echo "========================================="
