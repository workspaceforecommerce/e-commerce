import { Hono } from 'hono';

export interface Env {
  DB: D1Database;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}

const cloudinaryApp = new Hono<{ Bindings: Env }>();

// Generate Cloudinary Upload Signature (Signed Uploads)
cloudinaryApp.post('/signature', async (c) => {
  const cloudName = c.env?.CLOUDINARY_CLOUD_NAME || 'hfx4iebd';
  const apiKey = c.env?.CLOUDINARY_API_KEY || '558348261266151';
  const apiSecret = c.env?.CLOUDINARY_API_SECRET || '2dzEa8FM1tInmLToZM1ZqwE7jI4';

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'healthy_monks_products';

  // String to sign for Cloudinary: folder=...&timestamp=...<api_secret>
  const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

  // Use Web Crypto API SHA-1 digest (compatible with Cloudflare Workers)
  const msgUint8 = new TextEncoder().encode(strToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return c.json({
    success: true,
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  });
});

export default cloudinaryApp;
