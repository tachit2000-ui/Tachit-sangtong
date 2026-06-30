import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// List of high-profile popular fixtures to choose from
const POPULAR_FIXTURES = [
  { id: "f1", homeTeam: "Liverpool", awayTeam: "Real Madrid", league: "UEFA Champions League" },
  { id: "f2", homeTeam: "Manchester City", awayTeam: "Arsenal", league: "English Premier League" },
  { id: "f3", homeTeam: "Buriram United", awayTeam: "Muangthong United", league: "Thai League 1" },
  { id: "f4", homeTeam: "Real Madrid", awayTeam: "Barcelona", league: "La Liga" },
  { id: "f5", homeTeam: "Bayern Munich", awayTeam: "Borussia Dortmund", league: "Bundesliga" },
  { id: "f6", homeTeam: "Thailand", awayTeam: "Vietnam", league: "AFF Championship" },
];

// Helper to hash team names to generate consistent stats in fallback mode
function getTeamSeed(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Math generator for 1X2 using a simulated Poisson Distribution
function generatePoissonAnalysis(homeTeam: string, awayTeam: string, league: string) {
  const homeSeed = getTeamSeed(homeTeam);
  const awaySeed = getTeamSeed(awayTeam);

  // Derive reasonable ratings based on team seeds
  const homeAttack = 1.2 + (homeSeed % 15) / 10; // 1.2 to 2.7
  const homeDefense = 0.8 + (homeSeed % 10) / 10; // 0.8 to 1.8
  const awayAttack = 1.0 + (awaySeed % 15) / 10; // 1.0 to 2.5
  const awayDefense = 0.9 + (awaySeed % 10) / 10; // 0.9 to 1.9

  // Calculate expected goals (lambda)
  // Home advantage of +15% to attack, and -10% to opponent defense
  const homeLambda = Math.max(0.5, homeAttack * 1.15 * (awayDefense * 0.9));
  const awayLambda = Math.max(0.5, awayAttack * 0.9 * (homeDefense * 1.1));

  // Poisson probability calculation helper
  const poisson = (k: number, lambda: number) => {
    const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  };

  // Build grid of score probabilities up to 6 goals
  const grid: number[][] = [];
  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;

  for (let h = 0; h <= 6; h++) {
    grid[h] = [];
    for (let a = 0; a <= 6; a++) {
      const pHome = poisson(h, homeLambda);
      const pAway = poisson(a, awayLambda);
      const pScore = pHome * pAway;
      grid[h][a] = pScore;

      if (h > a) homeWinProb += pScore;
      else if (h === a) drawProb += pScore;
      else awayWinProb += pScore;
    }
  }

  // Normalize probabilities to 100%
  const totalProb = homeWinProb + drawProb + awayWinProb;
  const homeWinPct = Math.round((homeWinProb / totalProb) * 1000) / 10;
  const drawPct = Math.round((drawProb / totalProb) * 1000) / 10;
  const awayWinPct = Math.round((1 - (homeWinPct + drawPct) / 100) * 1000) / 10;

  // Generate H2H matches dynamically
  const opponents = ["Chelsea", "Man Utd", "Tottenham", "Juventus", "PSG", "Inter Milan", "AC Milan", "Aston Villa", "Newcastle", "Porto"];
  const h2h = Array.from({ length: 5 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (i + 1) * 75);
    const dateStr = date.toISOString().split("T")[0];
    
    // Seed H2H scores
    const hSeed = (homeSeed + awaySeed + i) % 5;
    const aSeed = (homeSeed * 2 + awaySeed + i) % 5;
    const homeScore = Math.max(0, hSeed % 3);
    const awayScore = Math.max(0, aSeed % 3);
    
    return {
      date: dateStr,
      homeScore,
      awayScore,
      winner: homeScore > awayScore ? "home" : homeScore < awayScore ? "away" : "draw",
      competition: league || "Club Friendly"
    };
  });

  // Recent Form (last 5)
  const resultsOptions = ["W", "D", "L"];
  const homeForm = Array.from({ length: 5 }).map((_, i) => {
    const rIndex = (homeSeed + i) % 3;
    const result = resultsOptions[rIndex];
    let score = "1-1";
    if (result === "W") score = `${2 + (i % 2)}-${i % 2}`;
    if (result === "L") score = `${i % 2}-${2 + (i % 2)}`;
    return {
      opponent: opponents[(homeSeed + i) % opponents.length],
      score,
      isHome: i % 2 === 0,
      result
    };
  });

  const awayForm = Array.from({ length: 5 }).map((_, i) => {
    const rIndex = (awaySeed + i) % 3;
    const result = resultsOptions[rIndex];
    let score = "1-1";
    if (result === "W") score = `${1 + (i % 2)}-${i % 2}`;
    if (result === "L") score = `${i % 2}-${2 + (i % 2)}`;
    return {
      opponent: opponents[(awaySeed + i) % opponents.length],
      score,
      isHome: i % 2 === 0,
      result
    };
  });

  // Key stats averages
  const homeAvgGoalsScored = Math.round(homeLambda * 10) / 10;
  const homeAvgGoalsConceded = Math.round(homeDefense * 1.1 * 10) / 10;
  const awayAvgGoalsScored = Math.round(awayLambda * 10) / 10;
  const awayAvgGoalsConceded = Math.round(awayDefense * 1.2 * 10) / 10;

  const homeCleanSheets = (homeSeed % 3);
  const awayCleanSheets = (awaySeed % 2);

  const homeOver25Pct = 40 + (homeSeed % 5) * 10;
  const awayOver25Pct = 30 + (awaySeed % 6) * 10;

  // Predict score
  const homePred = Math.round(homeLambda);
  const awayPred = Math.round(awayLambda);

  return {
    homeTeam,
    awayTeam,
    league: league || "ลีกยอดนิยม",
    h2h,
    homeForm,
    awayForm,
    stats: {
      homeAvgGoalsScored,
      homeAvgGoalsConceded,
      awayAvgGoalsScored,
      awayAvgGoalsConceded,
      homeCleanSheets,
      awayCleanSheets,
      homeOver25Pct,
      awayOver25Pct
    },
    probabilities: {
      homeWin: homeWinPct,
      draw: drawPct,
      awayWin: awayWinPct
    },
    aiAnalysis: {
      tactics: `ทีมเจ้าบ้าน (${homeTeam}) เน้นการขึ้นเกมทางปีกและครองบอลเป็นหลัก ขณะที่ทีมเยือน (${awayTeam}) จะเน้นตั้งรับลึกและโต้กลับเร็ว โดยสถิติจำลองระบุความสามารถเกมรุกเฉลี่ยของเจ้าบ้านที่ ${homeAvgGoalsScored} ประตูต่อนัด ชนกับแนวรับทีมเยือนที่เสียเฉลี่ย ${awayAvgGoalsConceded} ประตูต่อนัด`,
      keyPlayers: "ทั้งสองทีมมีผู้เล่นตัวหลักลงครบครัน ไม่มีรายงานอาการบาดเจ็บของนักเตะคีย์แมนสำคัญ ทำให้แมตช์นี้จะสู้กันด้วยแผนการเล่นอย่างแท้จริง",
      verdict: `จากอัตราต่อรอง 1X2 ที่คำนวณผ่านโมเดลการกระจายตัวแบบปัวซง (Poisson Distribution) คาดว่าเกมนี้เจ้าบ้านมีโอกาสเปิดเกมรุกเข้าใส่และเบียดเอาชนะไปได้ด้วยโอกาสชนะสูงถึง ${homeWinPct}%`,
      predictedScore: `${homePred}-${awayPred}`
    },
    isAiGenerated: false
  };
}

