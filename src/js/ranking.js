import { loadRanking } from "./storage.js";

export async function getRankingSafe() {
  try {
    return await loadRanking();
  } catch (error) {
    console.warn("랭킹을 불러오지 못했습니다.", error);
    return [];
  }
}
