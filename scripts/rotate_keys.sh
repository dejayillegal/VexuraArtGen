#!/bin/bash

# Vexura Admin API Key Rotation Script
# This script helps you rotate the ADMIN_API_KEY safely

echo "========================================="
echo "Vexura Admin API Key Rotation"
echo "========================================="
echo ""

# Generate a new secure random key
NEW_KEY=$(openssl rand -base64 32 | tr -d /=+ | cut -c1-32)

echo "Generated new Admin API Key:"
echo "$NEW_KEY"
echo ""

echo "Next steps:"
echo "1. Update your .env file or Replit Secrets with this new key:"
echo "   ADMIN_API_KEY=$NEW_KEY"
echo ""
echo "2. If using Vercel/Heroku/Render, update the environment variable in your dashboard"
echo ""
echo "3. Restart your application for changes to take effect"
echo ""
echo "4. Test the new key with a marketplace API call:"
echo "   curl -X POST https://your-domain.com/api/marketplace/list \\"
echo "     -H 'x-api-key: $NEW_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{...}'"
echo ""
echo "5. Once verified, revoke any old admin keys"
echo ""

read -p "Would you like to save this key to .env file? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f .env ]; then
        # Backup existing .env
        cp .env .env.backup
        echo "Created backup at .env.backup"
        
        # Update or add ADMIN_API_KEY
        if grep -q "ADMIN_API_KEY=" .env; then
            sed -i "s/ADMIN_API_KEY=.*/ADMIN_API_KEY=$NEW_KEY/" .env
            echo "Updated ADMIN_API_KEY in .env"
        else
            echo "ADMIN_API_KEY=$NEW_KEY" >> .env
            echo "Added ADMIN_API_KEY to .env"
        fi
        
        echo "✅ Key rotation complete!"
        echo "⚠️  Remember to restart your application"
    else
        echo "No .env file found. Please create one from .env.example"
        echo "And add: ADMIN_API_KEY=$NEW_KEY"
    fi
else
    echo "Key not saved. Please manually update your environment variables."
fi

echo ""
echo "========================================="
echo "Security Reminders:"
echo "- Never commit .env to git"
echo "- Store keys in secrets manager for production"
echo "- Rotate keys every 90 days"
echo "- Monitor access logs for unauthorized attempts"
echo "========================================="
