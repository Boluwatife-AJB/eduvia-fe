"use client";

import AddStudent from "@/components/school-admin/modal/add-student";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "@phosphor-icons/react";

export default function Students() {
  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-assistant font-bold">Students</h1>

        <Dialog>
          <DialogTrigger
            render={
              <Button variant="primary" className="h-12 gap-2">
                <PlusIcon className="size-4" />
                Add Student
              </Button>
            }
          />
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl p-6">
            <AddStudent />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
