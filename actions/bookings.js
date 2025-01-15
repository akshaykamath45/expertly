"use server";
import { db } from "@/lib/prisma";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import { google } from "googleapis";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
export async function createBooking(bookingData) {
  try {
    const event = await db.event.findUnique({
      where: { id: bookingData.eventId },
      include: {
        user: true,
      },
    });
    if (!event) {
      throw new Error("Event not found");
    }

    // using google calendar api to generate meet link and add to calendar
    const { data } = await clerkClient.users.getUserOauthAccessToken(
      event.user.clerkUserId,
      "oauth_google"
    );
    const token = data[0]?.token;
    if (!token) {
      throw new Error("Event creator has not connected to google calendar");
    }

    // setting up google oauth client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const meetRepsonse = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: `${bookingData.name} - ${event.title}`,
        description: bookingData.additionalInfo,
        start: { dateTime: bookingData.startTime },
        end: { dateTime: bookingData.endTime },
        attendees: [{ email: bookingData.email }, { email: event.user.email }],
        conferenceData: {
          createRequest: { requestId: `${event.id}-${Date.now()}` },
        },
      },
    });

    const meetLink = meetRepsonse.data.hangoutLink;
    const googleEventId = meetRepsonse.data.id;

    // adding to db

    const booking = await db.booking.create({
      data: {
        eventId: event.id,
        userId: event.userId,
        name: bookingData.name,
        email: bookingData.email,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        additionalInfo: bookingData.additionalInfo,
        meetLink,
        googleEventId,
      },
    });
    return { success: true, booking, meetLink };
  } catch (error) {
    console.error("Error creating booking ", error);
    return { success: false, error: error.message };
  }
}
