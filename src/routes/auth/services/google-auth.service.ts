import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { google } from "googleapis";

import envConfig from "src/shared/config";
import { UserStatus } from "src/shared/constants/auth.constant";
import { SharedRoleRepository } from "src/shared/repositories/shared-role.repo";
import { HashingService } from "src/shared/services/hashing.service";
import { TokenService } from "src/shared/services/token.service";

import {
  AccountUnavailableException,
  GoogleAuthenticationException,
} from "../auth.error";
import { AuthRepository } from "../repositories/auth.repository";
import { SessionService } from "./session.service";

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly rolesRepository: SharedRoleRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  private createOAuthClient() {
    return new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    );
  }

  getAuthorizationUrl(client: { userAgent: string; ip: string }) {
    const state = this.tokenService.signOAuthState(client);
    const url = this.createOAuthClient().generateAuthUrl({
      access_type: "online",
      scope: ["openid", "email", "profile"],
      include_granted_scopes: true,
      state,
    });
    return { url };
  }

  async handleCallback(code: string, state: string) {
    try {
      const client = await this.tokenService.verifyOAuthState(state);
      const oAuth2Client = this.createOAuthClient();
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ auth: oAuth2Client, version: "v2" });
      const { data } = await oauth2.userinfo.get();
      if (!data.email || data.verified_email !== true) {
        throw GoogleAuthenticationException;
      }

      let user = await this.authRepository.findUserWithRole({
        email: data.email,
      });
      if (!user) {
        const roleId = await this.rolesRepository.getClientRoleId();
        const password = await this.hashingService.hash(randomUUID());
        user = await this.authRepository.createUserWithRole({
          email: data.email,
          name: data.name || data.email,
          password,
          roleId,
          phoneNumber: "",
          avatar: data.picture || null,
          status: UserStatus.Active,
        });
      }

      if (
        user.status !== UserStatus.Active ||
        user.role.deletedAt ||
        !user.role.isActive
      ) {
        throw AccountUnavailableException;
      }

      return this.sessionService.issue(user, {
        userAgent: client.userAgent,
        ip: client.ip,
      });
    } catch (error) {
      if (error === AccountUnavailableException) {
        throw error;
      }
      throw GoogleAuthenticationException;
    }
  }
}
