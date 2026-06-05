import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/r2';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowedFolders = ['logos', 'products'];
    const targetFolder = allowedFolders.includes(folder) ? folder : 'misc';

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const filename = `${crypto.randomUUID()}.${fileExtension}`;
    const objectKey = `${targetFolder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${objectKey}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
