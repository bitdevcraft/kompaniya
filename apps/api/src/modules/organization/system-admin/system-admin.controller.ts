import type { Request as ExpressRequest } from 'express';

import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
} from '@nestjs/common';
import {
  AuthService,
  Roles,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from 'src/modules/auth/auth';

import { CreateUserDto, RoleOrRoles } from './dto/create-user.dto';
import { SystemAdminService } from './system-admin.service';

@Roles(['admin'])
@Controller('api/organization/system-admin')
export class SystemAdminController {
  constructor(
    private authService: AuthService<typeof auth>,
    private systemAdminService: SystemAdminService,
  ) {}

  @Post('create-user')
  async createUser(
    @Request() req: ExpressRequest,
    @Body() dto: CreateUserDto,
    @Session() session: UserSession,
  ) {
    const headers = fromNodeHeaders(req.headers);

    const organization = await this.systemAdminService.getActiveOrganization(
      session.user.id,
    );

    if (!organization) {
      throw new BadRequestException('Admin Session has no Organization');
    }

    const hasAdmin = (v: RoleOrRoles): boolean =>
      Array.isArray(v) ? v.includes('admin') : v === 'admin';

    const newUser = await this.authService.api.createUser({
      body: {
        email: dto.email,
        password: dto.password,
        name: dto.name,
        role: hasAdmin(dto.role) ? 'admin' : 'user',
      },
      headers,
    });

    console.log('Before Add Member');

    await this.authService.api.addMember({
      body: {
        userId: newUser.user.id,
        role: dto.role ?? 'member',
        organizationId: organization?.id,
      },
      headers,
    });
    console.log('After Add Member');

    return { userId: newUser.user.id };
  }
}
