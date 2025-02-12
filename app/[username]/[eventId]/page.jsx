import { getEventAvailability, getEventDetails } from "@/actions/events";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EventDetails from "./_components/event-details";
import BookingForm from "./_components/booking-form";
export async function generateMetadata({ params }) {
  const event = await getEventDetails(params.username, params.eventId);
  if (!event) {
    return {
      title: "User not found",
    };
  }
  return {
    title: `${event.title} with ${event.user.name} | Expertly`,
    description: `Schedule a  ${event.duration} minute, ${event.title} with ${event.user.name}`,
  };
}
const EventPage = async ({ params }) => {
  // console.log(params.username);
  const event = await getEventDetails(params.username, params.eventId);
  const availability = await getEventAvailability(params.eventId);
  // console.log(availability);
  if (!event) {
    notFound();
  }
  return (
    <div className="flex flex-col justify-center lg:flex-row px-4 py-8">
      <EventDetails event={event} />
      <Suspense fallback={<div>Loading booking form...</div>}>
        <BookingForm event={event} availability={availability} />
      </Suspense>
    </div>
  );
};

export default EventPage;
