"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { eventSchema } from "@/app/lib/validators";

export async function createEvent(data) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: No user ID found.");
  }

  const validatedData = eventSchema.parse(data);

  // finding user in db
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  const event = await db.event.create({
    data: {
      ...validatedData,
      userId: user.id,
    },
  });
  return event;
}
