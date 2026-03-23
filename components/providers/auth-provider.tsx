"use client";

import { testimonials } from "@/lib/data";
import { QuotesIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 2) % testimonials.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const current = testimonials[activeIndex] ?? testimonials[0];

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <aside className="hidden md:flex md:w-4/10 bg-accent-navy text-white flex-col justify-between p-12 relative">
        {/* Geometric Pattern */}
        <div className="geometric-circle w-[600px] h-[600px] -top-40 -left-40"></div>
        <div className="geometric-circle w-[500px] h-[500px] top-1/4 -right-20"></div>
        <div className="geometric-circle w-[700px] h-[700px] -bottom-60 -left-20"></div>

        {/* Top: Branding */}
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-baseline gap-1">
            <h1 className="text-5xl font-bold">Eduvia</h1>
            <span className="text-accent-gold text-3xl font-black">.</span>
          </div>
          <p className="text-accent-gold text-lg font-medium">
            The Path of Education
          </p>
        </div>

        {/* Rotating Testimonials Simulation (Bottom) */}
        <div className="flex flex-col gap-8 z-10">
          {/* Quote Block */}
          <div className="flex flex-col gap-6">
            <QuotesIcon size={48} weight="fill" className="text-accent-gold" />
            <blockquote className="text-lg leading-relaxed italic font-mono">
              {current.quote}
            </blockquote>
          </div>

          {/* Author Card */}
          <div className="flex items-center gap-4">
            <Avatar className="size-12">
              <AvatarImage src={current.avatarUrl} alt={current.author} />
              <AvatarFallback>{current.author.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="font-semibold text-base">{current.author}</p>
              <p className="text-sm text-white/70">{current.title}</p>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-3 pt-4">
            <div className="flex gap-2 flex-1">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-colors ${
                    index === activeIndex ? "bg-accent w-6" : "bg-[#1E3A5F] w-2"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
      <main className="w-full md:w-6/10 bg-background overflow-y-auto">
        <div className="min-h-screen flex flex-col justify-center items-center px-6 md:px-12 py-8 md:py-0">
          <div className="w-full max-w-lg">{children}</div>

          {/* Footer */}
          <footer className="absolute bottom-6 md:bottom-8 text-center text-xs text-muted-foreground">
            <span>Powered by </span>
            <span className="font-semibold text-accent-navy">Eduvia</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
