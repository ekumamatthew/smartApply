import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

type ObjectStorageConfig = {
  bucket: string;
  region: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  accessKeyId?: string;
  secretAccessKey?: string;
};

function getEnvValue(key: string): string | undefined {
  const value = process.env[key]?.trim();
  if (!value) return undefined;
  return value.replace(/^['"]|['"]$/g, '');
}

function getRequiredConfig(): ObjectStorageConfig {
  const bucket = getEnvValue('OBJECT_STORAGE_BUCKET');
  const region = getEnvValue('OBJECT_STORAGE_REGION');

  if (!bucket || !region) {
    throw new Error(
      'Missing OBJECT_STORAGE_BUCKET or OBJECT_STORAGE_REGION in backend/api/.env',
    );
  }

  return {
    bucket,
    region,
    endpoint: getEnvValue('OBJECT_STORAGE_ENDPOINT'),
    forcePathStyle: getEnvValue('OBJECT_STORAGE_FORCE_PATH_STYLE') === 'true',
    accessKeyId: getEnvValue('OBJECT_STORAGE_ACCESS_KEY_ID'),
    secretAccessKey: getEnvValue('OBJECT_STORAGE_SECRET_ACCESS_KEY'),
  };
}

function createS3Client(config: ObjectStorageConfig) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials:
      config.accessKeyId && config.secretAccessKey
        ? {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          }
        : undefined,
  });
}

export class ObjectStorageService {
  private config?: ObjectStorageConfig;
  private client?: S3Client;

  async putBuffer(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    const { client, config } = this.getRuntime();
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return key;
  }

  async getBuffer(key: string): Promise<Buffer> {
    const { client, config } = this.getRuntime();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }),
    );

    const asByteArray = await response.Body?.transformToByteArray();
    if (!asByteArray) {
      throw new Error(`Could not read object from storage for key: ${key}`);
    }

    return Buffer.from(asByteArray);
  }

  async deleteObject(key: string): Promise<void> {
    const { client, config } = this.getRuntime();
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }),
    );
  }

  private getRuntime() {
    if (!this.config || !this.client) {
      this.config = getRequiredConfig();
      this.client = createS3Client(this.config);
    }

    return { config: this.config, client: this.client };
  }
}

export const objectStorage = new ObjectStorageService();
