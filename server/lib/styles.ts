import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import sharp from "sharp";

const execAsync = promisify(exec);

const STYLES_DIR = path.join(process.cwd(), "client", "public", "styles", "samples");
const THUMBS_DIR = path.join(process.cwd(), "client", "public", "styles", "thumbs");

export async function ensureStyleDirectories() {
  await fs.promises.mkdir(STYLES_DIR, { recursive: true });
  await fs.promises.mkdir(THUMBS_DIR, { recursive: true });
}

export async function extractStyleArchives() {
  await ensureStyleDirectories();

  const archives = [
    "attached_assets/Archive 4_1763623296127.zip",
    "attached_assets/Archive 5_1763623296170.zip",
  ];

  // Check if styles are already extracted
  const existingFiles = await fs.promises.readdir(STYLES_DIR).catch(() => []);
  if (existingFiles.length > 0) {
    console.log("Style images already extracted, skipping...");
    return;
  }

  console.log("Extracting style archives...");

  for (const archive of archives) {
    const archivePath = path.join(process.cwd(), archive);
    
    if (!fs.existsSync(archivePath)) {
      console.log(`Archive not found: ${archive}, skipping...`);
      continue;
    }

    try {
      await execAsync(`unzip -o -j "${archivePath}" -d "${STYLES_DIR}" "*.png" "*.jpg" "*.jpeg" "*.webp" 2>/dev/null || true`);
      console.log(`Extracted ${archive}`);
    } catch (error) {
      console.error(`Failed to extract ${archive}:`, error);
    }
  }

  // Generate thumbnails
  await generateThumbnails();
}

async function generateThumbnails() {
  const files = await fs.promises.readdir(STYLES_DIR);
  const imageFiles = files.filter((f) =>
    /\.(png|jpg|jpeg|webp)$/i.test(f)
  );

  console.log(`Generating thumbnails for ${imageFiles.length} images...`);

  for (const file of imageFiles) {
    const inputPath = path.join(STYLES_DIR, file);
    const outputPath = path.join(THUMBS_DIR, file.replace(/\.[^.]+$/, ".jpg"));

    try {
      await sharp(inputPath)
        .resize(320, 320, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
    } catch (error) {
      console.error(`Failed to create thumbnail for ${file}:`, error);
    }
  }

  console.log("Thumbnail generation complete");
}

export async function getStyleImages(): Promise<
  Array<{ name: string; thumbUri: string; dataUri: string }>
> {
  await ensureStyleDirectories();

  const files = await fs.promises.readdir(STYLES_DIR).catch(() => []);
  const imageFiles = files.filter((f) =>
    /\.(png|jpg|jpeg|webp)$/i.test(f)
  );

  const styles = await Promise.all(
    imageFiles.slice(0, 50).map(async (file) => {
      const thumbPath = path.join(THUMBS_DIR, file.replace(/\.[^.]+$/, ".jpg"));
      const imagePath = path.join(STYLES_DIR, file);

      // Use thumb if it exists, otherwise use original
      const displayPath = fs.existsSync(thumbPath) ? thumbPath : imagePath;

      const thumbBuffer = await fs.promises.readFile(displayPath);
      const imageBuffer = await fs.promises.readFile(imagePath);

      const thumbBase64 = thumbBuffer.toString("base64");
      const imageBase64 = imageBuffer.toString("base64");

      return {
        name: file,
        thumbUri: `data:image/jpeg;base64,${thumbBase64}`,
        dataUri: `data:image/jpeg;base64,${imageBase64}`,
      };
    })
  );

  return styles;
}

export async function saveStyleImage(
  buffer: Buffer,
  filename: string
): Promise<void> {
  await ensureStyleDirectories();

  const imagePath = path.join(STYLES_DIR, filename);
  await fs.promises.writeFile(imagePath, buffer);

  // Generate thumbnail
  const thumbPath = path.join(THUMBS_DIR, filename.replace(/\.[^.]+$/, ".jpg"));
  await sharp(buffer)
    .resize(320, 320, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toFile(thumbPath);
}
