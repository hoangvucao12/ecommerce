import { ExecutionContext, Injectable } from "@nestjs/common";
import { I18nResolver } from "nestjs-i18n";

@Injectable()
export class AllLanguageResolver implements I18nResolver {
  resolve(context: ExecutionContext): string | undefined {
    if (context.getType() !== "http") {
      return undefined;
    }

    const request = context.switchToHttp().getRequest();
    const acceptLanguage = request.raw
      ? request.raw.headers?.["accept-language"]
      : request?.headers?.["accept-language"];

    if (typeof acceptLanguage !== "string") {
      return undefined;
    }

    return acceptLanguage.trim().toLowerCase() === "all" ? "all" : undefined;
  }
}
