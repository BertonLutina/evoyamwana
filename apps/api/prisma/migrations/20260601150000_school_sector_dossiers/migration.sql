CREATE TYPE "SchoolSector" AS ENUM ('TEACHERS', 'PARENTS', 'STUDENTS', 'SECRETARY', 'ACCOUNTANT', 'CLASS_TUTOR', 'DISCIPLINE', 'LIBRARY', 'NURSE', 'TRANSPORT', 'CANTEEN', 'COLLABORATORS');

CREATE TABLE "SchoolSectorDossier" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "sector" "SchoolSector" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "owner" TEXT,
    "status" "SchoolHealthStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "SchoolHealthSeverity" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSectorDossier_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SchoolSectorDossier_schoolId_sector_idx" ON "SchoolSectorDossier"("schoolId", "sector");
CREATE INDEX "SchoolSectorDossier_schoolId_status_idx" ON "SchoolSectorDossier"("schoolId", "status");
CREATE INDEX "SchoolSectorDossier_schoolId_priority_idx" ON "SchoolSectorDossier"("schoolId", "priority");
CREATE INDEX "SchoolSectorDossier_dueDate_idx" ON "SchoolSectorDossier"("dueDate");

ALTER TABLE "SchoolSectorDossier" ADD CONSTRAINT "SchoolSectorDossier_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
