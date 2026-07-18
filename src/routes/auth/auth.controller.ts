import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Ip,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  LoginBodyDto,
  LoginResponseDto,
  RegisterBodyDto,
  RegisterResponseDto,
  SendOtpBodyDto,
  RefreshTokenBodyDto,
  RefreshTokenResponseDto,
  LogoutBodyDto,
  GetAuthorizationUrlResponseDto,
} from "./auth.dto";
import { ZodSerializerDto } from "nestjs-zod";
import { UserAgent } from "src/shared/decorators/user-agent.decorator";
import { MessageResponseDto } from "src/shared/dtos/response.dto";
import { IsPublic } from "src/shared/decorators/auth.decorator";
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
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(LoginResponseDto)
  login(
    @Body() Body: LoginBodyDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.login(Body, userAgent, ip);
  }

  @Post("refresh-token")
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResponseDto)
  refreshToken(
    @Body() Body: RefreshTokenBodyDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.refreshToken({
      refreshToken: Body.refreshToken,
      userAgent,
      ip,
    });
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResponseDto)
  logout(@Body() Body: LogoutBodyDto) {
    return this.authService.logout(Body.refreshToken);
  }

  @Get("google-link")
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResponseDto)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip });
  }
}
