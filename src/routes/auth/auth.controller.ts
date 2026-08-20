import {
  Body,
  Controller,
  Get,
  Ip,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ZodSerializerDto } from "nestjs-zod";

import { ActiveUser } from "src/shared/decorators/active-user.decorator";
import { IsPublic } from "src/shared/decorators/auth.decorator";
import { UserAgent } from "src/shared/decorators/user-agent.decorator";
import { MessageResponseDto } from "src/shared/dtos/response.dto";

import {
  Disable2FABodyDto,
  ForgotPasswordBodyDto,
  GetAuthorizationUrlResponseDto,
  GoogleCallbackQueryDto,
  LoginBodyDto,
  RegisterBodyDto,
  RegisterResponseDto,
  SendOtpBodyDto,
  Setup2FAResponseDto,
  TokenResponseDto,
} from "./dto/auth.dto";
import { AuthService } from "./services/auth.service";
import { GoogleAuthService } from "./services/google-auth.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Post("register")
  @IsPublic()
  @ZodSerializerDto(RegisterResponseDto)
  register(@Body() body: RegisterBodyDto) {
    return this.authService.register(body);
  }

  @Post("otp")
  @IsPublic()
  @ZodSerializerDto(MessageResponseDto)
  sendOtp(@Body() body: SendOtpBodyDto) {
    return this.authService.sendOtp(body);
  }

  @Post("login")
  @IsPublic()
  @ZodSerializerDto(TokenResponseDto)
  login(
    @Body() body: LoginBodyDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(body, { userAgent, ip }, response);
  }

  @Post("refresh-token")
  @IsPublic()
  @ZodSerializerDto(TokenResponseDto)
  refreshToken(
    @Req() request: Request,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refreshToken(request, { userAgent, ip }, response);
  }

  @Post("logout")
  @IsPublic()
  @ZodSerializerDto(MessageResponseDto)
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(request, response);
  }

  @Get("google-link")
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResponseDto)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleAuthService.getAuthorizationUrl({ userAgent, ip });
  }

  @Get("google/callback")
  @IsPublic()
  googleCallback(
    @Query() query: GoogleCallbackQueryDto,
    @Res() response: Response,
  ) {
    return this.authService.googleCallback(query.code, query.state, response);
  }

  @Post("forgot-password")
  @IsPublic()
  @ZodSerializerDto(MessageResponseDto)
  forgotPassword(@Body() body: ForgotPasswordBodyDto) {
    return this.authService.forgotPassword(body);
  }

  @Post("2fa/setup")
  @ZodSerializerDto(Setup2FAResponseDto)
  setup2FA(@ActiveUser("userId") userId: number) {
    return this.authService.setup2FA(userId);
  }

  @Post("2fa/disable")
  @ZodSerializerDto(MessageResponseDto)
  disable2FA(
    @Body() body: Disable2FABodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.authService.disable2FA(body, userId);
  }
}
