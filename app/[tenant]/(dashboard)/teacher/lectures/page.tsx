"use client";

import UploadLectureModal from "@/components/teacher/modal/upload-lecture";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

export default function Lectures() {
  const [isUploadLectureModalOpen, setIsUploadLectureModalOpen] =
    useState(false);

  const handleUploadLecture = () => {
    setIsUploadLectureModalOpen(true);
  };

  return (
    <div className="px-8 py-6 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-assistant font-bold">Lectures</h1>

        <Button
          variant="primary"
          className="h-11 gap-2"
          onClick={handleUploadLecture}
        >
          <PlusIcon />
          Upload Lecture
        </Button>
      </div>

      <UploadLectureModal
        isOpen={isUploadLectureModalOpen}
        onClose={() => setIsUploadLectureModalOpen(false)}
      />
    </div>
  );
}
