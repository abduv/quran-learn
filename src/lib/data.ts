import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Lesson, Quiz, QuizAttempt, UserDoc } from "./types";

const lessonsCol = () => collection(db, "lessons");
const quizzesCol = () => collection(db, "quizzes");
const attemptsCol = () => collection(db, "attempts");
const usersCol = () => collection(db, "users");

export async function listLessons(): Promise<Lesson[]> {
  const q = query(lessonsCol(), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lesson, "id">) }));
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const snap = await getDoc(doc(db, "lessons", id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Lesson, "id">) }) : null;
}

export async function createLesson(data: Omit<Lesson, "id" | "createdAt">) {
  const ref = await addDoc(lessonsCol(), { ...data, createdAt: Date.now() });
  return ref.id;
}

export async function updateLesson(id: string, data: Partial<Lesson>) {
  await updateDoc(doc(db, "lessons", id), data);
}

export async function deleteLesson(id: string) {
  await deleteDoc(doc(db, "lessons", id));
}

export async function getQuizForLesson(lessonId: string): Promise<Quiz | null> {
  const q = query(quizzesCol(), where("lessonId", "==", lessonId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<Quiz, "id">) };
}

export async function upsertQuiz(quiz: Omit<Quiz, "id" | "createdAt">) {
  const existing = await getQuizForLesson(quiz.lessonId);
  if (existing) {
    await updateDoc(doc(db, "quizzes", existing.id), { ...quiz });
    return existing.id;
  }
  const ref = await addDoc(quizzesCol(), { ...quiz, createdAt: Date.now() });
  return ref.id;
}

export async function saveAttempt(attempt: Omit<QuizAttempt, "id">) {
  await addDoc(attemptsCol(), { ...attempt, savedAt: serverTimestamp() });
}

export async function getUserAttempts(userId: string): Promise<QuizAttempt[]> {
  const q = query(attemptsCol(), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuizAttempt, "id">) }));
}

export async function getAllAttempts(): Promise<QuizAttempt[]> {
  const snap = await getDocs(attemptsCol());
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuizAttempt, "id">) }));
}

export async function getAllUsers(): Promise<UserDoc[]> {
  const snap = await getDocs(usersCol());
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserDoc, "uid">) }));
}

export async function setUserDoc(uid: string, data: Partial<UserDoc>) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}
