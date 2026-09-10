import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

// =========================================================
// DATE HELPERS
// Keep seeded sessions relative to today so the world
// remains useful whenever the seed script is run.
// =========================================================

function dateOnly(daysFromToday: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(0, 0, 0, 0);
  return date;
}

function timeOnly(hours: number, minutes = 0): Date {
  // PostgreSQL @db.Time only cares about the time portion.
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
}

// =========================================================
// MAIN
// =========================================================

async function main() {
  console.log("🌱 Seeding Yalla Crew...");

  // =======================================================
  // RESET DATABASE
  // Delete children before parents because not all of your
  // relations currently use onDelete: Cascade.
  // =======================================================

  await prisma.taskImage.deleteMany();
  await prisma.cleaningSessionTask.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.cleaningSession.deleteMany();
  await prisma.templateTask.deleteMany();
  await prisma.cleaningSessionTemplate.deleteMany();
  await prisma.chaletImage.deleteMany();
  await prisma.chalet.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.user.deleteMany();

  // =======================================================
  // 1. USERS
  // =======================================================

  // -----------------------
  // Admin
  // -----------------------

  const adminMain = await prisma.user.create({
    data: {
      username: "Jad Khoury",
      role: "admin",
      email: "jad.khoury@yallacrew.com",
      email_verified: true,
      email_verified_at: new Date(),
      password_hash: "passwordHash",
      phone_number: "+96170123456",
    },
  });

  // -----------------------
  // Cleaners
  // -----------------------

  // Active + available
  const cleanerAvailable = await prisma.user.create({
    data: {
      username: "Maya Fares",
      role: "cleaner",
      email: "maya.fares@yallacrew.com",
      email_verified: true,
      email_verified_at: new Date(),
      password_hash: "passwordHash",
      phone_number: "+96171234567",
      cleaner_status: "active",
    },
  });

  // Active, but will have a conflicting booking
  const cleanerBusy = await prisma.user.create({
    data: {
      username: "Rami Nasrallah",
      role: "cleaner",
      email: "rami.nasrallah@yallacrew.com",
      email_verified: true,
      email_verified_at: new Date(),
      password_hash: "passwordHash",
      phone_number: "+96176345678",
      cleaner_status: "active",
    },
  });

  // Has availability, but should not be eligible because inactive
  const cleanerInactive = await prisma.user.create({
    data: {
      username: "Sara Nassar",
      role: "cleaner",
      email: "sara.nassar@yallacrew.com",
      email_verified: true,
      email_verified_at: new Date(),
      password_hash: "passwordHash",
      phone_number: "+96170111222",
      cleaner_status: "inactive",
    },
  });

  // -----------------------
  // Owners
  // -----------------------

  // Main verified owner used throughout the seeded world
  const ownerMain = await prisma.user.create({
    data: {
      username: "Karim Aoun",
      role: "owner",
      email: "karim.aoun@gmail.com",
      email_verified: true,
      email_verified_at: new Date(),
      password_hash: "passwordHash",
      phone_number: "+96178456789",
      profile_image: "https://example.com/profiles/karim.jpg",
    },
  });

  // Required persistent state for FR-003
  const ownerUnverified = await prisma.user.create({
    data: {
      username: "Layal Haddad",
      role: "owner",
      email: "layal.haddad@gmail.com",
      email_verified: false,
      email_verified_at: null,
      password_hash: "passwordHash",
      phone_number: "+96179567890",
      profile_image: null,
    },
  });

  // =======================================================
  // 2. CLEANER AVAILABILITY
  // =======================================================

  // Active + free cleaner
  await prisma.availabilitySlot.createMany({
    data: [
      {
        user_id: cleanerAvailable.userId,
        date: dateOnly(1),
        start_time: timeOnly(9),
        end_time: timeOnly(13),
      },
      {
        user_id: cleanerAvailable.userId,
        date: dateOnly(1),
        start_time: timeOnly(14),
        end_time: timeOnly(18),
      },
      {
        user_id: cleanerAvailable.userId,
        date: dateOnly(3),
        start_time: timeOnly(10),
        end_time: timeOnly(16),
      },
    ],
  });

  // Active cleaner with availability, but we'll book part of it
  await prisma.availabilitySlot.create({
    data: {
      user_id: cleanerBusy.userId,
      date: dateOnly(1),
      start_time: timeOnly(9),
      end_time: timeOnly(17),
    },
  });

  // Deliberately has availability despite being inactive
  await prisma.availabilitySlot.create({
    data: {
      user_id: cleanerInactive.userId,
      date: dateOnly(1),
      start_time: timeOnly(9),
      end_time: timeOnly(17),
    },
  });

  // =======================================================
  // 3. CHALETS
  // =======================================================

  // Has upcoming work
  const chaletActive = await prisma.chalet.create({
    data: {
      owner_id: ownerMain.userId,
      name: "Cedars Chalet",
      location: "Faraya, Lebanon",
      latitude: 34.01000000,
      longitude: 35.83000000,
      access_instructions:
        "Key is available in the lockbox beside the entrance.",
      permanent_notes:
        "Use wood-safe products on the living room floor.",
    },
  });

  // Has historical sessions
  const chaletHistory = await prisma.chalet.create({
    data: {
      owner_id: ownerMain.userId,
      name: "Mountain View Chalet",
      location: "Kfardebian, Lebanon",
      latitude: 33.99000000,
      longitude: 35.84000000,
      access_instructions: null,
      permanent_notes: null,
    },
  });

  // No sessions — useful for deletion scenario
  const chaletEmpty = await prisma.chalet.create({
    data: {
      owner_id: ownerMain.userId,
      name: "Pine Retreat",
      location: "Faqra, Lebanon",
      latitude: 33.98000000,
      longitude: 35.81000000,
    },
  });

  // =======================================================
  // 4. CHALET IMAGES
  // =======================================================

  // Multiple images
  await prisma.chaletImage.createMany({
    data: [
      {
        chalet_id: chaletActive.id,
        storage_key: "chalets/cedars/front.jpg",
        url: "https://example.com/chalets/cedars/front.jpg",
        is_cover: true,
        display_order: 1,
      },
      {
        chalet_id: chaletActive.id,
        storage_key: "chalets/cedars/living-room.jpg",
        url: "https://example.com/chalets/cedars/living-room.jpg",
        is_cover: false,
        display_order: 2,
      },
    ],
  });

  // chaletHistory deliberately has 0 images

  // One image
  await prisma.chaletImage.create({
    data: {
      chalet_id: chaletEmpty.id,
      storage_key: "chalets/pine/front.jpg",
      url: "https://example.com/chalets/pine/front.jpg",
      is_cover: true,
      display_order: 1,
    },
  });

  // =======================================================
  // 5. CLEANING SESSION TEMPLATES
  // =======================================================

  const standardTemplate =
    await prisma.cleaningSessionTemplate.create({
      data: {
        owner_id: ownerMain.userId,
        name: "Standard Chalet Cleaning",
        description: "Regular chalet cleaning checklist.",
      },
    });

  const deepCleanTemplate =
    await prisma.cleaningSessionTemplate.create({
      data: {
        owner_id: ownerMain.userId,
        name: "Deep Cleaning",
        description: "More detailed cleaning checklist.",
      },
    });

  // =======================================================
  // 6. TEMPLATE TASKS
  // =======================================================

  const kitchenSurfaces = await prisma.templateTask.create({
    data: {
      cleaning_session_template_id: standardTemplate.id,
      name: "Clean kitchen surfaces",
      description: "Wipe counters and exterior surfaces.",
      room: "Kitchen",
      requires_cleaner_photo: false,
    },
  });

  const refrigerator = await prisma.templateTask.create({
    data: {
      cleaning_session_template_id: standardTemplate.id,
      name: "Clean refrigerator",
      description: "Clean refrigerator shelves and surfaces.",
      room: "Kitchen",
      requires_cleaner_photo: true,
    },
  });

  const masterBed = await prisma.templateTask.create({
    data: {
      cleaning_session_template_id: standardTemplate.id,
      name: "Make master bed",
      description: "Prepare the bed as shown in the reference photo.",
      room: "Bedroom",
      requires_cleaner_photo: true,
      owner_reference_image_url:
        "https://example.com/reference/master-bed.jpg",
    },
  });

  const sweepBalcony = await prisma.templateTask.create({
    data: {
      cleaning_session_template_id: standardTemplate.id,
      name: "Sweep balcony",
      description: null,
      room: "Balcony",
      requires_cleaner_photo: false,
    },
  });

  // Some tasks for second template
  await prisma.templateTask.createMany({
    data: [
      {
        cleaning_session_template_id: deepCleanTemplate.id,
        name: "Deep clean oven",
        room: "Kitchen",
        requires_cleaner_photo: true,
      },
      {
        cleaning_session_template_id: deepCleanTemplate.id,
        name: "Clean bathroom tiles",
        room: "Bathroom",
        requires_cleaner_photo: false,
      },
    ],
  });

  // =======================================================
  // 7. CLEANING SESSIONS
  // =======================================================

  // A. Normal assigned upcoming session
  const sessionUpcomingAssigned =
    await prisma.cleaningSession.create({
      data: {
        chalet_id: chaletActive.id,
        owner_id: ownerMain.userId,
        cleaner_id: cleanerAvailable.userId,
        cleaning_session_template_id: standardTemplate.id,

        session_date: dateOnly(3),
        start_time: timeOnly(10),
        end_time: timeOnly(13),

        assignment_status: "assigned",
        completion_status: "upcoming",
        payment_status: "pending",

        hourly_rate: 14,
        total_cost: 42,
      },
    });

  // B. No cleaner assigned
  const sessionUpcomingUnassigned =
    await prisma.cleaningSession.create({
      data: {
        chalet_id: chaletActive.id,
        owner_id: ownerMain.userId,

        // Blank task-list request: deliberately no template
        cleaning_session_template_id: null,
        cleaner_id: null,

        session_date: dateOnly(2),
        start_time: timeOnly(19),
        end_time: timeOnly(21),

        assignment_status: "unassigned",
        completion_status: "upcoming",
        payment_status: "pending",

        hourly_rate: 14,
        total_cost: 28,
      },
    });

  // C. In-progress session
  //
  // This is intentionally today's date. If your service layer requires
  // the exact scheduled start time to start a session, adjust the time
  // when using this scenario interactively.
  const sessionInProgress =
    await prisma.cleaningSession.create({
      data: {
        chalet_id: chaletActive.id,
        owner_id: ownerMain.userId,
        cleaner_id: cleanerBusy.userId,
        cleaning_session_template_id: standardTemplate.id,

        session_date: dateOnly(0),
        start_time: timeOnly(9),
        end_time: timeOnly(12),

        assignment_status: "assigned",
        completion_status: "in_progress",
        payment_status: "pending",

        hourly_rate: 14,
        total_cost: 42,
      },
    });

  // D. Completed but Yalla Crew has not received payment
  const sessionCompletedPending =
    await prisma.cleaningSession.create({
      data: {
        chalet_id: chaletHistory.id,
        owner_id: ownerMain.userId,
        cleaner_id: cleanerAvailable.userId,
        cleaning_session_template_id: standardTemplate.id,

        session_date: dateOnly(-3),
        start_time: timeOnly(10),
        end_time: timeOnly(14),

        assignment_status: "assigned",
        completion_status: "completed",
        payment_status: "pending",

        hourly_rate: 14,
        total_cost: 56,
      },
    });

  // E. Completed + payment received
  const sessionCompletedReceived =
    await prisma.cleaningSession.create({
      data: {
        chalet_id: chaletHistory.id,
        owner_id: ownerMain.userId,
        cleaner_id: cleanerAvailable.userId,
        cleaning_session_template_id: deepCleanTemplate.id,

        session_date: dateOnly(-7),
        start_time: timeOnly(9),
        end_time: timeOnly(13),

        assignment_status: "assigned",
        completion_status: "completed",
        payment_status: "received",
        payment_received_at: dateOnly(-6),

        hourly_rate: 14,
        total_cost: 56,
      },
    });

  // F. Cancelled session
  const sessionCancelled =
    await prisma.cleaningSession.create({
      data: {
        chalet_id: chaletHistory.id,
        owner_id: ownerMain.userId,
        cleaner_id: cleanerBusy.userId,
        cleaning_session_template_id: standardTemplate.id,

        session_date: dateOnly(-2),
        start_time: timeOnly(15),
        end_time: timeOnly(17),

        assignment_status: "assigned",
        completion_status: "cancelled",
        payment_status: "pending",

        hourly_rate: 14,
        total_cost: 28,

        cancellation_reason: "Owner unavailable",
        cancelled_at: dateOnly(-3),
        cancelled_by: ownerMain.userId,
      },
    });

  // =======================================================
  // 8. CLEANING SESSION TASKS
  // =======================================================

  // -----------------------
  // Upcoming session
  // All tasks pending
  // -----------------------

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaning_session_id: sessionUpcomingAssigned.id,
        template_task_id: kitchenSurfaces.id,
        name: kitchenSurfaces.name,
        description: kitchenSurfaces.description,
        room: kitchenSurfaces.room,
        requires_cleaner_photo: false,
        status: "pending",
      },
      {
        cleaning_session_id: sessionUpcomingAssigned.id,
        template_task_id: refrigerator.id,
        name: refrigerator.name,
        description: refrigerator.description,
        room: refrigerator.room,
        requires_cleaner_photo: true,
        status: "pending",
      },
      {
        cleaning_session_id: sessionUpcomingAssigned.id,
        template_task_id: masterBed.id,
        name: masterBed.name,
        description: masterBed.description,
        room: masterBed.room,
        requires_cleaner_photo: true,
        owner_reference_image_url:
          masterBed.owner_reference_image_url,
        status: "pending",
      },
    ],
  });

  // -----------------------
  // Blank-list session
  // Tasks don't originate from TemplateTask
  // -----------------------

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaning_session_id: sessionUpcomingUnassigned.id,
        template_task_id: null,
        name: "Clean living room",
        room: "Living Room",
        requires_cleaner_photo: false,
        status: "pending",
      },
      {
        cleaning_session_id: sessionUpcomingUnassigned.id,
        template_task_id: null,
        name: "Clean fireplace",
        room: "Living Room",
        requires_cleaner_photo: true,
        status: "pending",
      },
    ],
  });

  // -----------------------
  // In-progress session
  // Mix of completed + pending
  // -----------------------

  const inProgressCompletedTask =
    await prisma.cleaningSessionTask.create({
      data: {
        cleaning_session_id: sessionInProgress.id,
        template_task_id: refrigerator.id,
        name: refrigerator.name,
        description: refrigerator.description,
        room: refrigerator.room,
        requires_cleaner_photo: true,
        status: "completed",
        completed_at: new Date(),
      },
    });

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaning_session_id: sessionInProgress.id,
        template_task_id: kitchenSurfaces.id,
        name: kitchenSurfaces.name,
        description: kitchenSurfaces.description,
        room: kitchenSurfaces.room,
        requires_cleaner_photo: false,
        status: "completed",
        completed_at: new Date(),
      },
      {
        cleaning_session_id: sessionInProgress.id,
        template_task_id: masterBed.id,
        name: masterBed.name,
        description: masterBed.description,
        room: masterBed.room,
        requires_cleaner_photo: true,
        owner_reference_image_url:
          masterBed.owner_reference_image_url,
        status: "pending",
      },
    ],
  });

  // -----------------------
  // Completed / payment pending
  // completed + skipped + completed
  // -----------------------

  const completedProofTask =
    await prisma.cleaningSessionTask.create({
      data: {
        cleaning_session_id: sessionCompletedPending.id,
        template_task_id: refrigerator.id,
        name: refrigerator.name,
        description: refrigerator.description,
        room: refrigerator.room,
        requires_cleaner_photo: true,
        status: "completed",
        completed_at: dateOnly(-3),
      },
    });

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaning_session_id: sessionCompletedPending.id,
        template_task_id: kitchenSurfaces.id,
        name: kitchenSurfaces.name,
        room: kitchenSurfaces.room,
        requires_cleaner_photo: false,
        status: "completed",
        completed_at: dateOnly(-3),
      },
      {
        cleaning_session_id: sessionCompletedPending.id,
        template_task_id: sweepBalcony.id,
        name: sweepBalcony.name,
        room: sweepBalcony.room,
        requires_cleaner_photo: false,
        status: "skipped",
      },
    ],
  });

  // -----------------------
  // Completed / received
  // -----------------------

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaning_session_id: sessionCompletedReceived.id,
        name: "Deep clean oven",
        room: "Kitchen",
        requires_cleaner_photo: true,
        status: "completed",
        completed_at: dateOnly(-7),
      },
      {
        cleaning_session_id: sessionCompletedReceived.id,
        name: "Clean bathroom tiles",
        room: "Bathroom",
        requires_cleaner_photo: false,
        status: "completed",
        completed_at: dateOnly(-7),
      },
    ],
  });

  // -----------------------
  // Cancelled session
  // Tasks remain pending
  // -----------------------

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaning_session_id: sessionCancelled.id,
        template_task_id: kitchenSurfaces.id,
        name: kitchenSurfaces.name,
        room: kitchenSurfaces.room,
        requires_cleaner_photo: false,
        status: "pending",
      },
      {
        cleaning_session_id: sessionCancelled.id,
        template_task_id: refrigerator.id,
        name: refrigerator.name,
        room: refrigerator.room,
        requires_cleaner_photo: true,
        status: "pending",
      },
    ],
  });

  // =======================================================
  // 9. TASK IMAGES
  // =======================================================

  // Proof-required completed task WITH proof
  await prisma.taskImage.create({
    data: {
      cleaning_session_task_id: completedProofTask.id,
      storage_key: "task-proof/refrigerator-after.jpg",
      url: "https://example.com/task-proof/refrigerator-after.jpg",
    },
  });

  // Another completed proof-required task with an image
  await prisma.taskImage.create({
    data: {
      cleaning_session_task_id: inProgressCompletedTask.id,
      storage_key: "task-proof/refrigerator-progress.jpg",
      url: "https://example.com/task-proof/refrigerator-progress.jpg",
    },
  });

  // Pending proof-required tasks intentionally have NO TaskImage.

  // =======================================================
  // 10. NOTIFICATIONS
  // =======================================================

  await prisma.notification.createMany({
    data: [
      // Cleaner notifications
      {
        user_id: cleanerAvailable.userId,
        type: "session_assigned",
        title: "New Cleaning Session",
        message: "You have been assigned to Cedars Chalet.",
        related_entity_type: "cleaning_session",
        related_entity_id: sessionUpcomingAssigned.id,
        is_read: false,
      },
      {
        user_id: cleanerBusy.userId,
        type: "session_cancelled",
        title: "Session Cancelled",
        message: "A cleaning session has been cancelled.",
        related_entity_type: "cleaning_session",
        related_entity_id: sessionCancelled.id,
        is_read: true,
      },
      {
        user_id: cleanerAvailable.userId,
        type: "session_updated",
        title: "Session Updated",
        message: "One of your assigned sessions was updated.",
        related_entity_type: "cleaning_session",
        related_entity_id: sessionUpcomingAssigned.id,
        is_read: true,
      },

      // Owner notifications
      {
        user_id: ownerMain.userId,
        type: "session_started",
        title: "Cleaning Started",
        message: "Cleaning has started at Cedars Chalet.",
        related_entity_type: "cleaning_session",
        related_entity_id: sessionInProgress.id,
        is_read: false,
      },
      {
        user_id: ownerMain.userId,
        type: "session_completed",
        title: "Cleaning Completed",
        message: "Cleaning at Mountain View Chalet is complete.",
        related_entity_type: "cleaning_session",
        related_entity_id: sessionCompletedPending.id,
        is_read: false,
      },

      // Admin notification
      {
        user_id: adminMain.userId,
        type: "session_unassigned_alert",
        title: "Unassigned Session",
        message:
          "A cleaning request could not be assigned to a cleaner.",
        related_entity_type: "cleaning_session",
        related_entity_id: sessionUpcomingUnassigned.id,
        is_read: false,
      },
    ],
  });

  console.log("✅ Yalla Crew seed complete.");
  console.log(`
Seed world:
  Users:        6
  Chalets:      3
  Templates:    2
  Sessions:     6

Scenarios:
  ✓ verified owner
  ✓ unverified owner
  ✓ active available cleaner
  ✓ active busy cleaner
  ✓ inactive cleaner
  ✓ empty / active / historical chalets
  ✓ template + blank-list sessions
  ✓ assigned / unassigned
  ✓ upcoming / in-progress / completed / cancelled
  ✓ pending / received payments
  ✓ pending / completed / skipped tasks
  ✓ proof images
  ✓ read / unread notifications
  `);
}

// =========================================================
// RUN
// =========================================================

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });