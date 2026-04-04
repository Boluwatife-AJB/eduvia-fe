"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  PlusIcon,
  CaretDownIcon,
  CalendarBlankIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import AddAcademicSession from "@/components/school-admin/modal/add-academic-session";

type TermInfo = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type SessionInfo = {
  id: string;
  name: string;
  isActive: boolean;
  terms: TermInfo[];
};

const INITIAL_SESSIONS: SessionInfo[] = [
  {
    id: "sess_1",
    name: "2024/2025 Academic Session",
    isActive: true,
    terms: [
      {
        id: "term_1",
        name: "First Term",
        startDate: "2024-09-09",
        endDate: "2024-12-13",
      },
      {
        id: "term_2",
        name: "Second Term",
        startDate: "2025-01-06",
        endDate: "2025-04-11",
      },
      {
        id: "term_3",
        name: "Third Term",
        startDate: "2025-04-28",
        endDate: "2025-07-25",
      },
    ],
  },
  {
    id: "sess_2",
    name: "2025/2026 Academic Session",
    isActive: false,
    terms: [
      {
        id: "term_4",
        name: "First Term",
        startDate: "2025-09-08",
        endDate: "2025-12-12",
      },
      {
        id: "term_5",
        name: "Second Term",
        startDate: "2026-01-05",
        endDate: "2026-04-10",
      },
      {
        id: "term_6",
        name: "Third Term",
        startDate: "2026-04-27",
        endDate: "2026-07-24",
      },
    ],
  },
];

