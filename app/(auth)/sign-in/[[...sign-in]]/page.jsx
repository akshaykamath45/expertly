import React from "react";
import { SignIn } from "@clerk/nextjs";
const Page = () => {
  return (
    <div>
      <SignIn path="/sign-in" routing="path" redirectUrl="/dashboard" />
    </div>
  );
};

export default Page;
