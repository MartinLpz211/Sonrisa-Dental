-- AlterTable
ALTER TABLE "users" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'es',
ADD COLUMN     "notifications_enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "clinic_settings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "opening_hours" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_settings_pkey" PRIMARY KEY ("id")
);
