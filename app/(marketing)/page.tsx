"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">
        Eduvia
        <span className="text-accent-amber text-4xl font-black">.</span>
      </h1>
      <p className="text-lg text-gray-500">The Path of Education</p>
      {/* <Button render={<Link href="/onboarding">Get Started</Link>}>
        Get Started
      </Button> */}
      <Button>
        <Link href="/onboarding">Get Started</Link>
      </Button>
      {/* Can't find your school? Search for it */}
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-lg text-gray-500">
          Can&apos;t find your school? Search for it
        </p>
        <Input type="text" placeholder="Search for your school" />
      </div>
    </main>
  );
}
