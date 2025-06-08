-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "participants";

-- CreateEnum
CREATE TYPE "participants"."Course" AS ENUM ('ADS', 'GE', 'GTI', 'GEMP', 'MEC');

-- CreateEnum
CREATE TYPE "participants"."Semester" AS ENUM ('SEM1', 'SEM2', 'SEM3', 'SEM4', 'SEM5', 'SEM6');

-- CreateTable
CREATE TABLE "participants"."Participant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "course" "participants"."Course",
    "semester" "participants"."Semester",
    "ra" VARCHAR(12),
    "isPresent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_eventId_ra_key" ON "participants"."Participant"("eventId", "ra");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_eventId_email_key" ON "participants"."Participant"("eventId", "email");
