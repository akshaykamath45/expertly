"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventForm from "./event-form";

export function CreateEventDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleClose = () => {
    setIsOpen(false);
    if (searchParams.get("create") === "true") {
      router.replace(window.location.pathname);
    }
  };
  useEffect(() => {
    const create = searchParams.get("create");
    if (create === "true") {
      setIsOpen(true);
    }
  }, [searchParams]);
  return (
    <Drawer open={isOpen} onClose={handleClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create new event</DrawerTitle>
        </DrawerHeader>
        <EventForm
          onSubmit={() => {
            handleClose();
          }}
        />
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default CreateEventDrawer;
