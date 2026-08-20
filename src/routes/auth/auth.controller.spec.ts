import { Test, TestingModule } from "@nestjs/testing";

import { AuthController } from "./auth.controller";
import { AuthService } from "./services/auth.service";
import { GoogleAuthService } from "./services/google-auth.service";

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: GoogleAuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  it("is defined", () => {
    expect(controller).toBeDefined();
  });
});
