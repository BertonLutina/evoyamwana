import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { AuthResponse, AuthUser } from '@evoyamwana/shared';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

interface RegisterSchoolInput {
  schoolName: string;
  legalName?: string;
  country: string;
  city: string;
  address?: string;
  schoolType?: string;
  schoolStatus?: string;
  accreditationNumber?: string;
  schoolEmail: string;
  schoolPhone?: string;
  ownerFullName: string;
  ownerEmail: string;
  password: string;
  documentUrl?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const toAuthUser = (user: {
  id: string;
  email: string;
  fullName: string;
  role: AuthUser['role'];
  schoolId: string | null;
  school?: { name: string } | null;
  schoolName?: string | null;
}): AuthUser => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  schoolId: user.schoolId,
  schoolName: user.school?.name ?? user.schoolName ?? null
});

const signToken = (user: AuthUser) => {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      schoolId: user.schoolId,
      schoolName: user.schoolName
    },
    env.JWT_SECRET,
    options
  );
};

export const authService = {
  async registerSchool(input: RegisterSchoolInput) {
    const existingSchool = await prisma.school.findUnique({ where: { email: input.schoolEmail } });
    const existingUser = await prisma.user.findUnique({ where: { email: input.ownerEmail } });
    const existingRequest = await prisma.schoolRegistrationRequest.findFirst({
      where: {
        status: 'PENDING',
        OR: [{ schoolEmail: input.schoolEmail }, { ownerEmail: input.ownerEmail }]
      }
    });

    if (existingSchool || existingUser || existingRequest) {
      throw new AppError('A school, user, or pending request with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const request = await prisma.schoolRegistrationRequest.create({
      data: {
        schoolName: input.schoolName,
        legalName: input.legalName,
        country: input.country,
        city: input.city,
        address: input.address,
        schoolType: input.schoolType,
        schoolStatus: input.schoolStatus,
        accreditationNumber: input.accreditationNumber,
        schoolEmail: input.schoolEmail,
        schoolPhone: input.schoolPhone,
        ownerFullName: input.ownerFullName,
        ownerEmail: input.ownerEmail,
        ownerPasswordHash: passwordHash,
        documentUrl: input.documentUrl
      }
    });

    return {
      request: {
        id: request.id,
        status: request.status,
        schoolName: request.schoolName,
        ownerEmail: request.ownerEmail,
        createdAt: request.createdAt
      },
      message: 'Votre demande a été envoyée. Un super admin doit la valider avant l’activation.'
    };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        school: {
          select: {
            name: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError('Invalid email or password', 401);
    }

    const authUser = toAuthUser(user);
    return { token: signToken(authUser), user: authUser };
  }
};
