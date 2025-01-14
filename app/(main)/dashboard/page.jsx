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

const Dashboard = () => {
  const { isLoaded, user } = useUser();
  console.log(user);
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

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {`${user?.firstName}`}</CardTitle>
        </CardHeader>
        {/* Latest Updates */}
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
