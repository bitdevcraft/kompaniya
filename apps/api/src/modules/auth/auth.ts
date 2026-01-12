import { db } from '@repo/database';
import * as schema from '@repo/database/schema';
import {
  adminAccessControl,
  orgAccessControl,
  orgAdmin,
  orgMember,
  orgOwner,
  superAdmin,
  systemAdmin,
  systemUser,
} from '@repo/shared/auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  apiKey,
  emailOTP,
  organization,
  phoneNumber,
  username,
} from 'better-auth/plugins';
import { v4 as uuidv4 } from 'uuid';

export const auth = betterAuth({
  appName: 'Kompaniya',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      account: schema.accountsTable,
      apiKey: schema.apikeysTable,
      invitation: schema.invitationsTable,
      member: schema.membersTable,
      organizationRole: schema.organizationRolesTable,
      organization: schema.organizationsTable,
      session: schema.sessionsTable,
      teamMember: schema.teamMembersTable,
      team: schema.teamsTable,
      user: schema.usersTable,
      verification: schema.verificationsTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  advanced: {
    database: {
      generateId: () => uuidv4(),
    },
    ipAddress: {
      ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for'],
    },
  },
  plugins: [
    // Authentication
    username(),
    phoneNumber({
      sendOTP: ({ phoneNumber, code }, request) => {
        // TODO: Implement sending OTP code via SMS
        console.log(request);
        console.log({ phoneNumber, code });
      },
    }),
    emailOTP({
      // eslint-disable-next-line @typescript-eslint/require-await
      async sendVerificationOTP({ email, otp, type }) {
        console.log({ email, otp, type });
        if (type === 'sign-in') {
          // TODO Send the OTP for sign in
        } else if (type === 'email-verification') {
          // TODO Send the OTP for email verification
        } else {
          // TODO Send the OTP for password reset
        }
      },
    }),

    // Authorization
    apiKey(),
    admin({
      ac: adminAccessControl,
      roles: {
        superAdmin,
        systemUser,
        systemAdmin,
      },
    }),
    organization({
      teams: {
        enabled: true,
        maximumTeams: 5,
        allowRemovingAllTeams: false,
      },
      schema: {
        organization: {
          additionalFields: {
            organizationSize: {
              type: 'string',
              input: true,
              required: false,
            },
            industry: {
              type: 'string',
              input: true,
              required: false,
            },
            isSuper: {
              type: 'boolean',
              input: true,
              required: false,
            },
            numberOfUsers: {
              type: 'number',
              input: true,
              required: false,
            },
            numberOfEmailDomains: {
              type: 'number',
              input: true,
              required: false,
            },
            numberOfRoles: {
              type: 'number',
              input: true,
              required: false,
            },
            numberOfTeams: {
              type: 'number',
              input: true,
              required: false,
            },
          },
        },
      },
      dynamicAccessControl: {
        enabled: true,
      },
      ac: orgAccessControl,
      roles: {
        admin: orgAdmin,
        owner: orgOwner,
        member: orgMember,
      },
    }),
    //
  ],
  trustedOrigins: ['http://localhost:3001'],
  rateLimit: {
    enabled: true,
  },
  user: {
    additionalFields: {
      metadata: {
        type: 'json',
        input: true,
      },
    },
  },
  hooks: {},
});
