import { Injectable } from "@nestjs/common";
import { google } from "googleapis";
import envConfig from "src/shared/config";
import { GoogleAuthStateType } from "./auth.model";

@Injectable()
export class GoogleService {
  private oAuth2Client;

  constructor() {
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
}
