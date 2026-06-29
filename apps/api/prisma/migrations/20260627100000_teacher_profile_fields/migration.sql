-- CreateEnum
CREATE TYPE "TeacherEmploymentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Teacher"
  ADD COLUMN "birthDate" TIMESTAMP(3),
  ADD COLUMN "birthPlace" TEXT,
  ADD COLUMN "gender" TEXT,
  ADD COLUMN "nationality" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "photoUrl" TEXT,
  ADD COLUMN "hireDate" TIMESTAMP(3),
  ADD COLUMN "qualification" TEXT,
  ADD COLUMN "specialization" TEXT,
  ADD COLUMN "nationalId" TEXT,
  ADD COLUMN "emergencyContactName" TEXT,
  ADD COLUMN "emergencyContactPhone" TEXT,
  ADD COLUMN "bio" TEXT,
  ADD COLUMN "employmentStatus" "TeacherEmploymentStatus" NOT NULL DEFAULT 'ACTIVE';
