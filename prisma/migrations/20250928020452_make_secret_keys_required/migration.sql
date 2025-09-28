/*
  Warnings:

  - Made the column `refreshSecretKey` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `secretKey` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "api_auth_test_schema"."users" ALTER COLUMN "refreshSecretKey" SET NOT NULL,
ALTER COLUMN "secretKey" SET NOT NULL;
