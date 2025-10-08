import { 
  S3Client, 
  CreateMultipartUploadCommand, 
  UploadPartCommand, 
  CompleteMultipartUploadCommand, 
  AbortMultipartUploadCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3MultipartService {
  private s3Client: S3Client;
  private bucketName: string;
  private uploadExpiration: number;

  constructor() {
    this.bucketName = process.env['S3_BUCKET_NAME'] || 'test-bucket';
    this.uploadExpiration = parseInt(process.env['S3_UPLOAD_EXPIRATION'] || '300', 10);

    // Use default values for development if environment variables are not set
    const region = process.env['AWS_REGION'] || 'us-east-1';
    const accessKeyId = process.env['AWS_ACCESS_KEY_ID'] || 'test-access-key';
    const secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY'] || 'test-secret-key';

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
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

      const command = new CreateMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
      });

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

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
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
