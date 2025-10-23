import { Injectable } from '@nestjs/common';
import { Hook } from '@thallesp/nestjs-better-auth';

@Hook()
@Injectable()
export class SignUpHook {}
