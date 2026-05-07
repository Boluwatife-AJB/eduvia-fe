import { localDateTimeToIso8601 } from "@/lib/utils";
import type { CreateAssessmentFormValues } from "@/types";

function normalizeAcceptedAnswersForApi(lines: string[] | undefined): string[] {
  return (lines ?? []).map((s) => s.trim()).filter((s) => s.length > 0);
}

/** Shared body for POST /assessments and PATCH /assessments/:id */
export function buildAssessmentApiPayload(data: CreateAssessmentFormValues) {
  return {
    title: data.title,
    instructions: data.instructions,
    type: data.type,
    class_id: data.classId,
    subject_id: data.subjectId,
    teacher_id: data.teacherId,
    term_id: data.termId,
    start_time: localDateTimeToIso8601(data.startDate, data.startTime),
    end_time: localDateTimeToIso8601(data.endDate, data.endTime),
    duration_mins: data.durationMins,
    pass_mark: data.passMark,
    is_exam_component: data.isExamComponent,
    ca_component: data.isExamComponent ? data.caComponent : null,
    max_attempts: data.maxAttempts,
    shuffle_questions: data.shuffleQuestions,
    shuffle_options: data.shuffleOptions,
    prevent_tab_switch: data.preventTabSwitch,
    questions: data.questions.map((question) => ({
      type: question.type,
      question_text: question.questionText,
      question_image: question.questionImage?.trim()
        ? question.questionImage.trim()
        : null,
      marks: question.marks,
      options: (question.options ?? []).map((option) => ({
        id: option.id,
        text: option.text,
        is_correct: option.isCorrect,
      })),
      correct_answer: question.correctAnswer ?? "",
      accepted_answers:
        question.type === "SHORT_ANSWER" ||
        question.type === "FILL_IN_THE_BLANK"
          ? normalizeAcceptedAnswersForApi(question.acceptedAnswers)
          : (question.acceptedAnswers ?? []),
      marking_guide: question.markingGuide || "",
      max_word_count: question.maxWordCount ?? 0,
    })),
  };
}
