import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Get,
  Param,
  Res,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import envConfig from "src/shared/config";
import type { Response } from "express";
import { UPLOAD_DIR } from "src/shared/constants/other.constant";
import * as path from "path";
import { IsPublic } from "src/shared/decorators/auth.decorator";

const ALLOWED_EXT = /\.(jpe?g|png|webp)$/i;

@Controller("media")
export class MediaController {
  @Post("images/upload")
  @UseInterceptors(
    FilesInterceptor("files", 100, {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(ALLOWED_EXT)) {
          return cb(new BadRequestException("Invalid file type"), false);
        }
        cb(null, true);
      }, // 5MB
    }),
  )
  upload(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    return files.map((file) => ({
      url: `${envConfig.PREFIX_STATIC_ENDPOINT}/${file.filename}`,
    }));
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
}
