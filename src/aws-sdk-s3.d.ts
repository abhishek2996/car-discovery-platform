/**
 * Type declaration for @aws-sdk/client-s3 when dist-types are not present in node_modules.
 */
declare module "@aws-sdk/client-s3" {
  export interface S3ClientConfig {
    region?: string;
    endpoint?: string;
    credentials?: { accessKeyId: string; secretAccessKey: string };
  }
  export class S3Client {
    constructor(config: S3ClientConfig);
    send(command: unknown): Promise<unknown>;
  }
  export class PutObjectCommand {
    constructor(params: { Bucket: string; Key: string; Body?: Buffer | Uint8Array; ContentType?: string });
  }
  export class GetObjectCommand {
    constructor(params: { Bucket: string; Key: string });
  }
  export class DeleteObjectCommand {
    constructor(params: { Bucket: string; Key: string });
  }
}
