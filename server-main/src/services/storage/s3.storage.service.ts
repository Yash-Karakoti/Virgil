/** @format */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import {
  StorageService,
  StorageOptions,
} from "../../interfaces/storage.interface";
import { Readable } from "stream";

/**
 * Generic S3 Storage Service
 * Works with any S3-compatible provider (AWS S3, Backblaze B2, Cloudflare R2, MinIO, etc.)
 */
export class S3StorageService implements StorageService {
  private s3Client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    const endpoint = process.env.S3_ENDPOINT;

    if (!bucket || !region || !accessKeyId || !secretAccessKey || !endpoint) {
      throw new Error(
        "Missing S3 storage config. Please set S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_ENDPOINT",
      );
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint,
      forcePathStyle: true, // Required for most S3-compatible services
      // Newer AWS SDKs send CRC checksums by default, which many
      // S3-compatible providers reject; only send them when required
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });

    this.bucket = bucket;
    // Optional override for a CDN / custom domain, defaults to path-style URL
    this.publicUrl = (
      process.env.S3_PUBLIC_URL || `${endpoint}/${bucket}`
    ).replace(/\/$/, "");
  }

  /**
   * Save a file to S3 storage
   */
  async save(
    file: Buffer | NodeJS.ReadableStream,
    fileName: string,
    options?: StorageOptions,
  ): Promise<string> {
    try {
      const buffer = Buffer.isBuffer(file)
        ? file
        : await this.streamToBuffer(file);

      // Construct the full path with folder if provided
      const filePath = options?.folder
        ? `${options.folder}/${fileName}`
        : fileName;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
        Body: buffer,
        ContentType: options?.contentType || "application/octet-stream",
        ...(options?.metadata && { Metadata: options.metadata }),
      });

      await this.s3Client.send(command);

      return filePath;
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error(
        `Failed to upload file to S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get a file from S3 storage
   */
  async get(path: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error("No file data received");
      }

      return await this.streamToBuffer(response.Body as Readable);
    } catch (error) {
      console.error("S3 download error:", error);
      throw new Error(
        `Failed to download file from S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Delete a file from S3 storage
   */
  async delete(path: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error("S3 delete error:", error);
      return false;
    }
  }

  /**
   * Check if a file exists in S3 storage
   */
  async exists(path: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the public URL for accessing the file
   */
  getUrl(path: string): string {
    return `${this.publicUrl}/${path}`;
  }

  /**
   * Helper method to convert stream to buffer
   */
  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }
}
