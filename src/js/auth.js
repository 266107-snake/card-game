import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, signOut } from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase.js";

export function listenToAuth(callback) {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function loginWithGoogle() {
  if (!isFirebaseConfigured) throw new Error("Firebase 환경 변수가 설정되지 않았습니다.");
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function loginAnonymously() {
  if (!isFirebaseConfigured) throw new Error("Firebase 환경 변수가 설정되지 않았습니다.");
  return signInAnonymously(auth);
}

export async function logout() {
  if (!isFirebaseConfigured) return;
  await signOut(auth);
}
