# All User Actions

### `actions/dashboard.js`

#### `getLatestUpdates()`
1. **Authentication**: Retrieves the current user's ID using the `auth()` function.
2. **Authorization Check**: Throws an error if no user ID is found, indicating unauthorized access.
3. **User Retrieval**: Fetches the user from the database using the Clerk user ID.
4. **User Existence Check**: Throws an error if the user is not found in the database.
5. **Current Time**: Captures the current date and time.
6. **Upcoming Meetings Query**: Queries the database for the user's upcoming meetings, ordered by start time in ascending order, and limits the results to the next three meetings.
7. **Return Data**: Returns the list of upcoming meetings, including the event title.

### `actions/users.js`

#### `updateUsername(username)`
1. **Authentication**: Retrieves the current user's ID using the `auth()` function.
2. **Authorization Check**: Throws an error if no user ID is found, indicating unauthorized access.
3. **Username Uniqueness Check**: Checks if the desired username is already taken by another user.
4. **Conflict Check**: Throws an error if the username is already taken by another user.
5. **Database Update**: Updates the user's username in the database.
6. **Clerk Update**: Updates the user's username in the Clerk system.
7. **Return Success**: Returns a success response if the update is successful.

#### `getUserByUsername(username)`
1. **User Query**: Fetches a user from the database by their username.
2. **Data Selection**: Selects specific fields to return, including user ID, name, email, image URL, and public events.
3. **Event Filtering**: Filters the user's events to include only public ones, ordered by creation date in descending order.
4. **Return Data**: Returns the user data along with their public events.

### `actions/meetings.js`

#### `getUserMeetings(type = "upcoming")`
1. **Authentication**: Retrieves the current user's ID using the `auth()` function.
2. **Authorization Check**: Throws an error if no user ID is found, indicating unauthorized access.
3. **User Retrieval**: Fetches the user from the database using the Clerk user ID.
4. **User Existence Check**: Throws an error if the user is not found in the database.
5. **Current Time**: Captures the current date and time.
6. **Meetings Query**: Queries the database for the user's meetings, filtering by upcoming or past based on the `type` parameter.
7. **Data Inclusion**: Includes event details and the event creator's name and email.
8. **Return Data**: Returns the list of meetings, ordered by start time.

#### `cancelMeeting(meetingId)`
1. **Authentication**: Retrieves the current user's ID using the `auth()` function.
2. **Authorization Check**: Throws an error if no user ID is found, indicating unauthorized access.
3. **User Retrieval**: Fetches the user from the database using the Clerk user ID.
4. **User Existence Check**: Throws an error if the user is not found in the database.
5. **Meeting Retrieval**: Fetches the meeting from the database by its ID, including event and user details.
6. **Ownership Check**: Throws an error if the meeting is not found or the user is not authorized to cancel it.
7. **Google Calendar Integration**: Attempts to delete the meeting from Google Calendar using the event's Google event ID.
8. **Database Deletion**: Deletes the meeting from the database.
9. **Return Success**: Returns a success response if the cancellation is successful.

### `actions/availability.js`

#### `getUserAvailability()`
1. **Authentication**: Retrieves the current user's ID using the `auth()` function.
2. **Authorization Check**: Throws an error if no user ID is found, indicating unauthorized access.
3. **User Retrieval**: Fetches the user from the database, including their availability and day-specific details.
4. **Data Existence Check**: Returns `null` if no user or availability data is found.
5. **Data Transformation**: Constructs an availability data object, including the time gap and day-specific availability.
6. **Return Data**: Returns the transformed availability data.

#### `updateAvailability(data)`
1. **Authentication**: Retrieves the current user's ID using the `auth()` function.
2. **Authorization Check**: Throws an error if no user ID is found, indicating unauthorized access.
3. **User Retrieval**: Fetches the user from the database, including their availability.
4. **User Existence Check**: Throws an error if the user is not found in the database.
5. **Data Mapping**: Maps the input data into an array of availability objects, including day, start time, and end time.
6. **Data Update**: Updates the user's existing availability or creates new availability data if none exists.
7. **Return Success**: Returns a success response if the update is successful.

