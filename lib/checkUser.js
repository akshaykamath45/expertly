import { currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import { db } from "@/lib/prisma";

// Create a custom Clerk client instance
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db?.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const username = `${user.firstName}-${user.lastName}-${user.id.slice(-4)}`;

    await clerkClient.users.updateUser(user.id, {
      username,
    });

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress || "",
        username,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser function:", error);
    throw new Error("Failed to check or create user.");
  }
};
