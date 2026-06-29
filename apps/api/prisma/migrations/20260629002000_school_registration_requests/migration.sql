CREATE TYPE "SchoolRegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "SchoolRegistrationRequest" (
  "id" UUID NOT NULL,
  "schoolName" TEXT NOT NULL,
  "legalName" TEXT,
  "country" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "address" TEXT,
  "schoolType" TEXT,
  "schoolStatus" TEXT,
  "accreditationNumber" TEXT,
  "schoolEmail" TEXT NOT NULL,
  "schoolPhone" TEXT,
  "ownerFullName" TEXT NOT NULL,
  "ownerEmail" TEXT NOT NULL,
  "ownerPasswordHash" TEXT NOT NULL,
  "documentUrl" TEXT,
  "status" "SchoolRegistrationStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedByUserId" UUID,
  "reviewedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "approvedSchoolId" UUID,
  "approvedAdminUserId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SchoolRegistrationRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SchoolRegistrationRequest_status_idx" ON "SchoolRegistrationRequest"("status");
CREATE INDEX "SchoolRegistrationRequest_schoolEmail_idx" ON "SchoolRegistrationRequest"("schoolEmail");
CREATE INDEX "SchoolRegistrationRequest_ownerEmail_idx" ON "SchoolRegistrationRequest"("ownerEmail");
