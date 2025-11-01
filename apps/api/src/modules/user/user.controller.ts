import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import {
  AllowAnonymous,
  OptionalAuth,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

@Controller('api/users')
export class UserController {
  @Get('optional')
  @OptionalAuth() // Authentication is optional
  getOptional(@Session() session: UserSession) {
    return { authenticated: !!session };
  }

  @Get('me')
  getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Get('public')
  @AllowAnonymous() // Allow anonymous access
  getPublic() {
    return { message: 'Public route' };
  }

  @Get('pagination')
  @AllowAnonymous() // Allow anonymous access
  @UsePipes(new ZodValidationPipe(paginationQueryParserSchema))
  getTest(@Query() queryParams: PaginationQueryParserType) {
    console.log(queryParams);
    return { message: 'test' };
  }
}
