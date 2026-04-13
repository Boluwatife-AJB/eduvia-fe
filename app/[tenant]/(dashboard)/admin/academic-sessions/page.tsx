"use client";

import { useMemo, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import {
  PlusIcon,
  CaretDownIcon,
  CalendarBlankIcon,
  WarningCircleIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import AddAcademicSession from "@/components/school-admin/modal/add-academic-session";
import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AcademicSession } from "@/types";
import { format } from "date-fns";
import AddTerm from "@/components/school-admin/modal/add-term";
import { parseFormDate, toApiDateString } from "@/lib/utils";
import { toast } from "sonner";

/** `<input type="date">` only accepts `yyyy-MM-dd`. */
function toDateInputValue(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
}

function getTermProgress(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  if (now < start) return 0;
  if (now > end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

type SessionDraft = {
  name: string;
  startDate: string;
  endDate: string;
};

type TermDraft = {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

function buildSessionDraft(s: AcademicSession): SessionDraft {
  return {
    name: s.name,
    startDate: toDateInputValue(s.start_date),
    endDate: toDateInputValue(s.end_date),
  };
}

function buildTermsDraft(s: AcademicSession): Record<string, TermDraft> {
  return Object.fromEntries(
    s.terms.map((t) => [
      t.id,
      {
        name: t.name,
        startDate: toDateInputValue(t.start_date),
        endDate: toDateInputValue(t.end_date),
        isCurrent: t.is_current,
      },
    ]),
  );
}

function sessionMatchesServer(
  draft: SessionDraft | null,
  s: AcademicSession | null,
): boolean {
  if (!draft || !s) return true;
  return (
    draft.name.trim() === s.name &&
    toApiDateString(draft.startDate) ===
      toApiDateString(toDateInputValue(s.start_date)) &&
    toApiDateString(draft.endDate) ===
      toApiDateString(toDateInputValue(s.end_date))
  );
}

function termMatchesServer(
  draft: TermDraft | undefined,
  t: AcademicSession["terms"][number],
): boolean {
  if (!draft) return true;
  return (
    draft.name.trim() === t.name &&
    toApiDateString(draft.startDate) ===
      toApiDateString(toDateInputValue(t.start_date)) &&
    toApiDateString(draft.endDate) ===
      toApiDateString(toDateInputValue(t.end_date)) &&
    draft.isCurrent === t.is_current
  );
}

const fetchSessions = async (): Promise<AcademicSession[]> => {
  const response = await apiClient.get("/school-setup/academic-sessions");
  return response.data.data;
};

/** Remount editor when server-backed session or term rows change (avoids syncing drafts in an effect). */
function sessionEditorRemountKey(session: AcademicSession): string {
  const termSig = session.terms
    .map(
      (t) =>
        `${t.id}:${t.updated_at}:${t.name}:${t.start_date}:${t.end_date}:${t.is_current}`,
    )
    .join("|");
  return `${session.id}:${session.updated_at}:${session.name}:${session.start_date}:${session.end_date}:${session.is_current}:${termSig}`;
}

type AcademicSessionEditorPanelProps = {
  session: AcademicSession;
  selectedTermId: string | null;
  onAddTerm: () => void;
  onRequestDeleteSession: () => void;
  onRequestSetCurrentSession: () => void;
  onRequestDeleteTerm: (term: { id: string; name: string }) => void;
};

function AcademicSessionEditorPanel({
  session,
  selectedTermId,
  onAddTerm,
  onRequestDeleteSession,
  onRequestSetCurrentSession,
  onRequestDeleteTerm,
}: AcademicSessionEditorPanelProps) {
  const queryClient = useQueryClient();
  const [sessionDraft, setSessionDraft] = useState(() =>
    buildSessionDraft(session),
  );
  const [termsDraft, setTermsDraft] = useState(() => buildTermsDraft(session));

  const isDirty = useMemo(() => {
    if (!sessionMatchesServer(sessionDraft, session)) return true;
    return session.terms.some((t) => !termMatchesServer(termsDraft[t.id], t));
  }, [session, sessionDraft, termsDraft]);

  const canSave =
    sessionDraft.name.trim().length > 0 &&
    !!sessionDraft.startDate &&
    !!sessionDraft.endDate &&
    session.terms.every((t) => {
      const d = termsDraft[t.id];
      return d && d.name.trim().length > 0 && !!d.startDate && !!d.endDate;
    });

  const setCurrentTermMutation = useMutation({
    mutationFn: async (termId: string) => {
      await apiClient.patch(`/school-setup/terms/${termId}/set-current`);
    },
    onSuccess: () => {
      toast.success("Current term updated");
      queryClient.invalidateQueries({ queryKey: ["academic-sessions"] });
    },
    onError: () => {
      toast.error("Could not set the current term. Try again.");
    },
  });

  const saveChangesMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/school-setup/academic-sessions/${session.id}`, {
        name: sessionDraft.name.trim(),
        start_date: toApiDateString(sessionDraft.startDate),
        end_date: toApiDateString(sessionDraft.endDate),
      });

      for (const term of session.terms) {
        const draft = termsDraft[term.id];
        if (!draft) continue;
        if (termMatchesServer(draft, term)) continue;
        await apiClient.patch(`/school-setup/terms/${term.id}`, {
          name: draft.name.trim(),
          start_date: toApiDateString(draft.startDate),
          end_date: toApiDateString(draft.endDate),
          is_current: draft.isCurrent,
        });
      }
    },
    onSuccess: () => {
      toast.success("Changes saved");
      queryClient.invalidateQueries({ queryKey: ["academic-sessions"] });
    },
    onError: () => {
      toast.error("Could not save changes. Try again.");
    },
  });

  const handleDiscard = () => {
    setSessionDraft(buildSessionDraft(session));
    setTermsDraft(buildTermsDraft(session));
  };

  const updateTermCurrent = (termId: string, checked: boolean) => {
    setTermsDraft((prev) => {
      const next = { ...prev };
      if (checked) {
        for (const id of Object.keys(next)) {
          next[id] = { ...next[id], isCurrent: id === termId };
        }
      } else {
        const cur = next[termId];
        if (cur) next[termId] = { ...cur, isCurrent: false };
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between gap-4 shrink-0 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-2xl font-bold font-assistant text-card-foreground truncate">
              {sessionDraft.name || session.name}
            </h2>
            {session.is_current ? (
              <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 shadow-none shrink-0">
                Active Session
              </Badge>
            ) : (
              <Badge variant="secondary" className="shrink-0">
                Inactive
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <CalendarBlankIcon className="size-4 shrink-0" />
            Modify schedules and terms for this session.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="h-11"
            onClick={onRequestDeleteSession}
          >
            <TrashSimpleIcon className="size-4" />
            Delete session
          </Button>
          {!session.is_current && (
            <Button
              variant="primary"
              size="lg"
              className="h-11 px-6 shadow-md shadow-primary/20 transition-all hover:scale-105"
              onClick={onRequestSetCurrentSession}
            >
              Set as Current
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            Session Configuration
          </h3>
          <div className="max-w-2xl space-y-4">
            <Field>
              <FieldLabel>Session Name</FieldLabel>
              <Input
                value={sessionDraft.name}
                onChange={(e) =>
                  setSessionDraft((d) => ({ ...d, name: e.target.value }))
                }
                className="h-10 text-base shadow-sm"
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Start Date</FieldLabel>
                <Input
                  type="date"
                  value={sessionDraft.startDate}
                  onChange={(e) =>
                    setSessionDraft((d) => ({
                      ...d,
                      startDate: e.target.value,
                    }))
                  }
                  className="h-10"
                />
              </Field>
              <Field>
                <FieldLabel>End Date</FieldLabel>
                <Input
                  type="date"
                  value={sessionDraft.endDate}
                  onChange={(e) =>
                    setSessionDraft((d) => ({ ...d, endDate: e.target.value }))
                  }
                  className="h-10"
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              Academic Terms
            </h3>
            <Button
              variant="primary-outline"
              className="h-10 gap-2"
              onClick={onAddTerm}
            >
              <PlusIcon className="size-4" />
              Add Term
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {session.terms.map((term) => {
              const draft = termsDraft[term.id];
              if (!draft) return null;
              return (
                <div
                  key={term.id}
                  className={`p-5 rounded-xl border transition-all ${
                    selectedTermId === term.id
                      ? "border-primary ring-1 ring-primary/20 shadow-sm bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      <Field className="gap-1.5">
                        <FieldLabel>Term name</FieldLabel>
                        <Input
                          value={draft.name}
                          onChange={(e) =>
                            setTermsDraft((prev) => ({
                              ...prev,
                              [term.id]: {
                                ...prev[term.id]!,
                                name: e.target.value,
                              },
                            }))
                          }
                          className="h-10 font-semibold text-base"
                        />
                      </Field>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {term.is_current && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shadow-none">
                          Current term
                        </Badge>
                      )}
                      {!term.is_current && (
                        <Button
                          type="button"
                          variant="primary-outline"
                          size="sm"
                          className="h-9 gap-2"
                          disabled={setCurrentTermMutation.isPending}
                          onClick={() => setCurrentTermMutation.mutate(term.id)}
                        >
                          {setCurrentTermMutation.isPending ? (
                            <Spinner className="size-4" />
                          ) : null}
                          Set as current term
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="shrink-0"
                        aria-label={`Delete ${term.name}`}
                        onClick={() =>
                          onRequestDeleteTerm({
                            id: term.id,
                            name: term.name,
                          })
                        }
                      >
                        <TrashSimpleIcon className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 pb-4 border-b border-border/60">
                    <Field
                      orientation="horizontal"
                      className="flex flex-row items-center gap-3"
                    >
                      <FieldLabel
                        htmlFor={`term-current-${term.id}`}
                        className="text-sm font-medium mb-0"
                      >
                        Mark as current (save to apply)
                      </FieldLabel>
                      <Switch
                        id={`term-current-${term.id}`}
                        checked={draft.isCurrent}
                        onCheckedChange={(checked) =>
                          updateTermCurrent(term.id, checked)
                        }
                        className="data-checked:bg-primary-blue data-checked:text-white"
                      />
                    </Field>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Schedule
                    </h4>
                    <Badge variant="outline" className="font-mono text-xs">
                      {(() => {
                        const s = parseFormDate(draft.startDate);
                        const e = parseFormDate(draft.endDate);
                        return s && e
                          ? `${format(s, "dd/MM/yyyy")} to ${format(e, "dd/MM/yyyy")}`
                          : `${format(new Date(term.start_date), "dd/MM/yyyy")} to ${format(new Date(term.end_date), "dd/MM/yyyy")}`;
                      })()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Start Date</FieldLabel>
                      <Input
                        type="date"
                        value={draft.startDate}
                        onChange={(e) =>
                          setTermsDraft((prev) => ({
                            ...prev,
                            [term.id]: {
                              ...prev[term.id]!,
                              startDate: e.target.value,
                            },
                          }))
                        }
                        className="h-10"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>End Date</FieldLabel>
                      <Input
                        type="date"
                        value={draft.endDate}
                        onChange={(e) =>
                          setTermsDraft((prev) => ({
                            ...prev,
                            [term.id]: {
                              ...prev[term.id]!,
                              endDate: e.target.value,
                            },
                          }))
                        }
                        className="h-10"
                      />
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border bg-card flex justify-end gap-3 shrink-0 flex-wrap">
        <Button
          variant="outline"
          type="button"
          disabled={!isDirty || saveChangesMutation.isPending}
          onClick={handleDiscard}
        >
          Discard Changes
        </Button>
        <Button
          variant="primary"
          type="button"
          className="gap-2"
          disabled={!isDirty || !canSave || saveChangesMutation.isPending}
          onClick={() => saveChangesMutation.mutate()}
        >
          {saveChangesMutation.isPending ? (
            <>
              <Spinner className="size-4" />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AcademicSessions() {
  const queryClient = useQueryClient();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null,
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAddAcademicSessionOpen, setIsAddAcademicSessionOpen] =
    useState(false);
  const [isAddTermOpen, setIsAddTermOpen] = useState(false);

  const [sessionToDelete, setSessionToDelete] =
    useState<AcademicSession | null>(null);
  const [termToDelete, setTermToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: academicSessions } = useQuery({
    queryKey: ["academic-sessions"],
    queryFn: fetchSessions,
  });

  const selectedSession = useMemo(
    () => academicSessions?.find((s) => s.id === selectedSessionId) ?? null,
    [academicSessions, selectedSessionId],
  );

  const setCurrentSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiClient.patch(
        `/school-setup/academic-sessions/${sessionId}/set-current`,
      );
    },
    onSuccess: () => {
      toast.success("Active academic session updated");
      setIsConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ["academic-sessions"] });
    },
    onError: () => {
      toast.error("Could not set the active session. Try again.");
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiClient.delete(`/school-setup/academic-sessions/${sessionId}`);
    },
    onSuccess: (_, sessionId) => {
      toast.success("Academic session deleted");
      queryClient.invalidateQueries({ queryKey: ["academic-sessions"] });
      setSessionToDelete(null);
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
        setExpandedSessionId(null);
        setSelectedTermId(null);
      }
    },
    onError: () => {
      toast.error("Could not delete this session. Try again.");
    },
  });

  const deleteTermMutation = useMutation({
    mutationFn: async (termId: string) => {
      await apiClient.delete(`/school-setup/terms/${termId}`);
    },
    onSuccess: (_, termId) => {
      toast.success("Term deleted");
      queryClient.invalidateQueries({ queryKey: ["academic-sessions"] });
      setTermToDelete(null);
      if (selectedTermId === termId) {
        setSelectedTermId(null);
      }
    },
    onError: () => {
      toast.error("Could not delete this term. Try again.");
    },
  });

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
    setCurrentSessionMutation.mutate(selectedSession.id);
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
            {academicSessions?.map((session) => {
              const isExpanded = expandedSessionId === session.id;

              return (
                <div key={session.id} className="relative pl-6">
                  {/* Timeline Node */}
                  <div className="absolute -left-[11px] top-4 size-5 rounded-full border-4 border-background flex items-center justify-center bg-card shadow-sm z-10 transition-colors">
                    <div
                      className={`size-2.5 rounded-full ${
                        session.is_current
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
                        {session.is_current && (
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
                            term.start_date,
                            term.end_date,
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
                                  {new Date(term.start_date).toLocaleDateString(
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
            <AcademicSessionEditorPanel
              key={sessionEditorRemountKey(selectedSession)}
              session={selectedSession}
              selectedTermId={selectedTermId}
              onAddTerm={() => setIsAddTermOpen(true)}
              onRequestDeleteSession={() => setSessionToDelete(selectedSession)}
              onRequestSetCurrentSession={() => setIsConfirmOpen(true)}
              onRequestDeleteTerm={(t) => setTermToDelete(t)}
            />
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
              className="h-11 gap-2 px-6 shadow-md"
              disabled={setCurrentSessionMutation.isPending}
              onClick={handleSetCurrentSession}
            >
              {setCurrentSessionMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Updating…
                </>
              ) : (
                "Confirm Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={sessionToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setSessionToDelete(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <TrashSimpleIcon weight="bold" className="size-4" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete academic session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {sessionToDelete?.name}
              </span>{" "}
              and all of its terms. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSessionMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteSessionMutation.isPending}
              onClick={() => {
                if (sessionToDelete) {
                  deleteSessionMutation.mutate(sessionToDelete.id);
                }
              }}
            >
              {deleteSessionMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={termToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTermToDelete(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <TrashSimpleIcon weight="bold" className="size-4" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete term?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {termToDelete?.name}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTermMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteTermMutation.isPending}
              onClick={() => {
                if (termToDelete) {
                  deleteTermMutation.mutate(termToDelete.id);
                }
              }}
            >
              {deleteTermMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddAcademicSession
        isOpen={isAddAcademicSessionOpen}
        onClose={() => setIsAddAcademicSessionOpen(false)}
      />
      {selectedSessionId && (
        <AddTerm
          isOpen={isAddTermOpen}
          onClose={() => setIsAddTermOpen(false)}
          academicSessionId={selectedSessionId}
        />
      )}
    </div>
  );
}
