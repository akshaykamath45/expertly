"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getUserAvailability() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: No user ID found.");
  }
  // finding user in db
  // Fetch the user from the database based on their unique Clerk user ID
  const user = await db.user.findUnique({
    where: { clerkUserId: userId }, // Look for a user with a `clerkUserId` matching the provided `userId`
    include: {
      availability: {
        // Include the `availability` relationship
        include: { days: true }, // Also include the related `days` (list of day-specific availability)
      },
    },
  });

  // Check if the user or their availability data doesn't exist
  if (!user || !user.availability) {
    return null; // If no user or availability data is found, return `null`
  }

  // Initialize an object to hold the transformed availability data
  const availabilityData = {
    timeGap: user.availability.timeGap, // Add the `timeGap` field (minimum gap between bookings in minutes)
  };

  // Define the days of the week to iterate over
  [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ].forEach((day) => {
    // For each day, find the corresponding availability entry
    const dayAvailability = user.availability.days.find(
      (d) => d.day === day.toUpperCase() // Compare the day string in uppercase (e.g., "MONDAY")
    );

    // Add the availability data for the current day to the `availabilityData` object
    availabilityData[day] = {
      isAvailable: !!dayAvailability, // `true` if `dayAvailability` exists, otherwise `false`
      startTime: dayAvailability
        ? dayAvailability.startTime.toISOString().slice(11, 16) // Format `startTime` as "HH:MM" if available
        : "09:00", // Default start time if no availability exists
      endTime: dayAvailability
        ? dayAvailability.endTime.toISOString().slice(11, 16) // Format `endTime` as "HH:MM" if available
        : "17:00", // Default end time if no availability exists
    };
  });

  // Return the fully constructed availability data object
  return availabilityData;
}
