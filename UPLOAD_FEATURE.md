# PDF Upload Feature

This document describes the PDF upload feature implementation using S3 pre-signed URLs.

## Features

- **Drag & Drop Interface**: Modern drag-and-drop file upload with visual feedback
- **Multiple File Support**: Upload up to 200 PDF files at once
- **File Validation**: Automatic validation of file type (PDF only) and size (max 10MB each)
- **Progress Tracking**: Real-time upload progress for each file
- **Concurrent Uploads**: Configurable concurrency limit (default: 5 files)
- **Multipart Upload**: Automatic chunked upload for files larger than 5MB
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **S3 Integration**: Secure uploads using AWS S3 pre-signed URLs

## Architecture

### Backend (API)

- **S3Service**: Handles pre-signed URL generation for regular uploads
- **S3MultipartService**: Manages multipart uploads for large files
- **UploadController**: API endpoints for upload management
- **MultipartController**: API endpoints for multipart upload operations

### Frontend (Client)

- **PdfUpload**: Main upload component with drag-and-drop interface
- **PdfUploadItem**: Individual file item with progress tracking
- **usePdfUpload**: Custom hook managing upload state and logic
- **useUpload**: API integration hooks for upload operations

## API Endpoints

### Regular Upload
- `POST /api/upload/presigned-urls` - Generate pre-signed URLs for file uploads

### Multipart Upload
- `POST /api/upload/multipart/initiate` - Initiate multipart upload
- `POST /api/upload/multipart/presigned-part` - Get pre-signed URL for a part
- `POST /api/upload/multipart/complete` - Complete multipart upload
- `DELETE /api/upload/multipart/abort` - Abort multipart upload

## Configuration

### Environment Variables

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=your_bucket_name_here
S3_UPLOAD_EXPIRATION=300
```

### Client Configuration

```env
VITE_API_URL=http://localhost:3001
```

## Usage

1. **Setup Environment**: Configure AWS credentials and S3 bucket
2. **Install Dependencies**: Run `npm install` in both API and client directories
3. **Start Services**: 
   - API: `npm run dev` in `apps/api`
   - Client: `npm run dev` in `apps/client`
4. **Upload Files**: Use the drag-and-drop interface on the dashboard

## File Limits

- **Maximum Files**: 200 files per upload session
- **File Size**: 10MB per file maximum
- **File Type**: PDF only (validated by content type and magic bytes)
- **Large Files**: Files >5MB automatically use multipart upload with 5MB chunks

## Security Features

- **Pre-signed URLs**: Secure, time-limited upload URLs
- **File Type Validation**: Server-side validation of PDF files
- **Content-Type Restrictions**: Enforced at S3 level
- **Server-Side Encryption**: AES256 encryption for uploaded files
- **Input Validation**: Comprehensive validation of all inputs

## Error Handling

- **File Validation Errors**: Clear messages for invalid files
- **Network Errors**: Retry logic and user feedback
- **S3 Errors**: Proper error propagation and handling
- **Upload Failures**: Individual file error tracking

## Performance Optimizations

- **Concurrent Uploads**: Configurable concurrency limit
- **Chunked Uploads**: Automatic multipart for large files
- **Progress Tracking**: Real-time progress updates
- **Memory Efficient**: Streaming uploads without loading entire files into memory

## Dependencies

### Backend
- `@aws-sdk/client-s3`: AWS S3 client
- `@aws-sdk/s3-request-presigner`: Pre-signed URL generation
- `express-validator`: Input validation
- `uuid`: Unique identifier generation

### Frontend
- `@radix-ui/react-progress`: Progress bar component
- `lucide-react`: Icons
- `@tanstack/react-query`: API state management

## Testing

The feature includes comprehensive error handling and validation. Test scenarios:

1. **Valid Uploads**: Single and multiple PDF files
2. **File Validation**: Invalid file types and sizes
3. **Network Issues**: Connection failures and timeouts
4. **Large Files**: Multipart upload functionality
5. **Concurrent Uploads**: Multiple files uploading simultaneously
