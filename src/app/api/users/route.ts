import { z } from "zod";
import { createCleaner } from "../../../services/user-service";

const createCleanerSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  phone_number: z.string().min(1),
  cleaner_status: z.enum(["active", "inactive"]),
}).strict();

export async function POST(request: Request) {
  // 1. Get authenticated user

  // 2. Check user is ADMIN
  // if no auth → 401
  // if not admin → 403

  // 3. Read body
  const body = await request.json();

  // 4. Validate body with Zod
  const result = createCleanerSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 }
    );
  }

  // 5. Business layer
  const cleaner = await createCleaner(result.data);

  // 6. HTTP response
  return Response.json(cleaner, { status: 201 });
}