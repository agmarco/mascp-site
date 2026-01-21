import fs from 'fs-extra';
import path from 'path';
import https from 'https';
import http from 'http';
import crypto from 'crypto';
import { URL } from 'url';

/**
 * Download an image from a URL
 * @param {string} imageUrl - URL of the image
 * @param {string} outputDir - Directory to save the image
 * @returns {Promise<{success: boolean, localPath: string, error?: string}>}
 */
export async function downloadImage(imageUrl, outputDir) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(imageUrl);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      // Generate a filename from the URL
      let filename = path.basename(urlObj.pathname);

      // Handle Wix image URLs which may have complex paths
      if (imageUrl.includes('wixstatic.com')) {
        // Try multiple patterns for Wix image IDs
        // Pattern 1: e30e9f_f300e9ef745c4816babb6bf644e39537~mv2.png (with ~mv2)
        // Pattern 2: e30e9f_2c9b2b7112a2483d8fa99b16bd3c3c5c.jpg (with underscore)
        // Pattern 3: ce6ec7c11b174c0581e20f42bb865ce3.png (just hex)
        const patterns = [
          /([a-f0-9]+_[a-f0-9]+~mv2[^/]*\.[a-z]+)/i,
          /([a-f0-9]+_[a-f0-9]+\.[a-z]+)/i,
          /\/media\/([a-f0-9]{20,}\.[a-z]+)/i,
        ];

        let matched = false;
        for (const pattern of patterns) {
          const match = imageUrl.match(pattern);
          if (match) {
            filename = match[1].replace(/[~%]/g, '_');
            matched = true;
            break;
          }
        }

        if (!matched) {
          // Fallback: use MD5 hash of full URL for uniqueness
          const hash = crypto.createHash('md5').update(imageUrl).digest('hex');
          const ext = imageUrl.match(/\.([a-z]+)(?:\?|$)/i)?.[1] || 'jpg';
          filename = `img_${hash}.${ext}`;
        }
      }

      // Ensure valid extension
      if (!filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        filename += '.jpg';
      }

      const localPath = path.join(outputDir, filename);

      // Check if already downloaded
      if (fs.existsSync(localPath)) {
        resolve({ success: true, localPath, skipped: true });
        return;
      }

      const file = fs.createWriteStream(localPath);

      const request = protocol.get(imageUrl, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          file.close();
          fs.unlinkSync(localPath);
          downloadImage(response.headers.location, outputDir).then(resolve);
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(localPath);
          resolve({ success: false, localPath: '', error: `HTTP ${response.statusCode}` });
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve({ success: true, localPath });
        });
      });

      request.on('error', (err) => {
        file.close();
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
        resolve({ success: false, localPath: '', error: err.message });
      });

      // Timeout after 30 seconds
      request.setTimeout(30000, () => {
        request.destroy();
        resolve({ success: false, localPath: '', error: 'Timeout' });
      });

    } catch (err) {
      resolve({ success: false, localPath: '', error: err.message });
    }
  });
}

/**
 * Download all images from extracted page data
 * @param {Array<{src: string, cleanSrc: string, alt: string}>} images
 * @param {string} outputDir
 * @returns {Promise<Array>}
 */
export async function downloadAllImages(images, outputDir) {
  await fs.ensureDir(outputDir);

  const results = [];
  const seen = new Set();

  for (const img of images) {
    // Use the clean source URL for downloading (full resolution)
    const url = img.cleanSrc || img.src;

    // Skip duplicates
    if (seen.has(url)) continue;
    seen.add(url);

    console.log(`  Downloading: ${url.substring(0, 80)}...`);
    const result = await downloadImage(url, outputDir);
    results.push({
      originalUrl: img.src,
      cleanUrl: url,
      alt: img.alt,
      ...result
    });

    // Small delay to be nice to the server
    await new Promise(r => setTimeout(r, 200));
  }

  return results;
}
