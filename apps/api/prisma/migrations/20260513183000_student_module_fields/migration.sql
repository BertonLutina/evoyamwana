-- Align Student fields with the Students module API contract.
ALTER TABLE "Student" RENAME COLUMN "admissionNumber" TO "studentCode";
ALTER TABLE "Student" RENAME COLUMN "dateOfBirth" TO "birthDate";

ALTER TABLE "Student" ADD COLUMN "photoUrl" TEXT;
ALTER TABLE "Student" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

DROP INDEX IF EXISTS "Student_schoolId_admissionNumber_key";
CREATE UNIQUE INDEX "Student_schoolId_studentCode_key" ON "Student"("schoolId", "studentCode");
CREATE INDEX "Student_schoolId_isActive_idx" ON "Student"("schoolId", "isActive");
