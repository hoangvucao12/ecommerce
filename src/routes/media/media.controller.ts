import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Get,
  Param,
  Res,
  Body,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { UPLOAD_DIR } from "src/shared/constants/other.constant";
import * as path from "path";
import { IsPublic } from "src/shared/decorators/auth.decorator";
import { MediaService } from "./media.service";
import { S3Service } from "src/shared/services/S3.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  PresignedUploadFileBodyDto,
  PresignedUploadFileResponseDto,
  UploadFileResponseDto,
} from "./media.dto";

const ALLOWED_EXT = /\.(jpe?g|png|webp)$/i;

@Controller("media")
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly s3Service: S3Service,
  ) {}

  @Post("images/upload")
  @ZodSerializerDto(UploadFileResponseDto)
  @UseInterceptors(
    FilesInterceptor("files", 100, {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(ALLOWED_EXT)) {
          return cb(new BadRequestException("Invalid file type"), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    return this.mediaService.uploadFile(files);
  }

  @Get("static/:filename")
  @IsPublic()
  serveFile(@Param("filename") filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error) => {
      if (error) {
        res.status(404).json({
          message: "File not found",
          error: "Not Found",
          statusCode: 404,
        });
      }
    });
  }

  @Post("images/upload/presigned-url")
  @ZodSerializerDto(PresignedUploadFileResponseDto)
  @IsPublic()
  createPresignedUrl(@Body() body: PresignedUploadFileBodyDto) {
    return this.mediaService.getPresignedUrl(body);
  }
}
