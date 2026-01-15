import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendTestDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emailAddresses?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  testReceiverIds?: string[];
}
