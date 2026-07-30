import { Injectable } from "@nestjs/common";
import { S3Service } from "src/shared/services/S3.service";
import { unlink } from "fs/promises";
import { generateRandomFileName } from "src/shared/helpers";
import { PresignedUploadFileBodyDto } from "./media.dto";

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadFile(files: Array<Express.Multer.File>) {
    const result = await Promise.all(
      files.map((file) => {
        return this.s3Service
          .uploadFile({
            filename: "images/" + file.filename,
            filepath: file.path,
            contentType: file.mimetype,
          })
          .then((res) => {
            return { url: res.Location };
          });
      }),
    );

    await Promise.all(
      files.map((file) => {
        return unlink(file.path);
      }),
    );

    return {
      data: result,
    };
  }

  async getPresignedUrl(body: PresignedUploadFileBodyDto) {
    const randomFileName = generateRandomFileName(body.filename);
    const presignedUrl =
      await this.s3Service.createPresignedUrl(randomFileName);
    const url = presignedUrl.split("?")[0];
    return { presignedUrl, url };
  }
}
