import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  TrendingUp, 
  ChevronRight, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Zap, 
  Flame, 
  HelpCircle,
  RefreshCw,
  ServerCrash
} from "lucide-react";
import Header from "./components/Header";
import FixturesPanel from "./components/FixturesPanel";
import OddsCalculator from "./components/OddsCalculator";
import { Fixture, MatchAnalysisResult } from "./types";

export default function App() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [analysis, setAnalysis] = useState<MatchAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch presets on load
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const res = await fetch("/api/fixtures");
        if (!res.ok) throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงข้อมูลคู่เด่นได้");
        const data = await res.json();
        setFixtures(data);
        
        // Auto-select the first fixture to analyze
        if (data.length > 0) {
          handleSelectFixture(data[0]);
        }
      } catch (err: any) {
        console.error(err);
        setError("ไม่สามารถโหลดคู่แข่งขันยอดนิยมได้ กรุณาลองใหม่อีกครั้ง");
      }
    };
    fetchPresets();
  }, []);

  // Run analysis for a fixture
  const triggerAnalysis = async (home: string, away: string, league: string) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeTeam: home, awayTeam: away, league }),
      });

      if (!response.ok) {
        throw new Error("ข้อผิดพลาดจากระบบวิเคราะห์ผลบอล");
      }

      const result: MatchAnalysisResult = await response.json();
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError("เกิดข้อผิดพลาดขณะวิเคราะห์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFixture = (fixture: Fixture) => {
    setSelectedFixture(fixture);
    triggerAnalysis(fixture.homeTeam, fixture.awayTeam, fixture.league);
  };

  const handleAnalyzeCustom = (home: string, away: string, league: string) => {
    setSelectedFixture(null); // Clear selected preset if custom search used
    triggerAnalysis(home, away, league);
  };

  // Get result class for form circles
  const getResultBadgeClass = (res: "W" | "D" | "L") => {
    if (res === "W") return "bg-emerald-500 text-white border-emerald-400";
    if (res === "D") return "bg-slate-700 text-slate-200 border-slate-600";
    return "bg-rose-500 text-white border-rose-400";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Dynamic Header */}
      <Header isAiMode={!!analysis?.isAiGenerated} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: CONTROL & SETTINGS (4 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Preset Fixtures and Custom inputs */}
          <FixturesPanel
            fixtures={fixtures}
            selectedFixtureId={selectedFixture?.id || null}
            onSelectFixture={handleSelectFixture}
            onAnalyzeCustom={handleAnalyzeCustom}
            isLoading={isLoading}
          />

          {/* Odds & Value Bet Calculator */}
          {analysis && (
            <OddsCalculator
              probabilities={analysis.probabilities}
              homeTeam={analysis.homeTeam}
              awayTeam={analysis.awayTeam}
            />
          )}
        </div>

        {/* RIGHT COLUMN: MAIN ANALYTICS DASHBOARD (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-2xl flex items-start gap-3">
              <ServerCrash className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">ขออภัย เกิดข้อผิดพลาดทางเทคนิค</h4>
                <p className="text-xs text-rose-400/80 mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* LOADING STATE PLACEHOLDER */}
          {isLoading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
              <div className="relative flex items-center justify-center">
                <RefreshCw className="h-10 w-10 text-emerald-400 animate-spin" />
                <Sparkles className="h-5 w-5 text-emerald-300 absolute animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">กำลังคำนวณสถิติ & ประมวลผล AI Model...</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                  แบบจำลองกำลังดึงข้อมูล Head-to-Head, ผลการแข่งขัน 5 นัดล่าสุด, นำเข้าสถิติยิงประตูเฉลี่ย และจัดทำกราฟความน่าจะเป็น 1X2 แบบปัวซง
                </p>
              </div>
            </div>
          )}

          {/* ACTIVE ANALYTICAL DASHBOARD SCREEN */}
          {!isLoading && analysis && (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              {/* 1. MATCH HEADLINE CARD */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                    LIVE METRIC
                  </span>
                </div>

                <div className="text-xs font-semibold text-emerald-400 tracking-wide uppercase mb-4">
                  {analysis.league}
                </div>

                {/* Matchup Layout */}
                <div className="flex items-center justify-between gap-4 py-2">
                  {/* Home Team */}
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <span className="text-xs text-slate-400 block mb-1">เจ้าบ้าน / HOME</span>
                    <span className="text-lg sm:text-xl font-extrabold text-white truncate block">
                      {analysis.homeTeam}
                    </span>
                  </div>

                  {/* Versus / Score prediction */}
                  <div className="shrink-0 flex flex-col items-center px-4 py-2 bg-slate-800/40 rounded-xl border border-slate-800 font-mono">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">สกอร์ที่คาด</span>
                    <span className="text-2xl font-black text-emerald-400 tracking-wide">
                      {analysis.aiAnalysis.predictedScore || "VS"}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 text-center sm:text-right min-w-0">
                    <span className="text-xs text-slate-400 block mb-1">ทีมเยือน / AWAY</span>
                    <span className="text-lg sm:text-xl font-extrabold text-white truncate block">
                      {analysis.awayTeam}
                    </span>
                  </div>
                </div>

                {/* Notification Banner / Fallback Indicator */}
                {analysis.note && (
                  <div className="mt-4 bg-slate-800/50 border border-slate-700/50 p-2.5 rounded-lg text-[11px] text-slate-400 leading-relaxed">
                    ℹ️ {analysis.note}
                  </div>
                )}
              </div>

              {/* 2. 1X2 CHANCE DISTRIBUTION (THE CORE ALGORITHM VISUALIZATION) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5 font-mono">
                    <TrendingUp className="h-4 w-4" />
                    โอกาสเกิดผลการแข่งขัน 1X2 (%)
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    รวมความน่าจะเป็น {Math.round(analysis.probabilities.homeWin + analysis.probabilities.draw + analysis.probabilities.awayWin)}%
                  </span>
                </div>

                {/* Visual Bar Breakdown */}
                <div className="flex h-10 w-full rounded-xl overflow-hidden border border-slate-950 shadow-inner mb-4">
                  {/* Home Win Segment */}
                  <div 
                    style={{ width: `${analysis.probabilities.homeWin}%` }}
                    className="bg-emerald-500 hover:opacity-90 transition-opacity flex items-center justify-center font-bold text-xs text-slate-950 font-mono"
                    title={`เจ้าบ้านชนะ: ${analysis.probabilities.homeWin}%`}
                  >
                    {analysis.probabilities.homeWin >= 15 && `${analysis.probabilities.homeWin}%`}
                  </div>

                  {/* Draw Segment */}
                  <div 
                    style={{ width: `${analysis.probabilities.draw}%` }}
                    className="bg-slate-600 hover:opacity-90 transition-opacity flex items-center justify-center font-bold text-xs text-white font-mono"
                    title={`เสมอ: ${analysis.probabilities.draw}%`}
                  >
                    {analysis.probabilities.draw >= 15 && `${analysis.probabilities.draw}%`}
                  </div>

                  {/* Away Win Segment */}
                  <div 
                    style={{ width: `${analysis.probabilities.awayWin}%` }}
                    className="bg-rose-500 hover:opacity-90 transition-opacity flex items-center justify-center font-bold text-xs text-slate-950 font-mono"
                    title={`ทีมเยือนชนะ: ${analysis.probabilities.awayWin}%`}
                  >
                    {analysis.probabilities.awayWin >= 15 && `${analysis.probabilities.awayWin}%`}
                  </div>
                </div>

                {/* Labels and Detailed Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Home */}
                  <div className="text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider mb-1">
                      เจ้าบ้านชนะ (1)
                    </div>
                    <div className="text-xl font-black text-emerald-400 font-mono">
                      {analysis.probabilities.homeWin}%
                    </div>
                  </div>

                  {/* Draw */}
                  <div className="text-center p-3 rounded-xl bg-slate-800/20 border border-slate-700/10">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      ผลเสมอ (X)
                    </div>
                    <div className="text-xl font-black text-white font-mono">
                      {analysis.probabilities.draw}%
                    </div>
                  </div>

                  {/* Away */}
                  <div className="text-center p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <div className="text-[10px] text-rose-400/80 font-bold uppercase tracking-wider mb-1">
                      ทีมเยือนชนะ (2)
                    </div>
                    <div className="text-xl font-black text-rose-500 font-mono">
                      {analysis.probabilities.awayWin}%
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. CORE STATISTICS COMPARISON */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-semibold tracking-wider text-emerald-400 uppercase mb-4 font-mono">
                  สถิติตัวเลขเฉลี่ยเชิงลึก (Key Stats)
                </h3>

                <div className="flex flex-col gap-4">
                  {/* Goals Scored Stat Row */}
                  <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800/50">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-mono">{analysis.stats.homeAvgGoalsScored} ประตู/นัด</span>
                      <span className="text-white font-medium">เฉลี่ยประตูที่ทำได้ (Goals Scored)</span>
                      <span className="font-mono text-right">{analysis.stats.awayAvgGoalsScored} ประตู/นัด</span>
                    </div>
                    <div className="flex items-center gap-2 h-2.5">
                      <div className="w-1/2 bg-slate-800 rounded-full h-full overflow-hidden flex justify-end">
                        <div 
                          style={{ width: `${Math.min(100, (analysis.stats.homeAvgGoalsScored / 3) * 100)}%` }} 
                          className="bg-emerald-500 h-full rounded-full" 
                        />
                      </div>
                      <div className="w-1/2 bg-slate-800 rounded-full h-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, (analysis.stats.awayAvgGoalsScored / 3) * 100)}%` }} 
                          className="bg-rose-500 h-full rounded-full" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Goals Conceded Stat Row */}
                  <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800/50">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-mono">{analysis.stats.homeAvgGoalsConceded} ประตู/นัด</span>
                      <span className="text-white font-medium">เฉลี่ยประตูที่เสีย (Goals Conceded)</span>
                      <span className="font-mono text-right">{analysis.stats.awayAvgGoalsConceded} ประตู/นัด</span>
                    </div>
                    <div className="flex items-center gap-2 h-2.5">
                      <div className="w-1/2 bg-slate-800 rounded-full h-full overflow-hidden flex justify-end">
                        <div 
                          style={{ width: `${Math.min(100, (analysis.stats.homeAvgGoalsConceded / 3) * 100)}%` }} 
                          className="bg-emerald-500/60 h-full rounded-full" 
                        />
                      </div>
                      <div className="w-1/2 bg-slate-800 rounded-full h-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, (analysis.stats.awayAvgGoalsConceded / 3) * 100)}%` }} 
                          className="bg-rose-500/60 h-full rounded-full" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mini cards for Clean Sheets & Over 2.5 */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Clean Sheets */}
                    <div className="bg-slate-800/20 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono mb-1">คลีนชีต 5 นัดหลัง</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-base font-bold text-emerald-400">{analysis.stats.homeCleanSheets} นัด</span>
                        <span className="text-xs text-slate-500">vs</span>
                        <span className="text-base font-bold text-rose-400">{analysis.stats.awayCleanSheets} นัด</span>
                      </div>
                    </div>

                    {/* Over 2.5 Matches */}
                    <div className="bg-slate-800/20 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono mb-1">สกอร์รวมสูงกว่า 2.5 (%)</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-base font-bold text-emerald-400">{analysis.stats.homeOver25Pct}%</span>
                        <span className="text-xs text-slate-500">vs</span>
                        <span className="text-base font-bold text-rose-400">{analysis.stats.awayOver25Pct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. RECENT FORM & H2H ENGINES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 5-Match Form Indicators */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
                  <h3 className="text-sm font-semibold tracking-wider text-emerald-400 uppercase mb-4 font-mono">
                    ฟอร์มการเล่น 5 นัดล่าสุด
                  </h3>
                  
                  <div className="flex flex-col gap-4 flex-1 justify-center">
                    {/* Home Form */}
                    <div>
                      <div className="text-xs font-semibold text-slate-300 mb-2 truncate">
                        {analysis.homeTeam}
                      </div>
                      <div className="flex gap-2">
                        {analysis.homeForm.map((m, index) => (
                          <div
                            key={index}
                            title={`${m.isHome ? "เหย้า" : "เยือน"} ${m.result === "W" ? "ชนะ" : m.result === "D" ? "เสมอ" : "แพ้"} ${m.opponent} (${m.score})`}
                            className={`flex-1 h-8 rounded-lg flex items-center justify-center font-bold text-xs border cursor-help transition-all hover:scale-105 ${getResultBadgeClass(m.result)}`}
                          >
                            {m.result}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Away Form */}
                    <div>
                      <div className="text-xs font-semibold text-slate-300 mb-2 truncate">
                        {analysis.awayTeam}
                      </div>
                      <div className="flex gap-2">
                        {analysis.awayForm.map((m, index) => (
                          <div
                            key={index}
                            title={`${m.isHome ? "เหย้า" : "เยือน"} ${m.result === "W" ? "ชนะ" : m.result === "D" ? "เสมอ" : "แพ้"} ${m.opponent} (${m.score})`}
                            className={`flex-1 h-8 rounded-lg flex items-center justify-center font-bold text-xs border cursor-help transition-all hover:scale-105 ${getResultBadgeClass(m.result)}`}
                          >
                            {m.result}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Head-to-Head (H2H) Match History */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-semibold tracking-wider text-emerald-400 uppercase mb-3.5 font-mono">
                    สถิติการพบกันย้อนหลัง (H2H)
                  </h3>

                  <div className="flex flex-col gap-2 max-h-[145px] overflow-y-auto pr-1">
                    {analysis.h2h.map((match, i) => {
                      let colorClass = "bg-slate-800/40 border-slate-800";
                      if (match.winner === "home") colorClass = "bg-emerald-500/5 border-emerald-500/10";
                      if (match.winner === "away") colorClass = "bg-rose-500/5 border-rose-500/10";
                      
                      return (
                        <div 
                          key={i} 
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${colorClass}`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200">
                              {match.homeScore} - {match.awayScore}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {match.date} • {match.competition}
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                              match.winner === "home" 
                                ? "bg-emerald-500/10 text-emerald-400" 
                                : match.winner === "away" 
                                ? "bg-rose-500/10 text-rose-400" 
                                : "bg-slate-800 text-slate-400"
                            }`}>
                              {match.winner === "home" ? "Home W" : match.winner === "away" ? "Away W" : "Draw"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 5. AI PROFESSIONAL ANALYTICS REPORT */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                  <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
                    <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wider uppercase">
                      บทวิเคราะห์เชิงยุทธวิธีจาก AI (Tactical Report)
                    </h3>
                    <p className="text-[10px] text-emerald-400">
                      สังเคราะห์ข้อมูลประเด็นสำคัญ สภาพทีม และสรุปฟันธง
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Tactics Panel */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                    <h4 className="text-xs font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5 uppercase font-mono">
                      <Zap className="h-3.5 w-3.5" />
                      แผนการเล่น & ยุทธวิธีคีย์หลัก
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {analysis.aiAnalysis.tactics}
                    </p>
                  </div>

                  {/* Key Players */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                    <h4 className="text-xs font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5 uppercase font-mono">
                      <Activity className="h-3.5 w-3.5" />
                      สภาพความพร้อม & ตัวผู้เล่นสำคัญ
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {analysis.aiAnalysis.keyPlayers}
                    </p>
                  </div>

                  {/* Verdict */}
                  <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                    <h4 className="text-xs font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5 uppercase font-mono">
                      <Flame className="h-3.5 w-3.5" />
                      สรุปฟันธง (1X2 Verdict)
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {analysis.aiAnalysis.verdict}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* EMPTY INITIAL STATE */}
          {!isLoading && !analysis && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
              <Trophy className="h-12 w-12 text-slate-600 animate-pulse" />
              <div>
                <h3 className="text-base font-semibold text-white">พร้อมวิเคราะห์โอกาสชนะแบบเรียลไทม์</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                  กรุณาเลือกแมตช์ยอดนิยมทางซ้ายมือ หรือป้อนชื่อทีมวิเคราะห์ตามความประสงค์ เพื่อดึงข้อมูลและประเมินสถิติ 1X2 ทันที
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} 1X2 Football Analyst. พัฒนาขึ้นเพื่อวัตถุประสงค์ในการวิเคราะห์เชิงสถิติกีฬาเท่านั้น</p>
          <p className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>ระบบวิเคราะห์แบบเรียลไทม์ ออนไลน์</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
