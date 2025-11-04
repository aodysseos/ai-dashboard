import { S3Client, PutObjectCommand, ServerSideEncryption } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Clients } from './s3.client';

export class S3Service {
  private presignClient: S3Client;
  private bucketName: string;
  private uploadExpiration: number;

  constructor() {
    const config = createS3Clients();
    
    this.presignClient = config.presignClient;
    this.bucketName = config.bucketName;
    this.uploadExpiration = config.uploadExpiration;
  }

  /**
   * Generate a pre-signed URL for uploading a file to S3
   */
  async generatePresignedUploadUrl(
    key: string,
    contentType: string = 'application/pdf'
  ): Promise<string> {
    try {
      // Validate content type
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

      const command = new PutObjectCommand(commandOptions);

      // Use presignClient for generating pre-signed URLs with correct signature
      const presignedUrl = await getSignedUrl(this.presignClient, command, {
        expiresIn: this.uploadExpiration,
      });

      return presignedUrl;
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw new Error('Failed to generate pre-signed URL');
    }
  }

  /**
   * Generate multiple pre-signed URLs for batch uploads
   */
  async generatePresignedUploadUrls(
    requests: Array<{ key: string; contentType: string }>
  ): Promise<Array<{ key: string; uploadUrl: string; expiresAt: Date }>> {
    try {
      const results = await Promise.all(
        requests.map(async (request) => {
          const uploadUrl = await this.generatePresignedUploadUrl(
            request.key,
            request.contentType
          );
          return {
            key: request.key,
            uploadUrl,
            expiresAt: new Date(Date.now() + this.uploadExpiration * 1000),
          };
        })
      );

      return results;
    } catch (error) {
      console.error('Error generating pre-signed URLs:', error);
      throw new Error('Failed to generate pre-signed URLs');
    }
  }

  /**
   * Validate file type by checking magic bytes
   */
  static validatePdfFile(buffer: Buffer): boolean {
    // PDF magic bytes: %PDF
    const pdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46]);
    return buffer.subarray(0, 4).equals(pdfSignature);
  }

  /**
   * Generate a unique S3 key for a file
   */
  static generateS3Key(filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `uploads/${timestamp}/${sanitizedFilename}`;
  }
}

