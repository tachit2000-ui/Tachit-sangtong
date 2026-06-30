import React, { useState } from "react";
import { Fixture } from "../types";
import { Search, Compass, Swords, Loader2, AlertCircle } from "lucide-react";

interface FixturesPanelProps {
  fixtures: Fixture[];
  selectedFixtureId: string | null;
  onSelectFixture: (fixture: Fixture) => void;
  onAnalyzeCustom: (home: string, away: string, league: string) => void;
  isLoading: boolean;
}

export default function FixturesPanel({
  fixtures,
  selectedFixtureId,
  onSelectFixture,
  onAnalyzeCustom,
  isLoading,
}: FixturesPanelProps) {
  const [customHome, setCustomHome] = useState("");
  const [customAway, setCustomAway] = useState("");
  const [customLeague, setCustomLeague] = useState("English Premier League");
  const [error, setError] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customHome.trim() || !customAway.trim()) {
      setError("กรุณากรอกชื่อทีมเจ้าบ้านและทีมเยือนให้ครบถ้วน");
      return;
    }

    if (customHome.trim().toLowerCase() === customAway.trim().toLowerCase()) {
      setError("ชื่อทีมเจ้าบ้านและทีมเยือนห้ามเป็นทีมเดียวกัน");
      return;
    }

    onAnalyzeCustom(customHome.trim(), customAway.trim(), customLeague);
  };

  const leaguesList = [
    "English Premier League",
    "Thai League 1",
    "UEFA Champions League",
    "La Liga",
    "Serie A",
    "Bundesliga",
    "Ligue 1",
    "World Cup",
    "AFF Championship"
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      {/* SECTION 1: PRESET FIXTURES */}
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-emerald-400 uppercase mb-3 flex items-center gap-2">
          <Compass className="h-4 w-4" />
          วิเคราะห์คู่เด่นประจำสัปดาห์
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          คลิกคู่แข่งขันด้านล่าง เพื่อดึงสถิติย้อนหลัง H2H และคำนวณโอกาสชนะ 1X2 ทันที
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fixtures.map((fixture) => {
            const isSelected = selectedFixtureId === fixture.id;
            return (
              <button
                key={fixture.id}
                onClick={() => !isLoading && onSelectFixture(fixture)}
                disabled={isLoading}
                className={`group relative text-left p-3.5 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "bg-emerald-500/10 border-emerald-500/50 text-white"
                    : "bg-slate-800/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="text-[10px] text-slate-400 font-mono mb-1 group-hover:text-emerald-400 transition-colors">
                  {fixture.league}
                </div>
                <div className="flex items-center justify-between font-medium text-sm">
                  <span className="truncate max-w-[42%]">{fixture.homeTeam}</span>
                  <span className="text-[10px] text-slate-500 px-1 font-mono uppercase">VS</span>
                  <span className="truncate max-w-[42%] text-right">{fixture.awayTeam}</span>
                </div>
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* HORIZONTAL DIVIDER */}
      <div className="h-px bg-slate-800" />

      {/* SECTION 2: CUSTOM FIXTURE INPUT */}
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-emerald-400 uppercase mb-3 flex items-center gap-2">
          <Swords className="h-4 w-4" />
          ค้นหาคู่แข่งขัน / วิเคราะห์ทีมกำหนดเอง
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          ป้อนชื่อทีมคู่ใดก็ได้ในโลก เพื่อให้ AI และคณิตศาสตร์ Poisson ช่วยคำนวณโอกาสผลชนะ เสมอ แพ้
        </p>

        <form onSubmit={handleCustomSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Home Team Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ทีมเจ้าบ้าน (Home Team) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customHome}
                  onChange={(e) => setCustomHome(e.target.value)}
                  placeholder="เช่น Arsenal, บุรีรัมย์ ยูไนเต็ด"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Away Team Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ทีมเยือน (Away Team) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customAway}
                  onChange={(e) => setCustomAway(e.target.value)}
                  placeholder="เช่น Chelsea, เมืองทอง ยูไนเต็ด"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* League Select */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              เลือกรายการแข่งขัน (League / Cup)
            </label>
            <select
              value={customLeague}
              onChange={(e) => setCustomLeague(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              disabled={isLoading}
            >
              {leaguesList.map((lg) => (
                <option key={lg} value={lg}>
                  {lg}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/20 p-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white py-3 rounded-xl font-medium text-sm shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all duration-150 ${
              isLoading ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังดึงสถิติและประมวลผลโมเดล...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>วิเคราะห์ผลบอลและสถิติ 1X2</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
