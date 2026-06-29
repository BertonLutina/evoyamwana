CREATE TABLE "uploaded_files" (
  "id" UUID NOT NULL,
  "school_id" UUID,
  "owner_user_id" UUID NOT NULL,
  "original_name" TEXT NOT NULL,
  "stored_name" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "path" TEXT NOT NULL,
  "purpose" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "uploaded_files_school_id_idx" ON "uploaded_files"("school_id");
CREATE INDEX "uploaded_files_owner_user_id_idx" ON "uploaded_files"("owner_user_id");
