import { mapAuditToResponse } from "@app/common";
import { User } from "../domain/user.entity";
import { UserResponse, UserResponseDto, UserSignedInResponse } from "./dto/user.response.dto";
import { AuthTokens } from "./types";


export class UserParser {
  static createUserResponse(
    user: User,
    tokens?: AuthTokens,
  ): UserResponseDto {
    const copy = user.getProps();

    const baseResponse: UserResponse = {
      id: copy.id,
      firstName: copy.firstName,
      lastName: copy.lastName,
      phoneNumber: copy.phoneNumber,
      status: copy.status!,
      ...mapAuditToResponse(copy.audit),
    };

    if (tokens) {
      return { ...baseResponse, tokens } as UserSignedInResponse;
    }

    return baseResponse;
  }

  static usersResponse(
  users: readonly User[],
): UserResponseDto[] {
  return users.map((user) => this.createUserResponse(user));
}
}
