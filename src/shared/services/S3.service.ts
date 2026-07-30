import { Injectable } from "@nestjs/common";
import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import envConfig from "src/shared/config";
import { Upload } from "@aws-sdk/lib-storage";
import { readFileSync } from "fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as mime from "mime-types";

@Injectable()
export class S3Service {
  private s3: S3;
  constructor() {
    this.s3 = new S3({
      region: envConfig.S3_REGION,
      credentials: {
        accessKeyId: envConfig.S3_ACCESS_KEY,
        secretAccessKey: envConfig.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  uploadFile({
    filename,
    filepath,
    contentType,
  }: {
    filename: string;
    filepath: string;
    contentType: string;
  }) {
    const paralleUploads3 = new Upload({
      client: this.s3,
      params: {
        Bucket: envConfig.S3_BUCKET_NAME,
        Key: filename,
        Body: readFileSync(filepath),
        ContentType: contentType,
      },
      tags: [],
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });

    return paralleUploads3.done();
  }

  createPresignedUrl(filename: string) {
    const command = new PutObjectCommand({
      Bucket: envConfig.S3_BUCKET_NAME,
      Key: "images/" + filename,
      ContentType: mime.lookup(filename) || "application/octet-stream",
    });

    return getSignedUrl(this.s3, command, { expiresIn: 300 });
  }
}
