export class UserResponseDto {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PrivateUserResponseDto extends UserResponseDto {
  passwordHash: string;
}
