import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request) {
  try {
    let fileToUpload = null;
    let folder = 'farm-to-table';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      fileToUpload = body.file || body.image;
      if (body.folder) folder = body.folder;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') || formData.get('image');
      folder = formData.get('folder') || 'farm-to-table';

      if (file && typeof file !== 'string') {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fileToUpload = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
      } else if (typeof file === 'string') {
        fileToUpload = file;
      }
    }

    if (!fileToUpload) {
      return NextResponse.json(
        { error: 'No image file or data provided' },
        { status: 400 }
      );
    }

    const uploadResult = await cloudinary.uploader.upload(fileToUpload, {
      folder: folder,
      resource_type: 'auto',
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image to Cloudinary' },
      { status: 500 }
    );
  }
}
