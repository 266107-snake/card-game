import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase.js";

const STORAGE_KEY = "number-card-combo:v1";

const defaultStats = {
  records: [],
  bestScore: null,
  worstScore: null,
  playCount: 0,
  neonUnlocked: false,
  selectedSkin: "classic",
};

export function loadLocalStats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultStats, ...parsed };
  } catch {
    return { ...defaultStats };
  }
}

export function saveLocalStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function addLocalRecord(record) {
  const stats = loadLocalStats();
  const records = [record, ...stats.records].slice(0, 20);
  const scores = records.map((item) => item.finalScore);
  const nextStats = {
    ...stats,
    records,
    bestScore: Math.max(...scores),
    worstScore: Math.min(...scores),
    playCount: stats.playCount + (record.endedRound > 0 ? 1 : 0),
  };
  nextStats.neonUnlocked = nextStats.playCount >= 5;
  saveLocalStats(nextStats);
  return nextStats;
}

export async function loadUserStats(user) {
  const localStats = loadLocalStats();
  if (!isFirebaseConfigured || !user) return localStats;

  const snapshot = await getDoc(doc(db, "users", user.uid));
  return snapshot.exists() ? { ...defaultStats, ...snapshot.data() } : localStats;
}

export async function saveRecord(record, user) {
  const localStats = addLocalRecord(record);
  if (!isFirebaseConfigured || !user) return localStats;

  const userRef = doc(db, "users", user.uid);
  const recordRef = doc(collection(db, "users", user.uid, "records"), record.id);
  const publicRankRef = doc(db, "rankings", user.uid);

  await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    const current = userSnapshot.exists() ? { ...defaultStats, ...userSnapshot.data() } : { ...defaultStats };
    const records = [record, ...(current.records || [])].slice(0, 20);
    const scores = records.map((item) => item.finalScore);
    const playCount = (current.playCount || 0) + (record.endedRound > 0 ? 1 : 0);
    const nextStats = {
      records,
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      playCount,
      neonUnlocked: playCount >= 5,
      selectedSkin: record.skin,
      updatedAt: serverTimestamp(),
    };

    transaction.set(userRef, nextStats, { merge: true });
    transaction.set(recordRef, { ...record, createdAt: serverTimestamp() });
    transaction.set(publicRankRef, {
      uid: user.uid,
      displayName: user.displayName || "익명 플레이어",
      bestScore: nextStats.bestScore,
      worstScore: nextStats.worstScore,
      playCount,
      updatedAt: serverTimestamp(),
    });
  });

  return loadUserStats(user);
}

export async function loadRanking() {
  if (!isFirebaseConfigured) return [];
  const rankingQuery = query(collection(db, "rankings"), orderBy("bestScore", "desc"), limit(20));
  const snapshot = await getDocs(rankingQuery);
  return snapshot.docs.map((item) => item.data());
}

export async function ensureUserDocument(user) {
  if (!isFirebaseConfigured || !user) return;
  await setDoc(
    doc(db, "users", user.uid),
    {
      displayName: user.displayName || "익명 플레이어",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
