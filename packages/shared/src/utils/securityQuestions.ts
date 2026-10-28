import type { SecurityQuestionAnswer, SecurityQuestionLists, SecurityQuestionsForm, SelectOption } from "../types";

/** "12-What is your…" → { value: "12", label: "What is your…" } */
export const mapSecurityQuestions = (questions: string[] = []): SelectOption[] =>
  questions.map((q) => {
    const i = q.indexOf("-");
    return { value: q.slice(0, i), label: q.slice(i + 1).trim() };
  });

export const toQuestionOptions = (lists: SecurityQuestionLists | null) => [
  mapSecurityQuestions(lists?.SQ1),
  mapSecurityQuestions(lists?.SQ2),
  mapSecurityQuestions(lists?.SQ3),
  mapSecurityQuestions(lists?.SQ4),
];

export const ANSWER_FIELDS = ["answer1", "answer2", "answer3", "answer4"] as const;

export const toSecurityAnswers = (v: SecurityQuestionsForm): SecurityQuestionAnswer[] =>
  ([1, 2, 3, 4] as const).map((i) => ({
    questionId: v[`ques${i}`],
    answer: v[`answer${i}`].trim(),
  }));
