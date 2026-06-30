import React, { useState, useEffect } from "react";
import { Trophy, Clock, Cpu, Calculator } from "lucide-react";

interface HeaderProps {
  isAiMode: boolean;
}

export default function Header({ isAiMode }: HeaderProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("th-TH", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              1X2 Football Analyst
              <span className="text-xs bg-emerald-500/10 text-emerald-400 font-normal px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                PRO v2.6
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              วิเคราะห์คำนวณโอกาสชนะ เสมอ แพ้ ด้วยคณิตศาสตร์ Poisson และ AI อัจฉริยะ
            </p>
          </div>
        </div>

        {/* Live Indicators */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Status Badge */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300">
            {isAiMode ? (
              <>
                <Cpu className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>โหมดวิเคราะห์: </span>
                <span className="font-semibold text-emerald-400">Gemini AI Active</span>
              </>
            ) : (
              <>
                <Calculator className="h-3.5 w-3.5 text-amber-400" />
                <span>โหมดวิเคราะห์: </span>
                <span className="font-semibold text-amber-400">Poisson Model</span>
              </>
            )}
          </div>

          {/* Clock */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 font-mono">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>เวลาท้องถิ่น: {time || "00:00:00"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
