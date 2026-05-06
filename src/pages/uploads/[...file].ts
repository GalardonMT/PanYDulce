import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

export const GET: APIRoute = async ({ params }) => {
  const file = params.file;

  if (!file || file.includes('..') || file.includes('\0')) {
    return new Response('Forbidden', { status: 403 });
  }

  const filePath = path.join(process.cwd(), 'public', 'uploads', file);
  const normalizedPath = path.normalize(filePath);
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  if (!normalizedPath.startsWith(uploadsDir)) {
    return new Response('Forbidden', { status: 403 });
  }

  if (!fs.existsSync(normalizedPath)) {
    return new Response('Not Found', { status: 404 });
  }

  const ext = path.extname(normalizedPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const buffer = fs.readFileSync(normalizedPath);

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
