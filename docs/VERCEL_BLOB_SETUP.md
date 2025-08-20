****# Vercel Blob Storage Setup

This project now uses Vercel Blob Storage for image uploads. Follow these steps to configure it:

## 1. Environment Variables

Add the following environment variable to your `.env.local` file:

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxxxx"
```

## 2. Getting the Blob Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage > Blob
3. Create a new Blob store if you haven't already
4. Copy the `BLOB_READ_WRITE_TOKEN` from the store settings

## 3. Features

- **Automatic Upload**: Images are uploaded to Vercel Blob when users select files
- **URL Storage**: Only the Blob URL is stored in the database (not base64 data)
- **File Validation**: Supports image files up to 5MB
- **Auto Cleanup**: Unused files are automatically cleaned up after 30 days (free tier)

## 4. API Endpoints

- `POST /api/upload` - Upload image files to Vercel Blob
- `DELETE /api/upload?url=...` - Mark files for cleanup (optional)

## 5. Usage

The `PhotoUpload` component now automatically uploads files to Vercel Blob Storage:

```tsx
<PhotoUpload
  value={formData.photo}
  onChange={(value) => setFormData({ ...formData, photo: value })}
  label="Photo (Optional)"
  placeholder="Enter photo URL or upload file"
/>
```

The component handles both:
- Direct URL input (for external images)
- File upload (automatically uploads to Vercel Blob)

## 6. Security

- Authentication required for all uploads
- File type validation (images only)
- File size limits (5MB max)
- Public read access for uploaded images
