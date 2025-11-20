# Vexura Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from premium AI creative platforms (Midjourney, Runway ML, Adobe Firefly) and professional design tools (Linear, Notion) to create a sophisticated, art-focused interface where generated content takes center stage.

**Core Principle**: Dark, refined aesthetic with strategic use of neo-noir accents that positions Vexura as a professional-grade creative tool while keeping the UI minimal to let artwork shine.

---

## Typography

**Font Stack**:
- **Primary**: Inter (400, 500, 600) via Google Fonts for UI elements, buttons, labels
- **Display**: Space Grotesk (500, 700) via Google Fonts for headings, hero text, section titles

**Hierarchy**:
- Hero Headline: text-6xl md:text-7xl font-bold tracking-tight (Space Grotesk)
- Section Headers: text-3xl md:text-4xl font-bold (Space Grotesk)
- Subheadings: text-xl md:text-2xl font-semibold (Inter)
- Body: text-base font-normal leading-relaxed (Inter)
- Labels/Metadata: text-sm font-medium (Inter)
- Captions: text-xs font-normal (Inter)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-24
- Grid gaps: gap-4 to gap-8
- Element margins: mb-4, mt-8, mx-4

**Container Strategy**:
- Homepage sections: max-w-7xl mx-auto
- Canvas workspace: Full viewport with w-full
- Prompt panels: max-w-md to max-w-lg
- Gallery grids: max-w-screen-2xl mx-auto

---

## Component Library

### Navigation
**Header**: Fixed top navigation with translucent backdrop blur
- Logo left, main nav center, user actions right
- Height: h-16
- Backdrop: backdrop-blur-lg with subtle border-b

### Homepage Layout

**Hero Section** (h-screen):
- Full-viewport with gradient overlay background image showcasing stunning AI-generated art
- Centered content with max-w-4xl
- Large headline + supporting text + dual CTA buttons (primary "Create Now" + secondary "View Gallery")
- Subtle animated particles or gradient mesh background effect

**Features Grid** (3-column on desktop, 1-column mobile):
- Feature cards with icon, title, description
- Grid: grid-cols-1 md:grid-cols-3 gap-8
- Card padding: p-6 to p-8

**Gallery Showcase** (4-column masonry):
- Highlight generated artwork examples
- Staggered heights for visual interest
- Hover effects with metadata overlay

**CTA Section**:
- Full-width with gradient background
- Centered content with primary action

### Canvas Workspace Layout

**Three-Panel Layout**:
- Left Sidebar (w-80): Prompt input, generation controls, provider selection, preset templates
- Center Canvas (flex-1): Large preview area (min-h-screen) with generated artwork display and zoom capability
- Right Sidebar (w-96): Style Palette gallery with scrollable thumbnail grid (grid-cols-2 gap-4)

**Prompt Panel Components**:
- Large textarea (min-h-32) with character count
- Accordion sections for advanced controls (steps, guidance, seed)
- Provider selector as segmented control
- Generate button (w-full, prominent)

**Style Palette Gallery**:
- Thumbnail grid: grid-cols-2 gap-4
- Card size: aspect-square with rounded-lg
- Selected state: border-2 with accent glow
- Upload new style button at top

**Preview Canvas**:
- Centered artwork display with max dimensions
- Zoom modal on click (full-screen overlay)
- Metadata bar below (prompt, provider, dimensions, seed)
- Action buttons: Download, Export, Upload to IPFS

### Gallery & Recent Creations

**Gallery Grid** (responsive columns):
- Desktop: grid-cols-4 gap-6
- Tablet: grid-cols-3 gap-4  
- Mobile: grid-cols-2 gap-3

**Gallery Card**:
- Artwork thumbnail with aspect-square
- Title overlay on hover with gradient
- Metadata tags (provider, size, CID if uploaded)
- Quick actions: view, download, delete

### Modals & Overlays

**Batch Export Modal**:
- Center overlay with max-w-2xl
- Size checkboxes in grid
- Metadata preview table
- License toggle with explanatory text
- Export button (primary, full-width)

**IPFS Upload Modal**:
- Progress indicator during upload
- Success state showing CID + gateway URL
- Copy CID button
- View on IPFS gateway link

**Zoom/Preview Modal**:
- Full-screen overlay with backdrop-blur
- Centered artwork (max-h-90vh)
- Close button (top-right)
- Navigation arrows if in gallery context

### Forms & Inputs

**Text Inputs/Textareas**:
- Border with focus:ring accent
- Padding: px-4 py-3
- Rounded: rounded-lg
- Background: subtle contrast from page

**Buttons**:
- Primary: Gradient background with hover lift effect, px-8 py-3, rounded-lg
- Secondary: Border with transparent background, px-6 py-2.5
- Icon buttons: p-2 with hover:bg-accent/10

**Sliders/Range Inputs**:
- Custom styled with accent track
- Value display label

### Progress & Feedback

**Generation Progress**:
- Linear progress bar with indeterminate state
- Status text updates ("Generating...", "Processing...")
- If Replicate: show intermediate thumbnails in grid

**Toast Notifications**:
- Fixed bottom-right
- Success/Error states with icons
- Auto-dismiss after 5s

---

## Animations

**Minimal Motion Strategy** - Use sparingly for polish:
- Page transitions: Fade + slight slide (Framer Motion)
- Gallery card hover: Scale 1.02 with smooth transition
- Button hover: Subtle lift (translateY -1px)
- Modal entry/exit: Fade + scale from 0.95 to 1
- **No parallax, no excessive scroll animations**

---

## Images

**Hero Background**: Full-bleed showcase image featuring stunning AI-generated artwork (abstract neon or futuristic surrealism style) with gradient overlay for text readability

**Gallery Showcase**: 8-12 curated example artworks demonstrating Vexura's capabilities across different styles (Abstract Neon, Cyberpunk, Organic Sculpture, Dreamscape)

**Style Palette Thumbnails**: Extracted from Archive 4 & 5 zip files, displayed as clickable gallery

**Feature Section Icons**: Use Heroicons for feature cards (Sparkles, Photo, CloudArrow, CubeTransparent, ShieldCheck, Bolt)

**Buttons on Images**: All CTA buttons over hero/images use `backdrop-blur-md bg-white/10` with border for legibility

---

## Accessibility

- All interactive elements with proper aria-labels
- Keyboard navigation throughout (tab order, escape to close modals)
- Focus indicators with visible ring
- Alt text for all generated artwork
- Color contrast meeting WCAG AA standards
- Screen reader announcements for generation status