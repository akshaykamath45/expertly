"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/clerk-sdk-node";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function updateUsername(username) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: No user ID found.");
  }

  // Check if the username is already taken
  const existingUser = await db.user.findUnique({
    where: { username },
  });
  console.log(existingUser);

  if (existingUser && existingUser.clerkUserId !== userId) {
    throw new Error("Username is already taken.");
  }

  // Update username in the database
  await db.user.update({
    where: { clerkUserId: userId },
    data: { username },
  });

  // Update username in Clerk
  await clerkClient.users.updateUser(userId, {
    username,
  });
  console.log("Updating Clerk user:", { userId, username });

  return { success: true };
}

// custom user page
export async function getUserByUsername(username) {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      events: {
        where: {
          isPrivate: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          isPrivate: true,
          _count: {
            select: { bookings: true },
          },
        },
      },
    },
  });
  return user;
}