Certainly! Let's break down the actions in `events.js` and `bookings.js` in detail, explaining what each function does step by step.

### `actions/events.js`

#### `createEvent(data)`
1. **Authentication**: Retrieves the current user's ID using the `auth()` function.
2. **Authorization Check**: Throws an error if no user ID is found, indicating unauthorized access.
3. **Data Validation**: Validates the input data against the `eventSchema`.
4. **User Retrieval**: Fetches the user from the database using the Clerk user ID.
5. **User Existence Check**: Throws an error if the user is not found in the database.
6. **Event Creation**: Creates a new event in the database with the validated data and the user's ID.
7. **Return Event**: Returns the newly created event.

#### `getUserEvents()`
1. **Authentication**: Retrieves the current user's ID using the `auth()` function.
2. **Authorization Check**: Throws an error if no user ID is found, indicating unauthorized access.
3. **User Retrieval**: Fetches the user from the database using the Clerk user ID.
4. **User Existence Check**: Throws an error if the user is not found in the database.
5. **Events Query**: Queries the database for events created by the user, ordered by creation date in descending order.
6. **Data Inclusion**: Includes a count of bookings for each event.
7. **Return Data**: Returns the list of events and the user's username.

#### `deleteEvent(eventId)`
1. **Authentication**: Retrieves the current user's ID using the `auth()` function.
2. **Authorization Check**: Throws an error if no user ID is found, indicating unauthorized access.
3. **User Retrieval**: Fetches the user from the database using the Clerk user ID.
4. **User Existence Check**: Throws an error if the user is not found in the database.
5. **Event Retrieval**: Fetches the event from the database by its ID.
6. **Ownership Check**: Throws an error if the event is not found or the user is not authorized to delete it.
7. **Event Deletion**: Deletes the event from the database.
8. **Return Success**: Returns a success response if the deletion is successful.

#### `getEventDetails(username, eventId)`
1. **Event Query**: Fetches an event from the database by its ID and the associated user's username.
2. **Data Inclusion**: Includes user details such as name, email, image URL, and username.
3. **Return Data**: Returns the event details.

#### `getEventAvailability(eventId)`
1. **Event Retrieval**: Fetches the event from the database by its ID, including user availability and bookings.
2. **Availability Check**: Returns an empty array if the event or user availability is not found.
3. **Date Range Setup**: Sets the start date to the current day and the end date to 30 days later.
4. **Availability Calculation**: Iterates over each day in the date range to calculate available time slots based on user availability and existing bookings.
5. **Return Data**: Returns a list of available dates and time slots.

#### `generateAvailableTimeSlots(startTime, endTime, duration, bookings, dateStr, timeGap)`
1. **Slot Initialization**: Initializes an empty array to store available time slots.
2. **Time Parsing**: Parses the start and end times with the given date.
3. **Current Time Adjustment**: Adjusts the start time if the current date matches today's date.
4. **Slot Generation**: Iterates over the time range to generate slots, checking for conflicts with existing bookings.
5. **Slot Availability Check**: Adds a slot to the list if it does not conflict with any existing booking.
6. **Return Slots**: Returns the list of available time slots.

### `actions/bookings.js`

#### `createBooking(bookingData)`
1. **Event Retrieval**: Fetches the event from the database by its ID, including user details.
2. **Event Existence Check**: Throws an error if the event is not found.
3. **Google Calendar Integration**: Retrieves the event creator's Google OAuth token to generate a meeting link.
4. **Token Check**: Throws an error if the event creator has not connected to Google Calendar.
5. **OAuth Client Setup**: Sets up a Google OAuth client with the retrieved token.
6. **Meeting Creation**: Uses the Google Calendar API to create a meeting, generating a Google Meet link.
7. **Database Insertion**: Inserts the booking details into the database, including the Google Meet link and event ID.
8. **Return Success**: Returns a success response with the booking details and meeting link.


