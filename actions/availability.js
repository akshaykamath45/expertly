"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getUserAvailability() {
  // fetch the authenticated user's id
  const { userId } = await auth();

  // throw an error if no user id is found
  if (!userId) {
    throw new Error("unauthorized");
  }

  // retrieve the user from the database, including their availability and days
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      availability: {
        include: { days: true }, // include all day-specific availability
      },
    },
  });

  // return null if no user or availability data is found
  if (!user || !user.availability) {
    return null;
  }

  // initialize the availability data object with the time gap
  const availabilityData = { timeGap: user.availability.timeGap };

  // loop through the days of the week to construct the availability data
  [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ].forEach((day) => {
    // find the availability data for the specific day
    const dayAvailability = user.availability.days.find(
      (d) => d.day === day.toUpperCase() // match the day in uppercase
    );

    // set the availability, start time, and end time for the day
    availabilityData[day] = {
      isAvailable: !!dayAvailability, // true if data exists, false otherwise
      startTime: dayAvailability
        ? dayAvailability.startTime.toISOString().slice(11, 16) // extract hh:mm format
        : "09:00", // default start time
      endTime: dayAvailability
        ? dayAvailability.endTime.toISOString().slice(11, 16) // extract hh:mm format
        : "17:00", // default end time
    };
  });

  // return the transformed availability data
  return availabilityData;
}

export async function updateAvailability(data) {
  // fetch the authenticated user's id
  const { userId } = await auth();

  // throw an error if no user id is found
  if (!userId) {
    throw new Error("unauthorized");
  }

  // retrieve the user from the database, including their availability
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { availability: true }, // include general availability details
  });

  // throw an error if no user is found
  if (!user) {
    throw new Error("user not found");
  }

  // map the input data into an array of availability objects
  const availabilityData = Object.entries(data).flatMap(
    ([day, { isAvailable, startTime, endTime }]) => {
      if (isAvailable) {
        // get the current date in yyyy-mm-dd format for creating datetime
        const baseDate = new Date().toISOString().split("T")[0];

        // return an object with day, start time, and end time if available
        return [
          {
            day: day.toUpperCase(),
            startTime: new Date(`${baseDate}T${startTime}:00Z`),
            endTime: new Date(`${baseDate}T${endTime}:00Z`),
          },
        ];
      }
      // return an empty array if not available
      return [];
    }
  );

  // check if the user already has availability data
  if (user.availability) {
    // update the user's existing availability
    await db.availability.update({
      where: { id: user.availability.id },
      data: {
        timeGap: data.timeGap, // update the time gap
        days: {
          deleteMany: {}, // delete all existing days
          create: availabilityData, // add the new days
        },
      },
    });
  } else {
    // create new availability data for the user
    await db.availability.create({
      data: {
        userId: user.id,
        timeGap: data.timeGap, // set the time gap
        days: {
          create: availabilityData, // add the new days
        },
      },
    });
  }

  // return a success response
  return { success: true };
}
