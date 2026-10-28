import type { TrendProfile } from "./types";

const display: Record<string, { title: string; english: string }> = {
  security: { title: "Ăn chắc mặc bền", english: "Saver" },
  experience: { title: "Cái gì vui vẻ thì mình ưu tiên", english: "Spender" },
  avoidance: { title: "Mắt không thấy, tim không đau", english: "Avoider" },
  control: { title: "Giấy trắng mực đen", english: "Controller" },
  independence: { title: "Tự túc là hạnh phúc", english: "Independent" },
  "security-control": { title: "Cẩn tắc vô áy náy", english: "Saver × Controller" },
  "security-experience": { title: "Nhạc nào cũng nhảy", english: "Saver × Spender" },
  "security-avoidance": { title: "Lo xa ngại va", english: "Saver × Avoider" },
  "security-independence": { title: "Tự lực tự cường", english: "Saver × Independent" },
  "experience-control": { title: "Vui chơi có tổ chức", english: "Controller × Spender" },
  "control-independence": { title: "Chuyện nào ra chuyện nấy", english: "Controller × Independent" },
  "avoidance-control": { title: "Lạt mềm buộc chặt", english: "Controller × Avoider" },
  "experience-independence": { title: "Mình thích thì mình chi thôi", english: "Spender × Independent" },
  "experience-avoidance": { title: "Một điều nhịn bằng chín điều lành", english: "Spender × Avoider" },
  "avoidance-independence": { title: "Thân ai nấy quản", english: "Independent × Avoider" },
};

export const trendCoinAssets: Record<string, string> = {
  security: "c6be4.png",
  experience: "e5666.png",
  avoidance: "b17d3.png",
  control: "9b284.png",
  independence: "05e32.png",
};

export const figmaTrendOrder = Object.keys(display);

export function trendDisplay(trend: Pick<TrendProfile, "key" | "title" | "tagline">) {
  return display[trend.key] ?? { title: trend.title, english: trend.tagline };
}
