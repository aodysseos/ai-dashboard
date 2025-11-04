import { 
  CreateMultipartUploadCommand, 
  UploadPartCommand, 
  CompleteMultipartUploadCommand, 
  AbortMultipartUploadCommand,
  ServerSideEncryption
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Clients } from './s3.client';

// Module-level S3 client configuration (initialized once)
const { s3Client, presignClient, bucketName, uploadExpiration } = createS3Clients();

/**
 * Initiate a multipart upload
 */
export async function initiateMultipartUpload(
  key: string,
  contentType: string = 'application/pdf'
): Promise<{ uploadId: string; key: string }> {
  try {
    if (contentType !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    const isDevelopment = process.env['NODE_ENV'] === 'development';
    
    // Build command options
    const commandOptions: {
      Bucket: string;
      Key: string;
      ContentType: string;
      ServerSideEncryption?: ServerSideEncryption;
    } = {
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    };

    // Only add server-side encryption for production (AWS S3)
    // Minio handles encryption differently
    if (!isDevelopment) {
      commandOptions.ServerSideEncryption = ServerSideEncryption.AES256;
    }

    const command = new CreateMultipartUploadCommand(commandOptions);

    const response = await s3Client.send(command);
    
    if (!response.UploadId) {
      throw new Error('Failed to initiate multipart upload');
    }

    return {
      uploadId: response.UploadId,
      key: key,
    };
  } catch (error) {
    console.error('Error initiating multipart upload:', error);
    throw new Error('Failed to initiate multipart upload');
  }
}

/**
 * Generate pre-signed URL for uploading a part
 */
export async function generatePresignedPartUrl(
  key: string,
  uploadId: string,
  partNumber: number
): Promise<{ uploadUrl: string; expiresAt: Date }> {
  try {
    const command = new UploadPartCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    // Use presignClient for generating pre-signed URLs with correct signature
    const presignedUrl = await getSignedUrl(presignClient, command, {
      expiresIn: uploadExpiration,
    });

    return {
      uploadUrl: presignedUrl,
      expiresAt: new Date(Date.now() + uploadExpiration * 1000),
    };
  } catch (error) {
    console.error('Error generating pre-signed part URL:', error);
    throw new Error('Failed to generate pre-signed part URL');
  }
}

/**
 * Complete a multipart upload
 */
export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: Array<{ partNumber: number; etag: string }>
): Promise<{ location: string; etag: string }> {
  try {
    const command = new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map(part => ({
          ETag: part.etag,
          PartNumber: part.partNumber,
        })),
      },
    });

    const response = await s3Client.send(command);
    
    if (!response.Location || !response.ETag) {
      throw new Error('Failed to complete multipart upload');
    }

    return {
      location: response.Location,
      etag: response.ETag,
    };
  } catch (error) {
    console.error('Error completing multipart upload:', error);
    throw new Error('Failed to complete multipart upload');
  }
}

/**
 * Abort a multipart upload
 */
export async function abortMultipartUpload(key: string, uploadId: string): Promise<void> {
  try {
    const command = new AbortMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error aborting multipart upload:', error);
    throw new Error('Failed to abort multipart upload');
  }
}

