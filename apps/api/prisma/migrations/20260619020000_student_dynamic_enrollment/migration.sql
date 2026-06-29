-- Dynamic student enrollment by category.
CREATE TYPE "StudentCategory" AS ENUM ('maternelle', 'primaire', 'secondaire', 'universite');
CREATE TYPE "StudentEnrollmentStatus" AS ENUM ('active', 'inactive', 'transferred', 'graduated');
CREATE TYPE "GuardianRelationshipType" AS ENUM ('father', 'mother', 'guardian', 'tutor', 'other');
CREATE TYPE "UniversityRegistrationType" AS ENUM ('new', 'transfer', 're_registration');

CREATE TABLE "school_years" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_years_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Student"
    ADD COLUMN "birthPlace" TEXT,
    ADD COLUMN "nationality" TEXT,
    ADD COLUMN "category" "StudentCategory" NOT NULL DEFAULT 'primaire',
    ADD COLUMN "school_year_id" UUID,
    ADD COLUMN "status" "StudentEnrollmentStatus" NOT NULL DEFAULT 'active';

CREATE TABLE "student_guardians" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "relationship_type" "GuardianRelationshipType" NOT NULL,
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "can_pick_up_child" BOOLEAN NOT NULL DEFAULT false,
    "emergency_contact" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_guardians_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_medical_infos" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "blood_type" TEXT,
    "allergies" TEXT,
    "chronic_diseases" TEXT,
    "medication" TEXT,
    "doctor_name" TEXT,
    "doctor_phone" TEXT,
    "emergency_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_medical_infos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_maternelle_infos" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "toilet_trained" BOOLEAN NOT NULL DEFAULT false,
    "nap_needed" BOOLEAN NOT NULL DEFAULT false,
    "food_restrictions" TEXT,
    "authorized_pickup_persons" JSONB,
    "adaptation_notes" TEXT,
    "favorite_language" TEXT,
    "separation_difficulty" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "student_maternelle_infos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_primary_infos" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "previous_school" TEXT,
    "reading_level" TEXT,
    "writing_level" TEXT,
    "math_level" TEXT,
    "special_needs" TEXT,
    "extracurricular_notes" TEXT,

    CONSTRAINT "student_primary_infos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_secondary_infos" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "previous_school" TEXT,
    "section" TEXT NOT NULL,
    "option_name" TEXT NOT NULL,
    "orientation_notes" TEXT,
    "disciplinary_notes" TEXT,
    "academic_level" TEXT,
    "repeated_class" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "student_secondary_infos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_university_infos" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "previous_institution" TEXT,
    "diploma_obtained" TEXT,
    "program" TEXT NOT NULL,
    "faculty" TEXT,
    "department" TEXT,
    "academic_year" TEXT,
    "registration_type" "UniversityRegistrationType",
    "scholarship_status" TEXT,
    "student_email" TEXT,
    "national_id_number" TEXT,

    CONSTRAINT "student_university_infos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_enrollment_logs" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "category" "StudentCategory" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_enrollment_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "school_years_schoolId_name_key" ON "school_years"("schoolId", "name");
CREATE INDEX "school_years_schoolId_idx" ON "school_years"("schoolId");
CREATE INDEX "school_years_schoolId_isActive_idx" ON "school_years"("schoolId", "isActive");

CREATE INDEX "Student_school_year_id_idx" ON "Student"("school_year_id");
CREATE INDEX "Student_schoolId_category_idx" ON "Student"("schoolId", "category");
CREATE INDEX "Student_schoolId_status_idx" ON "Student"("schoolId", "status");

CREATE UNIQUE INDEX "student_guardians_student_id_guardian_id_key" ON "student_guardians"("student_id", "guardian_id");
CREATE INDEX "student_guardians_guardian_id_idx" ON "student_guardians"("guardian_id");

CREATE UNIQUE INDEX "student_medical_infos_student_id_key" ON "student_medical_infos"("student_id");
CREATE UNIQUE INDEX "student_maternelle_infos_student_id_key" ON "student_maternelle_infos"("student_id");
CREATE UNIQUE INDEX "student_primary_infos_student_id_key" ON "student_primary_infos"("student_id");
CREATE UNIQUE INDEX "student_secondary_infos_student_id_key" ON "student_secondary_infos"("student_id");
CREATE UNIQUE INDEX "student_university_infos_student_id_key" ON "student_university_infos"("student_id");
CREATE INDEX "student_enrollment_logs_student_id_idx" ON "student_enrollment_logs"("student_id");

ALTER TABLE "school_years" ADD CONSTRAINT "school_years_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "school_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_medical_infos" ADD CONSTRAINT "student_medical_infos_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_maternelle_infos" ADD CONSTRAINT "student_maternelle_infos_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_primary_infos" ADD CONSTRAINT "student_primary_infos_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_secondary_infos" ADD CONSTRAINT "student_secondary_infos_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_university_infos" ADD CONSTRAINT "student_university_infos_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_enrollment_logs" ADD CONSTRAINT "student_enrollment_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
