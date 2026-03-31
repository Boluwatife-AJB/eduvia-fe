"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  ArrowLeftIcon,
  PencilLineIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

const fetchStudent = async (id: string) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data.data;
};

const tabs = [
  {
    name: "Explore",
    value: "explore",
    content: (
      <>
        Discover{" "}
        <span className="text-foreground font-semibold">fresh ideas</span>,
        trending topics, and hidden gems curated just for you. Start exploring
        and let your curiosity lead the way!
      </>
    ),
  },
  {
    name: "Favorites",
    value: "favorites",
    content: (
      <>
        All your{" "}
        <span className="text-foreground font-semibold">favorites</span> are
        saved here. Revisit articles, collections, and moments you love, any
        time you want a little inspiration.
      </>
    ),
  },
  {
    name: "Surprise Me",
    value: "surprise",
    content: (
      <>
        <span className="text-foreground font-semibold">Surprise!</span>{" "}
        Here&apos;s something unexpected—a fun fact, a quirky tip, or a daily
        challenge. Come back for a new surprise every day!
      </>
    ),
  },
];

export default function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("explore");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const { data: student, isLoading: isStudentLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: () => fetchStudent(id),
  });

  console.log(student);

  useLayoutEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;

      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTab]);

  const styles = {
    ACTIVE:
      "bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5",
    INACTIVE:
      "bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive",
    SUSPENDED:
      "bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5",
    PENDING:
      "bg-yellow-600/10 text-yellow-600 focus-visible:ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5",
  };

  return (
    <div className="container mx-auto px-8 py-6 space-y-10">
      <h1
        className="text-3xl font-assistant font-bold flex items-center gap-2 cursor-pointer"
        onClick={() => router.back()}
      >
        <ArrowLeftIcon className="size-4" />
        <span>Student Details</span>
      </h1>

      {/* Student Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-40 border-2 border-primary-blue">
                <AvatarImage src={student?.avatar ?? ""} />
                <AvatarFallback>
                  {student?.first_name.charAt(0).toUpperCase()}
                  {student?.last_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-12 mb-2">
                  <h2 className="text-3xl font-semibold ">
                    {student?.first_name} {student?.last_name}
                  </h2>

                  <Badge
                    className={cn(
                      "border-none focus-visible:outline-none py-1 px-2 text-sm",
                      styles[student?.status as keyof typeof styles],
                    )}
                  >
                    {student?.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono space-x-1 flex items-center mb-1">
                  <span>STUDENT</span>
                  <span className="size-2 bg-muted-foreground rounded-full"></span>
                  <span className="font-mono">{student?.identifier}</span>
                </p>
                <p className="text-sm text-muted-foreground font-mono space-x-1 flex items-center">
                  <span>CLASS:</span>
                  <span className="font-mono">
                    SS1 Gold
                    {/* {student?.student_profile.class.name} */}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="primary" size="lg" className="h-12 px-4">
                <PencilLineIcon className="size-4" />
                <span>Edit Student</span>
              </Button>
              <Button variant="destructive" size="lg" className="h-12 px-4">
                <TrashSimpleIcon className="size-4" />
                <span>Delete Student</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Cards */}
      <div className="grid grid-cols-5 gap-4">
        {/* Personal Information Card */}
        <Card className="col-span-3 py-0!">
          <CardContent className="p-6 flex items-center justify-between ">
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                PERSONAL INFORMATION
              </span>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-mono">
                    Email
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {/* {student?.email} */}
                    adetayoadelabu@greenfieldacademy.edu.ng
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-mono">
                    Phone
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {/* {student?.phone} */}
                    +2348061234567
                  </p>
                </div>
              </div>
            </div>
            <Separator className="my-4" orientation="vertical" />
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                ACADEMIC INFORMATION
              </span>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-mono">
                    Class
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {/* {student?.student_profile.class.name} */}
                    SS1 Gold
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-mono">
                    Level
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {/* {student?.student_profile.class.level} */}
                    SS1
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Information Card */}
        <Card className="col-span-2 py-0!">
          <CardContent className="p-6">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              SECURITY INFORMATION
            </span>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground font-mono">
                  MFA Enabled
                </p>
                <p className="text-sm text-muted-foreground">
                  {student?.mfa_enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground font-mono">
                  Last Login
                </p>
                <p className="text-sm text-muted-foreground">
                  {student?.last_login_at
                    ? new Date(student.last_login_at).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList className="bg-background relative rounded-none border-b p-0">
          {tabs.map((tab, index) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              className="bg-background dark:data-[state=active]:bg-background relative z-10 rounded-none border-0 data-[state=active]:shadow-none!"
            >
              {tab.name}
            </TabsTrigger>
          ))}

          <motion.div
            className="bg-primary absolute bottom-0 z-20 h-0.5"
            layoutId="underline"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
            }}
          />
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <p className="text-muted-foreground text-sm">{tab.content}</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