function getTermProgress(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  if (now < start) return 0;
  if (now > end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export default function AcademicSessions() {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    "sess_1",
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    "sess_1",
  );
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAddAcademicSessionOpen, setIsAddAcademicSessionOpen] =
    useState(false);

  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) || null;

  const handleTermClick = (sessionId: string, termId: string) => {
    setExpandedSessionId(sessionId);
    setSelectedSessionId(sessionId);
    setSelectedTermId(termId);
  };

  const handleSessionClick = (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
    } else {
      setExpandedSessionId(sessionId);
    }
    setSelectedSessionId(sessionId);
    setSelectedTermId(null);
  };

  const handleSetCurrentSession = () => {
    if (!selectedSession) return;
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        isActive: s.id === selectedSession.id,
      })),
    );
    setIsConfirmOpen(false);
  };

  return (
    <div className="px-8 pt-6 pb-4 h-[calc(100vh-64px)] flex flex-col space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-assistant font-bold">
            Academic Sessions
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Manage academic sessions, terms, and their schedules.
          </p>
        </div>
        <Button
          variant="primary"
          className="h-12 gap-2"
          onClick={() => setIsAddAcademicSessionOpen(true)}
        >
          <PlusIcon className="size-4" />
          Create Session
        </Button>
      </div>

      <div className="flex-1 min-h-0 flex gap-8 pb-4">
        {/* Left Panel - 35% */}
        <div className="w-[35%] flex flex-col overflow-y-auto pr-4 custom-scrollbar h-full">
          <div className="relative border-l-2 border-muted ml-4 mb-4 space-y-8 pb-4">
            {sessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;

              return (
                <div key={session.id} className="relative pl-6">
                  {/* Timeline Node */}
                  <div className="absolute -left-[11px] top-4 size-5 rounded-full border-4 border-background flex items-center justify-center bg-card shadow-sm z-10 transition-colors">
                    <div
                      className={`size-2.5 rounded-full ${
                        session.isActive
                          ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  </div>

                  <div
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      selectedSessionId === session.id
                        ? "border-primary ring-1 ring-primary/20 shadow-md"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <button
                      onClick={() => handleSessionClick(session.id)}
                      className={`w-full flex items-center justify-between p-4 transition-colors ${
                        selectedSessionId === session.id
                          ? "bg-primary/5"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="font-semibold text-[15px]">
                          {session.name}
                        </span>
                        {session.isActive && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-500/20 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div
                        className={`transition-transform duration-200 text-muted-foreground ${
                          isExpanded ? "rotate-180 text-foreground" : ""
                        }`}
                      >
                        <CaretDownIcon className="size-5" />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 pt-0 border-t border-border flex flex-col gap-2 bg-muted/10">
                        <div className="h-2" />
                        {session.terms.map((term) => {
                          const progress = getTermProgress(
                            term.startDate,
                            term.endDate,
                          );
                          const isTermSelected = selectedTermId === term.id;
                          return (
                            <div
                              key={term.id}
                              className={`p-3 rounded-lg border text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                                isTermSelected
                                  ? "border-primary bg-background shadow-sm"
                                  : "border-border/50 bg-background hover:border-primary/40"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTermClick(session.id, term.id);
                              }}
                            >
                              <div className="flex justify-between items-center mb-2.5 gap-2">
                                <span
                                  className={`font-medium text-sm ${
                                    isTermSelected ? "text-primary" : ""
                                  }`}
                                >
                                  {term.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                  {new Date(term.startDate).toLocaleDateString(
                                    undefined,
                                    { month: "short", day: "numeric" },
                                  )}
                                </span>
                              </div>
                              <Progress
                                value={progress}
                                className="h-1.5 w-full **:data-[slot=progress-indicator]:bg-primary"
                              />
                              <div className="flex justify-between items-center mt-1.5">
                                <span className="text-[10px] text-muted-foreground font-medium">
                                  {progress}% Completed
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - 65% */}
        <div className="w-[65%] flex flex-col bg-card rounded-xl border border-border shadow-sm h-full overflow-hidden">
          {selectedSession ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold font-assistant text-card-foreground">
                      {selectedSession.name}
                    </h2>
                    {selectedSession.isActive ? (
                      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 shadow-none">
                        Active Session
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <CalendarBlankIcon className="size-4" />
                    Modify schedules and terms for this session.
                  </p>
                </div>

                {!selectedSession.isActive && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="h-11 px-6 shadow-md shadow-primary/20 transition-all hover:scale-105"
                    onClick={() => setIsConfirmOpen(true)}
                  >
                    Set as Current
                  </Button>
                )}
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
                {/* Section for General Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    Session Configuration
                  </h3>
                  <div className="max-w-md">
                    <Field>
                      <FieldLabel>Session Name</FieldLabel>
                      <Input
                        defaultValue={selectedSession.name}
                        className="h-10 text-base shadow-sm"
                      />
                    </Field>
                  </div>
                </div>

                {/* Terms Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    Academic Terms
                  </h3>
                  <div className="grid grid-cols-1 gap-5">
                    {selectedSession.terms.map((term) => (
                      <div
                        key={term.id}
                        className={`p-5 rounded-xl border transition-all ${
                          selectedTermId === term.id
                            ? "border-primary ring-1 ring-primary/20 shadow-sm bg-primary/5"
                            : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-base">
                            {term.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {term.startDate} to {term.endDate}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel>Start Date</FieldLabel>
                            <Input
                              type="date"
                              defaultValue={term.startDate}
                              className="h-10"
                            />
                          </Field>
                          <Field>
                            <FieldLabel>End Date</FieldLabel>
                            <Input
                              type="date"
                              defaultValue={term.endDate}
                              className="h-10"
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-card flex justify-end gap-3 shrink-0">
                <Button variant="outline">Discard Changes</Button>
                <Button variant="primary">Save Changes</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-3">
              <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center">
                <CalendarBlankIcon className="size-8 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold">No Selection</h3>
              <p className="text-sm max-w-xs">
                Select a session from the timeline on the left to view and
                modify its details.
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="gap-3">
            <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-1">
              <WarningCircleIcon className="size-6 text-amber-600" />
            </div>
            <DialogTitle className="text-xl">
              Set as Current Session
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground leading-relaxed">
              Are you sure you want to set{" "}
              <strong className="text-foreground">
                {selectedSession?.name}
              </strong>{" "}
              as the active academic session? This will immediately update the
              dashboard context, active terms, and data views across the entire
              platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-3 mt-6">
            <DialogClose
              render={
                <Button type="button" variant="outline" className="h-11">
                  Cancel
                </Button>
              }
            />

            <Button
              type="button"
              variant="primary"
              className="h-11 px-6 shadow-md"
              onClick={handleSetCurrentSession}
            >
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddAcademicSession
        isOpen={isAddAcademicSessionOpen}
        onClose={() => setIsAddAcademicSessionOpen(false)}
      />
    </div>
  );
}
