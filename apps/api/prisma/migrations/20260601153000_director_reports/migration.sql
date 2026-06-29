-- CreateEnum
CREATE TYPE "DirectorReportType" AS ENUM ('ACADEMIC', 'ATTENDANCE', 'FINANCE', 'DISCIPLINE', 'HEALTH', 'INFRASTRUCTURE', 'REPUTATION', 'PARTNERSHIP', 'COMPLIANCE', 'MEETING');

-- CreateTable
CREATE TABLE "SchoolDirectorReport" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "type" "DirectorReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "owner" TEXT,
    "status" "SchoolHealthStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "SchoolHealthSeverity" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolDirectorReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolDirectorReport_schoolId_type_idx" ON "SchoolDirectorReport"("schoolId", "type");

-- CreateIndex
CREATE INDEX "SchoolDirectorReport_schoolId_status_idx" ON "SchoolDirectorReport"("schoolId", "status");

-- CreateIndex
CREATE INDEX "SchoolDirectorReport_schoolId_priority_idx" ON "SchoolDirectorReport"("schoolId", "priority");

-- CreateIndex
CREATE INDEX "SchoolDirectorReport_dueDate_idx" ON "SchoolDirectorReport"("dueDate");

-- AddForeignKey
ALTER TABLE "SchoolDirectorReport" ADD CONSTRAINT "SchoolDirectorReport_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
