-- Category is now a free-form string (inferred by the model) instead of an enum
-- AlterTable
ALTER TABLE "reports" ALTER COLUMN "category" TYPE TEXT USING "category"::TEXT;

-- DropEnum
DROP TYPE "ReportCategory";
