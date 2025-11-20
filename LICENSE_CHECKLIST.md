# Commercial Licensing Checklist

**CRITICAL: Review this checklist before selling or commercially using any AI-generated artwork.**

## Pre-Launch Verification

### ☐ 1. Identify All Models Used

Document every AI model used in your generation pipeline:

- **OpenAI DALL-E 3**
  - Model Card: https://platform.openai.com/docs/models/dall-e
  - License Type: Commercial use allowed per OpenAI Terms of Service
  - Attribution Required: No
  - Notes: Subject to OpenAI's usage policies and content policy

- **Hugging Face - Stable Diffusion 2.1**
  - Model Card: https://huggingface.co/stabilityai/stable-diffusion-2-1
  - License Type: CreativeML Open RAIL++-M License
  - Commercial Use: ✅ Allowed
  - Attribution Required: Recommended but not mandatory
  - Restrictions: Cannot use to generate illegal content, harm minors, or defame individuals

- **Replicate - Stable Diffusion**
  - Model Card: Check specific model version on Replicate
  - License Type: Varies by model version
  - Commercial Use: ⚠️ Verify for your specific model version
  - Attribution Required: Check model card

### ☐ 2. Verify Commercial Rights

For each model:

1. **Read the full license text** - Don't rely on summaries
2. **Save a copy** - Model licenses can change; keep dated copies
3. **Screenshot model card** - Document the license status at time of use
4. **Note the date** - Record when you verified the license

### ☐ 3. Check Usage Restrictions

Common restrictions to watch for:

- ❌ **Prohibited Uses**
  - Illegal content
  - Harming minors
  - Generating false information
  - Defamation or harassment
  - Adult content (some models)
  - Deepfakes of real people

- ⚠️ **Limited Uses**
  - Medical advice
  - Legal advice
  - Financial advice
  - Political content

### ☐ 4. Attribution Requirements

Even if not required, consider including model attribution:

**Recommended Attribution Format:**
```
Generated using [Model Name] by [Provider]
Model: [URL to model card]
License: [License type]
```

**Example:**
```
Generated using DALL-E 3 by OpenAI
Licensed under OpenAI Terms of Service
https://platform.openai.com/docs/models/dall-e
```

### ☐ 5. NFT Metadata Requirements

When minting NFTs, include provenance information:

```json
{
  "name": "Artwork Title",
  "description": "Description including generation method",
  "attributes": [
    { "trait_type": "Model", "value": "dall-e-3" },
    { "trait_type": "Provider", "value": "OpenAI" },
    { "trait_type": "License", "value": "OpenAI TOS" },
    { "trait_type": "Generated", "value": "2024-01-15" },
    { "trait_type": "Prompt", "value": "Your prompt here" }
  ]
}
```

### ☐ 6. Terms of Service Compliance

Review and comply with:

- **OpenAI Usage Policies**: https://openai.com/policies/usage-policies
- **Hugging Face Terms**: https://huggingface.co/terms-of-service
- **Replicate Terms**: https://replicate.com/terms
- **NFT.Storage Terms**: https://nft.storage/terms/

### ☐ 7. Marketplace Requirements

If listing on NFT marketplaces:

- **OpenSea**
  - Verify you own commercial rights
  - Provide accurate metadata
  - Follow OpenSea Terms of Service

- **Rarible**
  - Ensure proper licensing documentation
  - Include provenance information

- **Foundation / SuperRare**
  - May have stricter authenticity requirements
  - May require proof of original creation rights

### ☐ 8. Legal Review (Recommended)

For large-scale commercial operations:

1. **Consult an IP attorney** - Laws vary by jurisdiction
2. **Review local regulations** - Some countries have specific AI art laws
3. **Insurance** - Consider IP insurance for commercial operations
4. **Terms of Sale** - Draft clear terms for your buyers

### ☐ 9. Ongoing Compliance

- **Monitor license changes** - Model licenses can be updated
- **Keep records** - Maintain generation logs and license documentation
- **Update attribution** - If licenses change, update your metadata
- **Review quarterly** - Regularly check for license or policy updates

## Red Flags 🚩

**DO NOT use commercially if:**

- ❌ Model license explicitly prohibits commercial use
- ❌ Model is marked "Research Only" or "Non-Commercial"
- ❌ You cannot find clear licensing information
- ❌ License requires case-by-case approval you haven't obtained
- ❌ Model card says "License Unknown"

## Best Practices

1. **Always use commercial-licensed models** when creating for sale
2. **Keep dated records** of all license verifications
3. **Include attribution** even when not required (builds trust)
4. **Be transparent** with buyers about AI generation
5. **Stay informed** about evolving AI art regulations

## Resources

- OpenAI Usage Policies: https://openai.com/policies/usage-policies
- Hugging Face Model Licensing: https://huggingface.co/docs/hub/model-cards
- Creative Commons Licenses: https://creativecommons.org/licenses/
- Electronic Frontier Foundation (IP): https://www.eff.org/

## Disclaimer

This checklist provides general guidance and is not legal advice. Laws regarding AI-generated content are evolving. Consult with a qualified attorney before commercial operations.

**Last Updated:** November 2024

---

## Quick Reference: Model License Status

| Provider | Model | Commercial Use | Attribution | License |
|----------|-------|----------------|-------------|---------|
| OpenAI | DALL-E 3 | ✅ Yes | No | OpenAI TOS |
| Hugging Face | SD 2.1 | ✅ Yes | Recommended | CreativeML Open RAIL++ |
| Replicate | Various | ⚠️ Check | ⚠️ Check | Varies |

**Note:** This table is provided for reference only. Always verify current license status before commercial use.
