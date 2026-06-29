CREATE TABLE "school_chat_settings" (
  "id" UUID NOT NULL,
  "school_id" UUID NOT NULL,
  "allow_student_director_chat" BOOLEAN NOT NULL DEFAULT false,
  "allow_student_nurse_chat" BOOLEAN NOT NULL DEFAULT false,
  "allow_student_discipline_chat" BOOLEAN NOT NULL DEFAULT false,
  "allow_student_library_chat" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "school_chat_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transport_assignments" (
  "id" UUID NOT NULL,
  "school_id" UUID NOT NULL,
  "student_user_id" UUID NOT NULL,
  "transport_manager_user_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "transport_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "canteen_assignments" (
  "id" UUID NOT NULL,
  "school_id" UUID NOT NULL,
  "student_user_id" UUID NOT NULL,
  "canteen_manager_user_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "canteen_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_audit_logs" (
  "id" UUID NOT NULL,
  "school_id" UUID,
  "actor_user_id" UUID NOT NULL,
  "target_user_id" UUID,
  "action" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "chat_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "school_chat_settings_school_id_key" ON "school_chat_settings"("school_id");
CREATE UNIQUE INDEX "transport_assignments_student_user_id_transport_manager_user_id_key" ON "transport_assignments"("student_user_id", "transport_manager_user_id");
CREATE UNIQUE INDEX "canteen_assignments_student_user_id_canteen_manager_user_id_key" ON "canteen_assignments"("student_user_id", "canteen_manager_user_id");

CREATE INDEX "transport_assignments_school_id_idx" ON "transport_assignments"("school_id");
CREATE INDEX "transport_assignments_transport_manager_user_id_idx" ON "transport_assignments"("transport_manager_user_id");
CREATE INDEX "canteen_assignments_school_id_idx" ON "canteen_assignments"("school_id");
CREATE INDEX "canteen_assignments_canteen_manager_user_id_idx" ON "canteen_assignments"("canteen_manager_user_id");
CREATE INDEX "chat_audit_logs_school_id_idx" ON "chat_audit_logs"("school_id");
CREATE INDEX "chat_audit_logs_actor_user_id_idx" ON "chat_audit_logs"("actor_user_id");
CREATE INDEX "chat_audit_logs_target_user_id_idx" ON "chat_audit_logs"("target_user_id");
