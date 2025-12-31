import { randomBytes } from "crypto";
import { Injectable } from "@nestjs/common";
import { TokenGeneratorPort } from "@app/shared-kernel";

@Injectable()
export class RandomTokenGenerator implements TokenGeneratorPort {
  generateToken(length: number): string {
    return randomBytes(length).toString("hex");
  }
}
