"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { eventSchema } from "@/app/lib/validators";
import {
  addDays,
  format,
  isBefore,
  startOfDay,
  parseISO,
  addMinutes,
} from "date-fns";
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

export async function getUserEvents() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: No user ID found.");
  }

  // checking if user exists in the db
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // retrieving events of a particular user
  const events = await db.event.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  // username to copy the link
  return { events, username: user.username };
}

export async function deleteEvent(eventId) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: No user ID found.");
  }

  // checking if user exists in the db
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // finding the particular event
  const event = await db.event.findUnique({
    where: { id: eventId },
  });
  if (!event || event.userId !== user.id) {
    throw new Error("Event not found or unauthorised");
  }

  // deleting the event
  await db.event.delete({
    where: { id: eventId },
  });
  return { success: true };
}

export async function getEventDetails(username, eventId) {
  const event = await db.event.findFirst({
    where: {
      id: eventId,
      user: {
        username: username,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          imageUrl: true,
          username: true,
        },
      },
    },
  });
  return event;
}

export async function getEventAvailability(eventId) {
  const event = await db.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      user: {
        include: {
          availability: {
            select: {
              days: true,
              timeGap: true,
            },
          },
          bookings: {
            select: {
              startTime: true,
              endTime: true,
            },
          },
        },
      },
    },
  });
  if (!event || !event.user.availability) {
    return [];
  }
  const { availability, bookings } = event.user;

  // set the start date to the beginning of the current day
  const startDate = startOfDay(new Date());

  // set the end date to 30 days after the start date
  const endDate = addDays(startDate, 30);

  // initialize an empty array to store available dates and slots
  const availableDates = [];

  // loop through each date from start to end date
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    // get the day of the week(MONDAY,TUESDAY,etc) in uppercase
    const dayOfWeek = format(date, "EEEE").toUpperCase();

    // find the user's availability for this day
    const dayAvailability = availability.days.find((d) => d.day === dayOfWeek);

    // if the user is available on this day
    if (dayAvailability) {
      // format the current date as "yyyy-MM-dd"
      const dateStr = format(date, "yyyy-MM-dd");

      // generate available time slots for the day
      const slots = generateAvailableTimeSlots(
        dayAvailability.startTime, // start time
        dayAvailability.endTime, // end time
        event.duration, // event duration
        bookings, // existing bookings
        dateStr, // current date
        availability.timeGap // time gap between slots
      );

      // add the date and slots to the array
      availableDates.push({
        date: dateStr,
        slots,
      });
    }
    // return the list of available dates and slots
    return availableDates;
  }
}

function generateAvailableTimeSlots(
  startTime, // start time of availability (e.g., 9:00 AM)
  endTime, // end time of availability (e.g., 12:00 PM)
  duration, // duration of each slot in minutes (e.g., 30 minutes)
  bookings, // existing bookings for the day
  dateStr, // the date for which slots are being generated (e.g., "2025-01-15")
  timeGap = 0 // minimum gap between slots in minutes
) {
  const slots = []; // initialize an empty array to store slots

  // parse the start time and end time with the given date
  let currentTime = parseISO(
    `${dateStr}T${startTime.toISOString().slice(11, 16)}`
  );
  const slotEndTime = parseISO(
    `${dateStr}T${endTime.toISOString().slice(11, 16)}`
  );

  const now = new Date(); // get the current time

  // adjust the start time if the current date matches today's date
  if (format(now, "yyyy-MM-dd") === dateStr) {
    currentTime = isBefore(currentTime, now)
      ? addMinutes(now, timeGap)
      : currentTime;
  }

  // loop until the current time reaches the end time
  while (currentTime < slotEndTime) {
    // calculate the end time of the current slot
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);

    // check if the current slot conflicts with any existing booking
    const isSlotAvailable = !bookings.some((booking) => {
      const bookingStart = booking.startTime; // start time of the booking
      const bookingEnd = booking.endTime; // end time of the booking

      // check if the slot overlaps with a booking
      return (
        (currentTime >= bookingStart && currentTime < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (currentTime <= bookingStart && slotEnd >= bookingEnd)
      );
    });

    // if the slot is available, format and add it to the slots array
    if (isSlotAvailable) {
      slots.push(format(currentTime, "HH:mm")); // e.g., "09:00"
    }

    // move to the next slot based on the duration
    currentTime = slotEnd;
  }

  return slots; // return the list of available time slots
}
