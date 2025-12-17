import { GoogleGenAI } from "@google/genai";
import { Athlete, Match } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMatchup = async (
  team1: Athlete[],
  team2: Athlete[],
  history: Match[]
): Promise<string> => {
  try {
    const formatPlayer = (p: Athlete) => `${p.name} (Hạng ${getRankFromPoints(p.points)}, ${p.points} điểm)`;
    
    const team1Str = team1.map(formatPlayer).join(" & ");
    const team2Str = team2.map(formatPlayer).join(" & ");

    const prompt = `
      Bạn là một huấn luyện viên bóng bàn chuyên nghiệp.
      Hãy phân tích trận đấu sắp tới giữa:
      Đội 1: ${team1Str}
      Đội 2: ${team2Str}
      
      Dựa trên điểm số và hạng của họ (Hạng A là cao nhất, H là thấp nhất), hãy đưa ra:
      1. Dự đoán đội nào có ưu thế hơn.
      2. Chiến thuật khuyên dùng cho đội yếu hơn để giành chiến thắng.
      3. Tỉ lệ thắng dự kiến (%).
      
      Trả lời ngắn gọn, súc tích bằng tiếng Việt.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Không thể phân tích dữ liệu lúc này.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Hệ thống AI đang bận, vui lòng thử lại sau.";
  }
};

// Helper function duplicated here to avoid circular dependency if imported from utils
const getRankFromPoints = (points: number): string => {
  if (points >= 1000) return 'A';
  if (points >= 900) return 'B';
  if (points >= 700) return 'C';
  if (points >= 600) return 'D';
  if (points >= 500) return 'E';
  if (points >= 400) return 'F';
  if (points >= 300) return 'G';
  return 'H';
};
