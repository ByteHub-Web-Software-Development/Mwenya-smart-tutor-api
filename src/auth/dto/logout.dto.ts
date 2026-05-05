import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: 'john_doe', description: 'Username of the user logging out' })
  @IsString()
  @IsNotEmpty()
  user_name!: string;
}

export class DeviceLogoutDto {
  @ApiProperty({ example: 'john_doe', description: 'Username to log out on current device' })
  @IsString()
  @IsNotEmpty()
  user_name!: string;

  @ApiProperty({ example: 'device-uuid-abc123', description: 'Device ID to log out from' })
  @IsString()
  @IsNotEmpty()
  device_id!: string;
}
