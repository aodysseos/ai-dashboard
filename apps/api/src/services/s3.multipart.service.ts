import { 
  S3Client, 
  CreateMultipartUploadCommand, 
  UploadPartCommand, 
  CompleteMultipartUploadCommand, 
  AbortMultipartUploadCommand,
  ServerSideEncryption
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3MultipartService {
  private s3Client: S3Client; // For direct S3 operations (initiate, complete, abort)
  private presignClient: S3Client; // For generating pre-signed URLs
  private bucketName: string;
  private uploadExpiration: number;

  constructor() {
    const isDevelopment = process.env['NODE_ENV'] === 'development';
    
    // Use hardcoded bucket name for development, environment variable for production
    this.bucketName = isDevelopment 
      ? 'ai-dashboard-dev'
      : (process.env['S3_BUCKET_NAME'] || 'test-bucket');
    
    this.uploadExpiration = parseInt(process.env['S3_UPLOAD_EXPIRATION'] || '300', 10);

    if (isDevelopment) {
      // Development: Use Minio with two different clients
      const credentials = {
        accessKeyId: 'minioadmin',
        secretAccessKey: 'minioadmin',
      };
      
      // Client for direct S3 operations (uses internal Docker network)
      this.s3Client = new S3Client({
        region: 'us-east-1',
        endpoint: 'http://minio:9000',
        forcePathStyle: true,
        credentials,
      });
      
      // Client for generating pre-signed URLs (uses public endpoint for correct signatures)
      const publicEndpoint = process.env['S3_PUBLIC_ENDPOINT'] || 'http://localhost:9000';
      this.presignClient = new S3Client({
        region: 'us-east-1',
        endpoint: publicEndpoint,
        forcePathStyle: true,
        credentials,
      });
    } else {
      // Production: Use AWS S3 with environment variables
      const region = process.env['AWS_REGION'] || 'us-east-1';
      const accessKeyId = process.env['AWS_ACCESS_KEY_ID'] || 'test-access-key';
      const secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY'] || 'test-secret-key';

      const client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      
      this.s3Client = client;
      this.presignClient = client; // Same client for production
    }
  }

  /**
   * Initiate a multipart upload
   */
  async initiateMultipartUpload(
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
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      };

      // Only add server-side encryption for production (AWS S3)
      // Minio handles encryption differently
      if (!isDevelopment) {
        commandOptions.ServerSideEncryption = ServerSideEncryption.AES256;
      }

      const command = new CreateMultipartUploadCommand(commandOptions);

      const response = await this.s3Client.send(command);
      
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
  async generatePresignedPartUrl(
    key: string,
    uploadId: string,
    partNumber: number
  ): Promise<{ uploadUrl: string; expiresAt: Date }> {
    try {
      const command = new UploadPartCommand({
        Bucket: this.bucketName,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      });

      // Use presignClient for generating pre-signed URLs with correct signature
      const presignedUrl = await getSignedUrl(this.presignClient, command, {
        expiresIn: this.uploadExpiration,
      });

      return {
        uploadUrl: presignedUrl,
        expiresAt: new Date(Date.now() + this.uploadExpiration * 1000),
      };
    } catch (error) {
      console.error('Error generating pre-signed part URL:', error);
      throw new Error('Failed to generate pre-signed part URL');
    }
  }

  /**
   * Complete a multipart upload
   */
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: Array<{ partNumber: number; etag: string }>
  ): Promise<{ location: string; etag: string }> {
    try {
      const command = new CompleteMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map(part => ({
            ETag: part.etag,
            PartNumber: part.partNumber,
          })),
        },
      });

      const response = await this.s3Client.send(command);
      
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
  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    try {
      const command = new AbortMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: key,
        UploadId: uploadId,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error aborting multipart upload:', error);
      throw new Error('Failed to abort multipart upload');
    }
  }

  /**
   * Calculate the number of parts needed for a file
   */
  static calculateParts(fileSize: number, partSize: number = 5 * 1024 * 1024): number {
    return Math.ceil(fileSize / partSize);
  }

  /**
   * Split file into chunks for multipart upload
   */
  static async splitFileIntoChunks(
    file: File,
    chunkSize: number = 5 * 1024 * 1024
  ): Promise<Blob[]> {
    const chunks: Blob[] = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      chunks.push(chunk);
      start = end;
    }

    return chunks;
  }
}
