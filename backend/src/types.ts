import { Prisma } from '@prisma/client'

/** Prisma "include" shape so roles + permissions are always loaded with a user */
export const userWithRole = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    role: {
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    },
  },
})

/** TypeScript type for a user with its role and permissions */
export type UserWithRole = Prisma.UserGetPayload<typeof userWithRole>
