-- CreateEnum
CREATE TYPE "Course" AS ENUM ('ADS', 'GE', 'GTI', 'GEMP', 'MEC');

-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('SEM1', 'SEM2', 'SEM3', 'SEM4', 'SEM5', 'SEM6');

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "course" "Course",
    "semester" "Semester",
    "ra" VARCHAR(12),
    "isPresent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_eventId_ra_key" ON "Participant"("eventId", "ra");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_eventId_email_key" ON "Participant"("eventId", "email");
