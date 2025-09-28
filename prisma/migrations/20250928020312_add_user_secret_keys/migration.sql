-- AlterTable
ALTER TABLE "api_auth_test_schema"."users" ADD COLUMN     "refreshSecretKey" TEXT,
ADD COLUMN     "secretKey" TEXT;
