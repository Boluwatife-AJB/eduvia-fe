import type { AssessmentDetails, CreateAssessmentFormValues } from "@/types";
import { format, parseISO } from "date-fns";

type AssessmentDetailsApi = AssessmentDetails & {
  shuffle_options?: boolean;
  prevent_tab_switch?: boolean;
};

function isoToFormDate(iso: string): string {
  try {
    return format(parseISO(iso), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

function isoToFormTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return "";
  }
}

function primaryTeacherId(details: AssessmentDetails): string {
  const fromTeacher = details.teacher?.[0]?.id;
  if (fromTeacher) return fromTeacher;
  const raw = details.teacher_id as unknown;
  if (
    Array.isArray(raw) &&
    raw[0] &&
    typeof raw[0] === "object" &&
    "id" in raw[0]
  ) {
    return String((raw[0] as { id: string }).id);
  }
  if (typeof raw === "string") return raw;
  return "";
}

export function assessmentDetailsToFormValues(
  details: AssessmentDetails,
): CreateAssessmentFormValues {
  const d = details as AssessmentDetailsApi;
  const sortedQuestions = [...details.assessmentQuestions].sort(
    (a, b) => a.order - b.order,
  );

  return {
    title: details.title,
    instructions: details.instructions,
    type: details.type as CreateAssessmentFormValues["type"],
    classId: details.class_id,
    subjectId: details.subject_id,
    teacherId: primaryTeacherId(details),
    termId: details.term_id,
    startDate: isoToFormDate(details.start_time),
    endDate: isoToFormDate(details.end_time),
    startTime: isoToFormTime(details.start_time),
    endTime: isoToFormTime(details.end_time),
    durationMins: details.duration_mins,
    passMark: details.pass_mark,
    isExamComponent: details.is_exam_component,
    caComponent:
      details.ca_component as CreateAssessmentFormValues["caComponent"],
    maxAttempts: details.max_attempts,
    shuffleQuestions: details.shuffle_questions,
    shuffleOptions: d.shuffle_options ?? false,
    preventTabSwitch: d.prevent_tab_switch ?? true,
    questions: sortedQuestions.map((q) => ({
      type: q.type as CreateAssessmentFormValues["questions"][number]["type"],
      questionText: q.question_text,
      questionImage: q.question_image ?? "",
      marks: q.marks,
      options: (q.options ?? []).map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.is_correct,
      })),
      correctAnswer: q.correct_answer ?? "",
      acceptedAnswers: Array.isArray(q.accepted_answers)
        ? [...q.accepted_answers]
        : [],
      markingGuide: q.marking_guide ?? "",
      maxWordCount: q.max_word_count ?? 0,
    })) as CreateAssessmentFormValues["questions"],
  };
}
