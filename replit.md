# Vexura - AI Art Generation Platform

## Overview

Vexura is a professional-grade AI art generation platform that enables users to create high-value digital artwork and NFT-ready packages. The application supports multiple AI providers (OpenAI DALL-E, Hugging Face Stable Diffusion, and Replicate), offering text-to-image generation, image-to-image style transfer, and AI-powered concept extraction. Users can export artwork in multiple sizes with metadata, upload to IPFS for decentralized storage, and prepare NFT-ready packages for marketplace listing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18+ with TypeScript
- Vite for build tooling and development server
- Wouter for client-side routing
- TanStack Query (React Query) for server state management
- IndexedDB (via idb library) for local artwork storage

**UI Framework:**
- Tailwind CSS for styling with custom design system
- Radix UI primitives for accessible components
- Shadcn/ui component library
- Framer Motion for animations and transitions
- Custom dark theme with neo-noir accents

**Design Approach:**
The UI follows a dark, refined aesthetic inspired by premium creative platforms (Midjourney, Runway ML, Adobe Firefly). The design system uses a custom typography stack (Inter for UI, Space Grotesk for display) with consistent spacing primitives and elevation patterns.

**State Management:**
- Client-side generation history stored in IndexedDB (persistent local storage)
- Server state managed through React Query with disabled refetching
- Component state for UI interactions and form management

**Key Pages:**
1. **Home** - Landing page with hero section and feature highlights
2. **Create** - Three-panel workspace (prompt controls, preview canvas, style palette)
3. **Gallery** - Grid view of locally stored generations with management actions
4. **404** - Not found page

### Backend Architecture

**Technology Stack:**
- Node.js 18+ with Express.js
- TypeScript for type safety
- Drizzle ORM configured for PostgreSQL (database schema defined but storage currently in-memory)

**API Design:**
RESTful API with JSON payloads, structured around generation workflows:
- `/api/generate` - Main image generation endpoint
- `/api/styles` - Style palette management
- `/api/batch_generate` - Multi-size export generation
- `/api/ipfs_upload` - IPFS/nft.storage integration
- `/api/extract_concepts` - AI vision-based concept extraction
- `/api/ping` - Provider availability check

**Provider Abstraction:**
The system abstracts multiple AI providers behind a unified interface:
- **OpenAI** - DALL-E 3 for high-quality generation, GPT-5 for vision/concept extraction
- **Hugging Face** - Stable Diffusion 2.1 via Inference API
- **Replicate** - Flexible model support via Replicate API

Each provider has a dedicated module with consistent response formatting.

**Security & Production Hardening:**
- Helmet.js for security headers (CSP, XSS protection)
- Express-rate-limit for rate limiting (30 req/min general, 5 req/min for expensive operations)
- Admin API key authentication for protected endpoints
- Input validation using express-validator
- File upload size limits (50MB max)
- CORS restrictions

**File Processing:**
- Multer for multipart form uploads (style images)
- Sharp for image processing and thumbnail generation
- Archiver for batch export ZIP creation
- Style archives automatically extracted on server startup

### Data Storage

**Client-Side Storage (IndexedDB):**
- Database: `vexura-db`
- Object Store: `generations`
- Schema: Generation objects with id, prompt, provider, model, imageDataUri, dimensions, metadata, and optional IPFS CID
- Indexed by `createdAt` for chronological retrieval

**Server-Side Storage:**
- In-memory storage for user data (MemStorage class)
- File system storage for style images (`client/public/styles/samples/` and `thumbs/`)
- Drizzle schema defined for future PostgreSQL migration

**Database Schema (Drizzle):**
Configuration prepared for PostgreSQL with Neon serverless driver. Schema includes user model with username and id fields. The application is structured to easily add database persistence when `DATABASE_URL` is provided.

### External Dependencies

**AI Service Providers:**
- **OpenAI API** - DALL-E 3 image generation, GPT-5 vision model for concept extraction
  - Requires: `OPENAI_API_KEY`
  - Models: dall-e-3, gpt-5
  
- **Hugging Face** - Stable Diffusion 2.1 inference
  - Requires: `HF_API_TOKEN`
  - Model: stabilityai/stable-diffusion-2-1
  - License: CreativeML Open RAIL++-M (commercial use allowed)
  
- **Replicate** - Flexible model hosting
  - Requires: `REPLICATE_API_TOKEN`
  - Supports various Stable Diffusion variants

**IPFS/NFT Infrastructure:**
- **nft.storage** - Decentralized storage via IPFS pinning
  - Requires: `NFT_STORAGE_KEY`
  - Provides CID and gateway URLs for uploaded content

**Development & Deployment:**
- Replit integration with cartographer and dev-banner plugins
- Vite runtime error overlay for development
- Environment variable management via `.env` or Replit Secrets

**Security Configuration:**
- `ADMIN_API_KEY` - Required for admin-protected endpoints
- Production environment detection via `NODE_ENV`
- Configurable port via `PORT` environment variable

**Frontend Libraries:**
- Form management: React Hook Form with Zod validation
- Date utilities: date-fns
- Animation: Framer Motion
- Icons: Lucide React
- Styling: clsx, tailwind-merge, class-variance-authority

**API Communication:**
All external API calls use axios with proper error handling. The client uses a custom `apiRequest` wrapper that handles JSON serialization, credentials, and error responses.