// Lazy Gemini API Client Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API Endpoints
app.get("/api/fixtures", (req, res) => {
  res.json(POPULAR_FIXTURES);
});

app.post("/api/analyze", async (req, res) => {
  const { homeTeam, awayTeam, league = "General Football League" } = req.body;

  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: "กรุณาระบุทีมเจ้าบ้านและทีมเยือน" });
  }

  const client = getGeminiClient();
  if (!client) {
    // Graceful fallback to math-based engine if Gemini key is missing
    console.log("No Gemini API key configured. Using local mathematical 1X2 simulation.");
    const fallbackData = generatePoissonAnalysis(homeTeam, awayTeam, league);
    return res.json({
      ...fallbackData,
      note: "สถิตินี้คำนวณโดยแบบจำลองคณิตศาสตร์ Poisson (ตั้งค่า Gemini API เพื่อรับบทวิเคราะห์แผนการเล่นจาก AI แบบละเอียด)"
    });
  }

  try {
    const prompt = `You are an expert football statistician and professional bookmaker compiler.
Analyze the football match: "${homeTeam}" vs "${awayTeam}" in the league "${league}".
Please provide realistic historical results and form data based on their real-world standing or current status as of mid-2026.
Calculate accurate 1X2 probabilities (Home Win, Draw, Away Win in percentage, totaling exactly 100%) based on their relative team strengths, recent form, and home advantage.

Return the data strictly structured according to the responseSchema in JSON format.
Ensure all written explanations inside 'aiAnalysis' are written in professional, easy-to-read Thai language.
Ensure that probabilities total exactly 100 (e.g. homeWin: 45.2, draw: 26.5, awayWin: 28.3).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            homeTeam: { type: Type.STRING },
            awayTeam: { type: Type.STRING },
            league: { type: Type.STRING },
            h2h: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: "YYYY-MM-DD" },
                  homeScore: { type: Type.INTEGER },
                  awayScore: { type: Type.INTEGER },
                  winner: { type: Type.STRING, description: "home, away, or draw" },
                  competition: { type: Type.STRING }
                },
                required: ["date", "homeScore", "awayScore", "winner"]
              }
            },
            homeForm: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  opponent: { type: Type.STRING },
                  score: { type: Type.STRING },
                  isHome: { type: Type.BOOLEAN },
                  result: { type: Type.STRING, description: "W, D, or L" }
                },
                required: ["opponent", "score", "isHome", "result"]
              }
            },
            awayForm: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  opponent: { type: Type.STRING },
                  score: { type: Type.STRING },
                  isHome: { type: Type.BOOLEAN },
                  result: { type: Type.STRING, description: "W, D, or L" }
                },
                required: ["opponent", "score", "isHome", "result"]
              }
            },
            stats: {
              type: Type.OBJECT,
              properties: {
                homeAvgGoalsScored: { type: Type.NUMBER },
                homeAvgGoalsConceded: { type: Type.NUMBER },
                awayAvgGoalsScored: { type: Type.NUMBER },
                awayAvgGoalsConceded: { type: Type.NUMBER },
                homeCleanSheets: { type: Type.INTEGER, description: "Out of last 5 matches" },
                awayCleanSheets: { type: Type.INTEGER, description: "Out of last 5 matches" },
                homeOver25Pct: { type: Type.NUMBER, description: "Percentage of matches with > 2.5 goals" },
                awayOver25Pct: { type: Type.NUMBER, description: "Percentage of matches with > 2.5 goals" }
              },
              required: [
                "homeAvgGoalsScored", "homeAvgGoalsConceded", 
                "awayAvgGoalsScored", "awayAvgGoalsConceded", 
                "homeCleanSheets", "awayCleanSheets", 
                "homeOver25Pct", "awayOver25Pct"
              ]
            },
            probabilities: {
              type: Type.OBJECT,
              properties: {
                homeWin: { type: Type.NUMBER, description: "Home win probability percentage e.g. 45.5" },
                draw: { type: Type.NUMBER, description: "Draw probability percentage e.g. 26.5" },
                awayWin: { type: Type.NUMBER, description: "Away win probability percentage e.g. 28.0" }
              },
              required: ["homeWin", "draw", "awayWin"]
            },
            aiAnalysis: {
              type: Type.OBJECT,
              properties: {
                tactics: { type: Type.STRING, description: "Tactical match-up analysis in Thai" },
                keyPlayers: { type: Type.STRING, description: "Injuries, key players to watch, or squad notes in Thai" },
                verdict: { type: Type.STRING, description: "Final analysis summary, recommended 1X2 pick, and reason in Thai" },
                predictedScore: { type: Type.STRING, description: "Predicted exact scoreline e.g. '2-1'" }
              },
              required: ["tactics", "keyPlayers", "verdict", "predictedScore"]
            }
          },
          required: [
            "homeTeam", "awayTeam", "league", "h2h", 
            "homeForm", "awayForm", "stats", "probabilities", "aiAnalysis"
          ]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const data = JSON.parse(response.text.trim());
    return res.json({
      ...data,
      isAiGenerated: true
    });
  } catch (error: any) {
    console.error("Gemini analysis error, falling back to math model:", error);
    const fallbackData = generatePoissonAnalysis(homeTeam, awayTeam, league);
    return res.json({
      ...fallbackData,
      note: "เกิดข้อผิดพลาดในการดึงข้อมูล AI จึงแสดงผลด้วยสถิติจำลองคณิตศาสตร์ปัวซงแทนชั่วคราว"
    });
  }
});

// Configure Vite or Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
