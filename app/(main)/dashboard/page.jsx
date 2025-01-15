"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usernameSchema } from "@/app/lib/validators";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import { updateUsername } from "@/actions/users";
import { BarLoader } from "react-spinners";
import { getLatestUpdates } from "@/actions/dashboard";
import { format } from "date-fns";

const Dashboard = () => {
  const { isLoaded, user } = useUser();
  //   console.log(user);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(usernameSchema),
  });

  // by default username
  useEffect(() => {
    setValue("username", user?.username);
  }, [isLoaded]);

  const { loading, error, fn: fnUpdateUsername } = useFetch(updateUsername);
  const onSubmit = async (data) => {
    if (!data.username) {
      console.error("Username is required.");
      return;
    }
    await fnUpdateUsername(data.username);
  };

  const {
    loading: loadingUpdates,
    data: upcomingMeetings,
    fn: fnUpdates,
  } = useFetch(getLatestUpdates);

  useEffect(() => {
    (async () => await fnUpdates())();
  }, []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {`${user?.firstName}`}</CardTitle>
        </CardHeader>
        <CardContent>
          {!loadingUpdates ? (
            <div>
              {upcomingMeetings && upcomingMeetings.length > 0 ? (
                <ul>
                  {upcomingMeetings.map((meeting) => {
                    return (
                      <li key={meeting.id}>
                        - {meeting.event.title} on{" "}
                        {format(
                          new Date(meeting.startTime),
                          "MMM d, yyyy h:mm a"
                        )}{" "}
                        with {meeting.name}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No upcoming meetings</p>
              )}
            </div>
          ) : (
            <p>Loading updates...</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Unique Link</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <div className="flex items-center gap-2">
                <span>{window?.location.origin}/</span>
                <Input {...register("username")} placeholder="username" />
              </div>

              {/* for hook form */}
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}

              {/* for api */}
              {error && (
                <p className="text-red-500 text-sm mt-1">{error?.message}</p>
              )}
            </div>
            {loading && <BarLoader className="mb-4" width={"100%"} />}
            <Button type="submit">Update username</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
