import { Injectable } from "@nestjs/common";
import { google } from "googleapis";
import envConfig from "src/shared/config";
import { GoogleAuthStateType } from "./auth.model";
import { AuthRepository } from "./auth.repo";
import { HashingService } from "src/shared/services/hashing.service";
import { v4 as uuidv4 } from "uuid";
import { GoogleUserInfoError } from "./auth.error";
import { TokenService } from "src/shared/services/token.service";
import { SharedRoleRepository } from "src/shared/repositories/shared-role.repo";

@Injectable()
export class GoogleService {
  private oAuth2Client;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly rolesService: SharedRoleRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
  ) {
    this.oAuth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    );
  }

  getAuthorizationUrl({ userAgent, ip }: GoogleAuthStateType) {
    const scope = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const stateString = Buffer.from(
      JSON.stringify({
        userAgent,
        ip,
      }),
    ).toString("base64");

    const url = this.oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope,
      include_granted_scopes: true,
      state: stateString,
    });

    return { url };
  }

  async handleGoogleCallback(code: string, state: string) {
    try {
      let userAgent = "unknown";
      let ip = "unknown";
      try {
        if (state) {
          const clientInfo = JSON.parse(
            Buffer.from(state, "base64").toString(),
          ) as GoogleAuthStateType;
          userAgent = clientInfo.userAgent;
          ip = clientInfo.ip;
        }
      } catch (error) {
        console.error("Error parsing state parameter:", error);
      }

      const { tokens } = await this.oAuth2Client.getToken(code);
      this.oAuth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: this.oAuth2Client,
        version: "v2",
      });

      const { data } = await oauth2.userinfo.get();

      if (!data.email) {
        throw GoogleUserInfoError;
      }

      let user = await this.authRepository.findUniqueUserIncludeRole({
        email: data.email,
      });

      if (!user) {
        const clientRoleId = await this.rolesService.getClientRoleId();
        const randomPassword = uuidv4();
        const hashedPassword = await this.hashingService.hash(randomPassword);

        user = await this.authRepository.createUserIncludeRole({
          email: data.email,
          name: data.name || "",
          password: hashedPassword,
          roleId: clientRoleId,
          phoneNumber: "",
          avatar: data.picture || null,
        });
      }

      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent,
        ip,
      });

      const payload = {
        userId: user.id,
        deviceId: device.id,
        roleName: user.role.name,
        roleId: user.roleId,
      };

      const accessToken: string = this.tokenService.signAccessToken(payload);
      const refreshToken: string = this.tokenService.signRefreshToken({
        userId: payload.userId,
      });

      const decodedRefreshToken =
        await this.tokenService.verifyRefreshToken(refreshToken);
      await this.authRepository.createRefreshToken({
        token: refreshToken,
        userId: payload.userId,
        expiresAt: new Date(decodedRefreshToken.exp * 1000),
        deviceId: payload.deviceId,
      });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error handling Google callback:", error);
      throw new Error("Failed to handle Google callback");
    }
  }
}
