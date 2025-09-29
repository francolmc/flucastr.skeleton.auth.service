/*
  Warnings:

  - A unique constraint covering the columns `[renewalVerificationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "api_auth_test_schema"."users" ADD COLUMN     "renewalVerificationToken" TEXT,
ADD COLUMN     "renewalVerificationTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_renewalVerificationToken_key" ON "api_auth_test_schema"."users"("renewalVerificationToken");
