import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import { body, validationResult } from "express-validator";
import archiver from "archiver";
import axios from "axios";
import { extractStyleArchives, getStyleImages, saveStyleImage } from "./lib/styles";
import { generateImage, checkProviderAvailability } from "./lib/providers";
import { extractConceptsOpenAI } from "./lib/openai";
import { rateLimiter, strictRateLimiter, adminAuth } from "./middleware/security";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Extract style archives on startup
  extractStyleArchives().catch(console.error);

  // Apply rate limiting to all API routes
  app.use("/api", rateLimiter);

  // GET /api/ping - Check provider availability
  app.get("/api/ping", async (req, res) => {
    try {
      const availability = await checkProviderAvailability();
      res.json(availability);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/styles - Get available style images
  app.get("/api/styles", async (req, res) => {
    try {
      const styles = await getStyleImages();
      res.json(styles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/upload_style - Upload new style image
  app.post("/api/upload_style", upload.single("style"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filename = `${Date.now()}-${req.file.originalname}`;
      await saveStyleImage(req.file.buffer, filename);

      res.json({ success: true, filename });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/generate - Generate image
  app.post(
    "/api/generate",
    [
      body("prompt").isString().isLength({ min: 1, max: 2000 }),
      body("provider").isIn(["openai", "hf", "replicate", "pollinations"]),
      body("width").optional().isInt({ min: 256, max: 2048 }),
      body("height").optional().isInt({ min: 256, max: 2048 }),
      body("initImage").optional().isString(),
      body("seed").optional().isInt(),
      body("steps").optional().isInt({ min: 1, max: 150 }),
      body("guidanceScale").optional().isFloat({ min: 1, max: 20 }),
      body("referenceImage").optional().isString(),
      body("referenceStrength").optional().isFloat({ min: 0.1, max: 1.0 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const result = await generateImage({
          prompt: req.body.prompt,
          provider: req.body.provider,
          initImage: req.body.initImage,
          width: req.body.width || 1024,
          height: req.body.height || 1024,
          seed: req.body.seed,
          steps: req.body.steps,
          guidanceScale: req.body.guidanceScale,
          referenceImage: req.body.referenceImage,
          referenceStrength: req.body.referenceStrength,
        });

        res.json(result);
      } catch (error: any) {
        console.error("Generation error:", error);
        res.status(500).json({ error: error.message || "Failed to generate image" });
      }
    }
  );

  // POST /api/extract_concepts - Extract concepts from image using OpenAI Vision
  app.post(
    "/api/extract_concepts",
    [body("imageDataUri").isString()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const base64Image = req.body.imageDataUri.split(",")[1];
        const result = await extractConceptsOpenAI(base64Image);
        res.json(result);
      } catch (error: any) {
        console.error("Concept extraction error:", error);
        res.status(500).json({ error: error.message || "Failed to extract concepts" });
      }
    }
  );

  // POST /api/batch_generate - Generate multiple sizes and export as ZIP
  app.post(
    "/api/batch_generate",
    strictRateLimiter,
    [
      body("prompt").isString().isLength({ min: 1 }),
      body("sizes").isArray(),
      body("provider").isIn(["openai", "hf", "replicate", "pollinations"]),
      body("styleImageDataUri").optional().isString(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { prompt, sizes, provider, styleImageDataUri } = req.body;

        // Set response headers for ZIP download
        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="vexura-batch-${Date.now()}.zip"`
        );

        const archive = archiver("zip", { zlib: { level: 9 } });
        archive.pipe(res);

        // CSV header
        const csvRows = [
          "filename,title,prompt,model,provider,seed,width,height,license",
        ];

        // Generate images for each size
        for (let i = 0; i < sizes.length; i++) {
          const size = sizes[i];
          const [width, height] = size.includes("x")
            ? size.split("x").map(Number)
            : [Number(size), Number(size)];

          try {
            const result = await generateImage({
              prompt,
              provider,
              width,
              height,
              initImage: styleImageDataUri,
            });

            const filename = `image_${width}x${height}_${i + 1}.png`;
            const base64Data = result.image.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");

            archive.append(buffer, { name: filename });

            // Add to CSV
            csvRows.push(
              `${filename},"Generated Art","${prompt}",${result.meta.model},${provider},${result.meta.seed || ""},${width},${height},"Check LICENSE_CHECKLIST.md"`
            );

            // Add NFT metadata JSON
            const metadata = {
              name: `Vexura Art #${i + 1}`,
              description: `${prompt} - Generated by Vexura using ${result.meta.model}`,
              image: `ipfs://[CID]/${filename}`,
              attributes: [
                { trait_type: "Prompt", value: prompt },
                { trait_type: "Model", value: result.meta.model },
                { trait_type: "Provider", value: provider },
                { trait_type: "Resolution", value: `${width}x${height}` },
                ...(result.meta.seed
                  ? [{ trait_type: "Seed", value: result.meta.seed.toString() }]
                  : []),
              ],
            };

            archive.append(JSON.stringify(metadata, null, 2), {
              name: `metadata_${i + 1}.json`,
            });
          } catch (error) {
            console.error(`Failed to generate ${size}:`, error);
          }
        }

        // Add metadata CSV
        archive.append(csvRows.join("\n"), { name: "metadata.csv" });

        // Add license info
        archive.append(
          `License Attribution Information\n\nIMPORTANT: Verify model licenses before commercial use.\n\nProvider: ${provider}\nGenerated: ${new Date().toISOString()}\n\nRefer to LICENSE_CHECKLIST.md for detailed licensing requirements.`,
          { name: "license_info.txt" }
        );

        await archive.finalize();
      } catch (error: any) {
        console.error("Batch generation error:", error);
        if (!res.headersSent) {
          res.status(500).json({ error: error.message });
        }
      }
    }
  );

  // POST /api/ipfs_upload - Upload to IPFS via nft.storage
  app.post(
    "/api/ipfs_upload",
    [body("zipB64").isString()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;
        if (!NFT_STORAGE_KEY) {
          return res.status(500).json({ error: "NFT_STORAGE_KEY not configured" });
        }

        const buffer = Buffer.from(req.body.zipB64, "base64");

        const response = await axios.post(
          "https://api.nft.storage/upload",
          buffer,
          {
            headers: {
              Authorization: `Bearer ${NFT_STORAGE_KEY}`,
              "Content-Type": "application/octet-stream",
            },
          }
        );

        const cid = response.data.value.cid;
        const url = `https://ipfs.io/ipfs/${cid}`;

        res.json({ cid, url });
      } catch (error: any) {
        console.error("IPFS upload error:", error);
        res.status(500).json({
          error: error.response?.data?.message || error.message || "IPFS upload failed",
        });
      }
    }
  );

  // POST /api/marketplace/list - Admin-only marketplace listing template
  app.post(
    "/api/marketplace/list",
    adminAuth,
    [
      body("title").isString(),
      body("description").isString(),
      body("imageCid").isString(),
      body("priceEth").isFloat({ min: 0 }),
      body("royaltiesPct").isFloat({ min: 0, max: 100 }),
      body("externalUrl").isURL(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { title, description, imageCid, priceEth, royaltiesPct, externalUrl } =
          req.body;

        // Template payload for marketplace listing
        // This is a placeholder that returns the structured data needed
        // for calling marketplace APIs (OpenSea, Rarible, etc.)
        const marketplacePayload = {
          opensea: {
            name: title,
            description,
            image: `ipfs://${imageCid}`,
            external_url: externalUrl,
            attributes: [],
            // Add OpenSea-specific fields here
            // Reference: https://docs.opensea.io/docs/metadata-standards
          },
          rarible: {
            name: title,
            description,
            image: `ipfs://${imageCid}`,
            external_url: externalUrl,
            // Add Rarible-specific fields here
            // Reference: https://docs.rarible.org/
          },
          pricing: {
            priceEth,
            royaltiesPct,
          },
          instructions: {
            message:
              "This endpoint returns structured metadata for marketplace listing. To complete the listing:",
            steps: [
              "1. Use the OpenSea or Rarible SDK with your marketplace API credentials",
              "2. Call their listing/minting API with the provided payload",
              "3. Sign the transaction with your wallet",
              "4. Store the listing URL and token ID for reference",
            ],
            warning:
              "DO NOT store marketplace API keys in this codebase. Use environment variables or a secrets manager.",
          },
        };

        res.json(marketplacePayload);
      } catch (error: any) {
        console.error("Marketplace listing error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
