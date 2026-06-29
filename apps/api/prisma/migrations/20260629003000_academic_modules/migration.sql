ALTER TYPE "StudentCategory" ADD VALUE IF NOT EXISTS 'creche';
ALTER TYPE "StudentCategory" ADD VALUE IF NOT EXISTS 'secondaire_general';
ALTER TYPE "StudentCategory" ADD VALUE IF NOT EXISTS 'secondaire_technique';
ALTER TYPE "StudentCategory" ADD VALUE IF NOT EXISTS 'formation';
ALTER TYPE "StudentCategory" ADD VALUE IF NOT EXISTS 'haute_ecole';
ALTER TYPE "StudentCategory" ADD VALUE IF NOT EXISTS 'mixte';

CREATE TYPE "FeeBillingCycle" AS ENUM ('trimester', 'annual', 'monthly', 'one_time');

ALTER TABLE "Subject" ADD COLUMN "coefficient" DECIMAL(4,2) NOT NULL DEFAULT 1.00;
ALTER TABLE "Assignment" ADD COLUMN "attachmentUrl" TEXT;
ALTER TABLE "Payment" ADD COLUMN "feeId" UUID;
ALTER TABLE "Payment" ADD COLUMN "termId" UUID;

CREATE TABLE "school_terms" (
  "id" UUID NOT NULL,
  "schoolId" UUID NOT NULL,
  "schoolYearId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "order" INTEGER NOT NULL DEFAULT 1,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "school_terms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssignmentSubmission" (
  "id" UUID NOT NULL,
  "assignmentId" UUID NOT NULL,
  "studentId" UUID NOT NULL,
  "content" TEXT,
  "fileUrl" TEXT,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "timetable_entries" (
  "id" UUID NOT NULL,
  "schoolId" UUID NOT NULL,
  "classId" UUID NOT NULL,
  "subjectId" UUID NOT NULL,
  "teacherId" UUID,
  "dayOfWeek" INTEGER NOT NULL,
  "startsAt" TEXT NOT NULL,
  "endsAt" TEXT NOT NULL,
  "room" TEXT,
  "term" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "timetable_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "fees" (
  "id" UUID NOT NULL,
  "schoolId" UUID NOT NULL,
  "classId" UUID,
  "category" "StudentCategory",
  "name" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "billingCycle" "FeeBillingCycle" NOT NULL DEFAULT 'trimester',
  "term" TEXT,
  "dueDate" TIMESTAMP(3),
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "fees_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "school_terms_schoolYearId_name_key" ON "school_terms"("schoolYearId", "name");
CREATE INDEX "school_terms_schoolId_idx" ON "school_terms"("schoolId");
CREATE INDEX "school_terms_schoolYearId_idx" ON "school_terms"("schoolYearId");
CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_studentId_key" ON "AssignmentSubmission"("assignmentId", "studentId");
CREATE INDEX "AssignmentSubmission_studentId_idx" ON "AssignmentSubmission"("studentId");
CREATE INDEX "timetable_entries_schoolId_dayOfWeek_idx" ON "timetable_entries"("schoolId", "dayOfWeek");
CREATE INDEX "timetable_entries_classId_idx" ON "timetable_entries"("classId");
CREATE INDEX "timetable_entries_teacherId_idx" ON "timetable_entries"("teacherId");
CREATE INDEX "fees_schoolId_idx" ON "fees"("schoolId");
CREATE INDEX "fees_classId_idx" ON "fees"("classId");

ALTER TABLE "school_terms" ADD CONSTRAINT "school_terms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "school_terms" ADD CONSTRAINT "school_terms_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "fees" ADD CONSTRAINT "fees_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fees" ADD CONSTRAINT "fees_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "fees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_termId_fkey" FOREIGN KEY ("termId") REFERENCES "school_terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
