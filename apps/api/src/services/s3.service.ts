import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
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

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
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
