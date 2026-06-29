CREATE TYPE "SchoolHealthCategory" AS ENUM ('ATTENDANCE', 'PEDAGOGY', 'FINANCE', 'INFRASTRUCTURE', 'SAFETY', 'HEALTH', 'REPUTATION', 'COMPLIANCE');

CREATE TYPE "SchoolHealthStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED');

CREATE TYPE "SchoolHealthSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE "SchoolHealthRecord" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "SchoolHealthCategory" NOT NULL,
    "status" "SchoolHealthStatus" NOT NULL DEFAULT 'OPEN',
    "severity" "SchoolHealthSeverity" NOT NULL DEFAULT 'MEDIUM',
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolHealthRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SchoolHealthRecord_schoolId_category_idx" ON "SchoolHealthRecord"("schoolId", "category");
CREATE INDEX "SchoolHealthRecord_schoolId_status_idx" ON "SchoolHealthRecord"("schoolId", "status");
CREATE INDEX "SchoolHealthRecord_schoolId_severity_idx" ON "SchoolHealthRecord"("schoolId", "severity");
CREATE INDEX "SchoolHealthRecord_dueDate_idx" ON "SchoolHealthRecord"("dueDate");

ALTER TABLE "SchoolHealthRecord" ADD CONSTRAINT "SchoolHealthRecord_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
