import { Controller, Get, Put, Body } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  GetUserProfileResponseDto,
  UpdateProfileResponseDto,
} from "src/shared/dtos/shared-user.dto";
import { ActiveUser } from "src/shared/decorators/active-user.decorator";
import { ChangePasswordBodyDto, UpdateMeBodyDto } from "./profile.dto";
import { MessageResponseDto } from "src/shared/dtos/response.dto";

@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetUserProfileResponseDto)
  getProfile(@ActiveUser("userId") userId: number) {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @ZodSerializerDto(UpdateProfileResponseDto)
  updateProfile(
    @ActiveUser("userId") userId: number,
    @Body() body: UpdateMeBodyDto,
  ) {
    return this.profileService.updateProfile(userId, body);
  }

  @Put("/change-password")
  @ZodSerializerDto(MessageResponseDto)
  changePassword(
    @ActiveUser("userId") userId: number,
    @Body() body: ChangePasswordBodyDto,
  ) {
    return this.profileService.changePassword({ userId, body });
  }
}
