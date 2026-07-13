import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  RegisterBodyDto,
  RegisterResponseDto,
  SendOtpBodyDto,
} from "./auth.dto";
import { ZodSerializerDto } from "nestjs-zod";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ZodSerializerDto(RegisterResponseDto)
  async register(@Body() Body: RegisterBodyDto) {
    return await this.authService.register(Body);
  }

  @Post("otp")
  async sendOtp(@Body() Body: SendOtpBodyDto) {
    return await this.authService.sendOtp(Body);
  }

  // @Post("login")
  // @HttpCode(HttpStatus.OK)
  // login(@Body() Body: any) {
  //   return this.authService.login(Body);
  // }

  // @Post("refresh-token")
  // @HttpCode(HttpStatus.OK)
  // refreshToken(@Body() Body: any) {
  //   return this.authService.refreshToken(Body);
  // }

  // @Post("logout")
  // @HttpCode(HttpStatus.OK)
  // logout(@Body() Body: any) {
  //   return this.authService.logout(Body.refreshToken);
  // }
}
