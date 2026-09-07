-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('cleaner', 'owner', 'admin');

-- CreateEnum
CREATE TYPE "CleanerStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('assigned', 'unassigned');

-- CreateEnum
CREATE TYPE "CompletionStatus" AS ENUM ('upcoming', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'received');

-- CreateEnum
CREATE TYPE "CleaningSessionTaskStatus" AS ENUM ('pending', 'completed', 'skipped');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('session_assigned', 'session_cancelled', 'session_updated', 'session_started', 'session_completed', 'session_unassigned_alert');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "password_hash" TEXT NOT NULL,
    "password_changed_at" TIMESTAMP(3),
    "phone_number" TEXT NOT NULL,
    "profile_image" TEXT,
    "cleaner_status" "CleanerStatus",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chalet" (
    "id" SERIAL NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "access_instructions" TEXT,
    "permanent_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chalet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChaletImage" (
    "id" SERIAL NOT NULL,
    "chalet_id" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "url" TEXT,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChaletImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleaningSessionTemplate" (
    "id" SERIAL NOT NULL,
    "owner_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "CleaningSessionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateTask" (
    "id" SERIAL NOT NULL,
    "cleaning_session_template_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "room" TEXT,
    "requires_cleaner_photo" BOOLEAN NOT NULL DEFAULT false,
    "owner_reference_image_url" TEXT,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "TemplateTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleaningSession" (
    "id" SERIAL NOT NULL,
    "chalet_id" INTEGER NOT NULL,
    "owner_id" TEXT NOT NULL,
    "cleaner_id" TEXT,
    "cleaning_session_template_id" INTEGER,
    "session_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "assignment_status" "AssignmentStatus" NOT NULL DEFAULT 'unassigned',
    "completion_status" "CompletionStatus" NOT NULL DEFAULT 'upcoming',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "payment_received_at" TIMESTAMP(3),
    "hourly_rate" DECIMAL(10,2) NOT NULL DEFAULT 14.00,
    "total_cost" DECIMAL(10,2),
    "cancellation_reason" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CleaningSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleaningSessionTask" (
    "id" SERIAL NOT NULL,
    "cleaning_session_id" INTEGER NOT NULL,
    "template_task_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "room" TEXT,
    "requires_cleaner_photo" BOOLEAN NOT NULL DEFAULT false,
    "owner_reference_image_url" TEXT,
    "status" "CleaningSessionTaskStatus" NOT NULL DEFAULT 'pending',
    "completed_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "CleaningSessionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskImage" (
    "id" SERIAL NOT NULL,
    "cleaning_session_task_id" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "url" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "related_entity_type" TEXT,
    "related_entity_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_users_role_username" ON "User"("role", "username");

-- CreateIndex
CREATE INDEX "idx_availability_user_date" ON "AvailabilitySlot"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilitySlot_user_id_date_start_time_end_time_key" ON "AvailabilitySlot"("user_id", "date", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "idx_chalets_owner_id" ON "Chalet"("owner_id", "id");

-- CreateIndex
CREATE INDEX "idx_chalet_images_chalet_id" ON "ChaletImage"("chalet_id");

-- CreateIndex
CREATE INDEX "idx_cleaning_session_templates_owner_id" ON "CleaningSessionTemplate"("owner_id", "id");

-- CreateIndex
CREATE INDEX "idx_template_tasks_template_id" ON "TemplateTask"("cleaning_session_template_id");

-- CreateIndex
CREATE INDEX "idx_cleaning_sessions_chalet_date" ON "CleaningSession"("chalet_id", "session_date");

-- CreateIndex
CREATE INDEX "idx_cleaning_sessions_owner_date" ON "CleaningSession"("owner_id", "session_date");

-- CreateIndex
CREATE INDEX "idx_cleaning_sessions_cleaner_date" ON "CleaningSession"("cleaner_id", "session_date");

-- CreateIndex
CREATE INDEX "idx_cleaning_sessions_date" ON "CleaningSession"("session_date");

-- CreateIndex
CREATE INDEX "idx_cleaning_sessions_assignment_status" ON "CleaningSession"("assignment_status");

-- CreateIndex
CREATE INDEX "idx_cleaning_sessions_completion_status" ON "CleaningSession"("completion_status");

-- CreateIndex
CREATE INDEX "idx_cleaning_sessions_payment_status" ON "CleaningSession"("payment_status");

-- CreateIndex
CREATE INDEX "idx_cleaning_session_tasks_id" ON "CleaningSessionTask"("id");

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chalet" ADD CONSTRAINT "Chalet_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChaletImage" ADD CONSTRAINT "ChaletImage_chalet_id_fkey" FOREIGN KEY ("chalet_id") REFERENCES "Chalet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningSessionTemplate" ADD CONSTRAINT "CleaningSessionTemplate_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateTask" ADD CONSTRAINT "TemplateTask_cleaning_session_template_id_fkey" FOREIGN KEY ("cleaning_session_template_id") REFERENCES "CleaningSessionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningSession" ADD CONSTRAINT "CleaningSession_chalet_id_fkey" FOREIGN KEY ("chalet_id") REFERENCES "Chalet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningSession" ADD CONSTRAINT "CleaningSession_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningSession" ADD CONSTRAINT "CleaningSession_cleaner_id_fkey" FOREIGN KEY ("cleaner_id") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningSession" ADD CONSTRAINT "CleaningSession_cleaning_session_template_id_fkey" FOREIGN KEY ("cleaning_session_template_id") REFERENCES "CleaningSessionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningSession" ADD CONSTRAINT "CleaningSession_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningSessionTask" ADD CONSTRAINT "CleaningSessionTask_cleaning_session_id_fkey" FOREIGN KEY ("cleaning_session_id") REFERENCES "CleaningSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningSessionTask" ADD CONSTRAINT "CleaningSessionTask_template_task_id_fkey" FOREIGN KEY ("template_task_id") REFERENCES "TemplateTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskImage" ADD CONSTRAINT "TaskImage_cleaning_session_task_id_fkey" FOREIGN KEY ("cleaning_session_task_id") REFERENCES "CleaningSessionTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
