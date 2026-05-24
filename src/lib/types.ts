export type VideoSource =
  | { kind: "youtube"; url: string }
  | { kind: "storage"; path: string };

export interface Lesson {
  id: string;
  order: number;
  title: { kk: string; ru: string };
  description: { kk: string; ru: string };
  video?: VideoSource;
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  text: { kk: string; ru: string };
  options: Array<{ kk: string; ru: string }>;
  correctIndex: number;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
  createdAt: number;
  createdBy: "manual" | "agentic";
}

export interface QuizAttempt {
  id: string;
  userId: string;
  lessonId: string;
  quizId: string;
  answers: number[];
  score: number;
  total: number;
  completedAt: number;
}

export interface UserDoc {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: number;
}
