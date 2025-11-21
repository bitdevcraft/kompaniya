import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class CreateLeadDto {
  categories!: string[] | null;

  @Type(() => Date)
  @IsDate()
  createdAt!: Date;

  @Type(() => Date)
  @IsDate()
  deletedAt!: Date | null;

  email!: string | null;

  emailNormalized!: string | null;

  firstName!: string | null;

  id!: string;

  lastActivityAt!: Date | null;

  lastName!: string;

  name!: string | null;

  nationality!: string | null;

  nextActivityAt!: Date | null;

  notes!: string | null;

  organizationId!: string | null;

  phone!: string | null;

  phoneE164!: string | null;

  salutation!: string | null;

  score!: string | null;

  tags!: string[] | null;

  @Type(() => Date)
  @IsDate()
  updatedAt!: Date;
}
