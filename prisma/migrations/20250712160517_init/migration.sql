/*
  Warnings:

  - Made the column `status` on table `Gadget` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Gadget" ALTER COLUMN "status" SET NOT NULL;
