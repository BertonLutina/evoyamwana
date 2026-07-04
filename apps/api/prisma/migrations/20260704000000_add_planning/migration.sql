CREATE TABLE "plannings" (
  "id" UUID NOT NULL,
  "schoolId" UUID NOT NULL,
  "creatorId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "location" TEXT,
  "date" TIMESTAMP(3) NOT NULL,
  "startMinutes" INTEGER NOT NULL,
  "endMinutes" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "plannings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "planning_participants" (
  "id" UUID NOT NULL,
  "planningId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "planning_participants_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "plannings_schoolId_date_idx" ON "plannings"("schoolId", "date");
CREATE INDEX "plannings_creatorId_idx" ON "plannings"("creatorId");
CREATE UNIQUE INDEX "planning_participants_planningId_userId_key" ON "planning_participants"("planningId", "userId");
CREATE INDEX "planning_participants_userId_idx" ON "planning_participants"("userId");

ALTER TABLE "plannings" ADD CONSTRAINT "plannings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "plannings" ADD CONSTRAINT "plannings_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "planning_participants" ADD CONSTRAINT "planning_participants_planningId_fkey" FOREIGN KEY ("planningId") REFERENCES "plannings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "planning_participants" ADD CONSTRAINT "planning_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
