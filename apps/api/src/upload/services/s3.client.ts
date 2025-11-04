import { S3Client } from '@aws-sdk/client-s3';

/**
 * Configuration returned by S3 client factory
 */
export interface S3ClientConfig {
  /** Client for direct S3 operations (initiate, complete, abort multipart uploads) */
  s3Client: S3Client;
  /** Client for generating pre-signed URLs with correct signatures */
  presignClient: S3Client;
  /** S3 bucket name */
  bucketName: string;
  /** Pre-signed URL expiration time in seconds */
  uploadExpiration: number;
}

/**
 * Create S3 clients configured for development (Minio) or production (AWS S3)
 * 
 * In development:
 * - Uses two separate clients to handle Docker networking correctly
 * - s3Client: Uses internal Docker endpoint (minio:9000) for API operations
 * - presignClient: Uses public endpoint (localhost:9000) for pre-signed URLs
 * - This ensures signatures match when the browser accesses Minio
 * 
 * In production:
 * - Uses a single AWS S3 client for both operations
 * - Credentials from environment variables
 * 
 * @returns S3 client configuration with both clients and settings
 */
export function createS3Clients(): S3ClientConfig {
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  
  // Use hardcoded bucket name for development, environment variable for production
  const bucketName = isDevelopment 
    ? 'ai-dashboard-dev'
    : (process.env['S3_BUCKET_NAME'] || 'test-bucket');
  
  const uploadExpiration = parseInt(process.env['S3_UPLOAD_EXPIRATION'] || '300', 10);

  if (isDevelopment) {
    // Development: Use Minio with two different clients
    const credentials = {
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin',
    };
    
    // Client for direct S3 operations (uses internal Docker network)
    const s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: 'http://minio:9000',
      forcePathStyle: true, // Required for Minio
      credentials,
    });
    
    // Client for generating pre-signed URLs (uses public endpoint for correct signatures)
    // The signature includes the host header, so it must match what the browser sends
    const publicEndpoint = process.env['S3_PUBLIC_ENDPOINT'] || 'http://localhost:9000';
    const presignClient = new S3Client({
      region: 'us-east-1',
      endpoint: publicEndpoint,
      forcePathStyle: true,
      credentials,
    });

    return {
      s3Client,
      presignClient,
      bucketName,
      uploadExpiration,
    };
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
    
    // In production, use the same client for both operations
    return {
      s3Client: client,
      presignClient: client,
      bucketName,
      uploadExpiration,
    };
  }
}

