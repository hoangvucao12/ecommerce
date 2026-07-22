import {
  Controller,
  Post,
  Get,
  Body,
  Ip,
  Query,
  Res,
  Req,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  LoginBodyDto,
  LoginResponseDto,
  RegisterBodyDto,
  RegisterResponseDto,
  SendOtpBodyDto,
  RefreshTokenResponseDto,
  GetAuthorizationUrlResponseDto,
  ForgotPasswordBodyDto,
} from "./auth.dto";
import { ZodSerializerDto } from "nestjs-zod";
import { UserAgent } from "src/shared/decorators/user-agent.decorator";
import { MessageResponseDto } from "src/shared/dtos/response.dto";
import { IsPublic } from "src/shared/decorators/auth.decorator";
import type { Response, Request } from "express";
import { GoogleService } from "./google.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post("register")
  @IsPublic()
  @ZodSerializerDto(RegisterResponseDto)
  register(@Body() Body: RegisterBodyDto) {
    return this.authService.register(Body);
  }

  @Post("otp")
  @IsPublic()
  @ZodSerializerDto(MessageResponseDto)
  sendOtp(@Body() Body: SendOtpBodyDto) {
    return this.authService.sendOtp(Body);
  }

  @Post("login")
  @IsPublic()
  @ZodSerializerDto(LoginResponseDto)
  login(
    @Body() Body: LoginBodyDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
    @Res() res: Response,
  ) {
    return this.authService.login(Body, userAgent, ip, res);
  }

  @Post("refresh-token")
  @IsPublic()
  @ZodSerializerDto(RefreshTokenResponseDto)
  refreshToken(
    @Req() req: Request,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
    @Res() res: Response,
  ) {
    return this.authService.refreshToken(
      {
        req,
        userAgent,
        ip,
      },
      res,
    );
  }

  @Post("logout")
  @IsPublic()
  @ZodSerializerDto(MessageResponseDto)
  logout(@Req() req: Request, @Res() res: Response) {
    return this.authService.logout(req, res);
  }

  @Get("google-link")
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResponseDto)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip });
  }

  @Get("google/callback")
  @IsPublic()
  googleCallback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Res() res: Response,
  ) {
    return this.authService.googleCallback(code, state, res);
  }

  @Post("forgot-password")
  @IsPublic()
  @ZodSerializerDto(MessageResponseDto)
  forgotPassword(@Body() Body: ForgotPasswordBodyDto) {
    return this.authService.forgotPassword(Body);
  }
}
