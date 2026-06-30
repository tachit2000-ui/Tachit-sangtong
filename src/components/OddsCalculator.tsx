import React, { useState, useEffect } from "react";
import { Probabilities } from "../types";
import { Calculator, Percent, ShieldCheck, TrendingUp, HelpCircle } from "lucide-react";

interface OddsCalculatorProps {
  probabilities: Probabilities;
  homeTeam: string;
  awayTeam: string;
}

export default function OddsCalculator({ probabilities, homeTeam, awayTeam }: OddsCalculatorProps) {
  const [oddsHome, setOddsHome] = useState<string>("1.95");
  const [oddsDraw, setOddsDraw] = useState<string>("3.40");
  const [oddsAway, setOddsAway] = useState<string>("3.80");

  const [impliedHome, setImpliedHome] = useState<number>(0);
  const [impliedDraw, setImpliedDraw] = useState<number>(0);
  const [impliedAway, setImpliedAway] = useState<number>(0);
  const [bookieMargin, setBookieMargin] = useState<number>(0);

  useEffect(() => {
    const oH = parseFloat(oddsHome) || 0;
    const oD = parseFloat(oddsDraw) || 0;
    const oA = parseFloat(oddsAway) || 0;

    const impH = oH > 0 ? (1 / oH) * 100 : 0;
    const impD = oD > 0 ? (1 / oD) * 100 : 0;
    const impA = oA > 0 ? (1 / oA) * 100 : 0;

    setImpliedHome(impH);
    setImpliedDraw(impD);
    setImpliedAway(impA);

    const totalImplied = impH + impD + impA;
    setBookieMargin(totalImplied > 100 ? totalImplied - 100 : 0);
  }, [oddsHome, oddsDraw, oddsAway]);

  // Value calculation: EV = (Probability% / 100) * Odds - 1
  const calculateEV = (prob: number, oddsStr: string): number => {
    const odds = parseFloat(oddsStr) || 0;
    if (odds <= 0) return -1;
    return (prob / 100) * odds - 1;
  };

  const evHome = calculateEV(probabilities.homeWin, oddsHome);
  const evDraw = calculateEV(probabilities.draw, oddsDraw);
  const evAway = calculateEV(probabilities.awayWin, oddsAway);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 className="text-sm font-semibold tracking-wide text-emerald-400 uppercase flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          เครื่องคำนวณโอกาส & ค้นหา Value Bet
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-md font-mono border border-slate-700">
          1X2 COMPARATOR
        </span>
      </div>

      <p className="text-xs text-slate-400">
        ป้อนอัตราต่อรอง (Odds) จากต่างประเทศด้านล่าง ระบบจะเปรียบเทียบกับความน่าจะเป็นทางสถิติของเรา เพื่อค้นหาราคาที่มีความคุ้มค่าสูงกว่าตลาด (+EV)
      </p>

      {/* INPUT FIELDS */}
      <div className="grid grid-cols-3 gap-3">
        {/* Home Odds */}
        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
          <label className="block text-[11px] font-medium text-slate-300 text-center mb-1.5 font-mono">
            เจ้าบ้านชนะ (1)
          </label>
          <input
            type="number"
            step="0.01"
            min="1.01"
            value={oddsHome}
            onChange={(e) => setOddsHome(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            placeholder="1.95"
          />
        </div>

        {/* Draw Odds */}
        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
          <label className="block text-[11px] font-medium text-slate-300 text-center mb-1.5 font-mono">
            ผลเสมอ (X)
          </label>
          <input
            type="number"
            step="0.01"
            min="1.01"
            value={oddsDraw}
            onChange={(e) => setOddsDraw(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            placeholder="3.40"
          />
        </div>

        {/* Away Odds */}
        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
          <label className="block text-[11px] font-medium text-slate-300 text-center mb-1.5 font-mono">
            ทีมเยือนชนะ (2)
          </label>
          <input
            type="number"
            step="0.01"
            min="1.01"
            value={oddsAway}
            onChange={(e) => setOddsAway(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            placeholder="3.80"
          />
        </div>
      </div>

      {/* COMPARISON AND VALUE ASSESSMENT */}
      <div className="flex flex-col gap-3.5">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
          ผลลัพธ์การวิเคราะห์ราคาต่อรอง
        </h4>

        {/* Home Analysis Row */}
        <div className="bg-slate-800/30 border border-slate-800/50 p-3 rounded-xl flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-white block truncate">
              (1) {homeTeam}
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-slate-400">
              <span>โอกาสของ AI: {probabilities.homeWin}%</span>
              <span>•</span>
              <span>โอกาสของเจ้ามือ: {Math.round(impliedHome)}%</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            {evHome > 0 ? (
              <div className="inline-flex flex-col items-end">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold font-mono animate-pulse">
                  +{(evHome * 100).toFixed(1)}% EV (Value!)
                </span>
                <span className="text-[9px] text-slate-400 mt-1">คุ้มค่าต่อการลงทุน</span>
              </div>
            ) : (
              <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono">
                {(evHome * 100).toFixed(1)}% (ไม่คุ้ม)
              </span>
            )}
          </div>
        </div>

        {/* Draw Analysis Row */}
        <div className="bg-slate-800/30 border border-slate-800/50 p-3 rounded-xl flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-white block truncate">
              (X) ผลเสมอ
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-slate-400">
              <span>โอกาสของ AI: {probabilities.draw}%</span>
              <span>•</span>
              <span>โอกาสของเจ้ามือ: {Math.round(impliedDraw)}%</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            {evDraw > 0 ? (
              <div className="inline-flex flex-col items-end">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold font-mono animate-pulse">
                  +{(evDraw * 100).toFixed(1)}% EV (Value!)
                </span>
                <span className="text-[9px] text-slate-400 mt-1">คุ้มค่าต่อการลงทุน</span>
              </div>
            ) : (
              <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono">
                {(evDraw * 100).toFixed(1)}% (ไม่คุ้ม)
              </span>
            )}
          </div>
        </div>

        {/* Away Analysis Row */}
        <div className="bg-slate-800/30 border border-slate-800/50 p-3 rounded-xl flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-white block truncate">
              (2) {awayTeam}
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-slate-400">
              <span>โอกาสของ AI: {probabilities.awayWin}%</span>
              <span>•</span>
              <span>โอกาสของเจ้ามือ: {Math.round(impliedAway)}%</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            {evAway > 0 ? (
              <div className="inline-flex flex-col items-end">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold font-mono animate-pulse">
                  +{(evAway * 100).toFixed(1)}% EV (Value!)
                </span>
                <span className="text-[9px] text-slate-400 mt-1">คุ้มค่าต่อการลงทุน</span>
              </div>
            ) : (
              <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono">
                {(evAway * 100).toFixed(1)}% (ไม่คุ้ม)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MARGIN ALERT INFO */}
      <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl flex flex-col gap-1 text-[11px] text-slate-400">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1 font-medium text-xs">
            <Percent className="h-3.5 w-3.5 text-emerald-400" />
            ค่าตงค่าน้ำ (Bookmaker Margin):
          </span>
          <span className="font-mono font-bold text-emerald-400">
            {bookieMargin.toFixed(1)}%
          </span>
        </div>
        <p className="mt-1 leading-relaxed">
          * ค่าเฉลี่ยเว็บพนันทั่วไปจะหักค่าตง 3% - 8% ของเงินทุนทั้งหมด ซึ่งทำให้อัตราจ่ายต่ำลง ระบบของเรามองเห็นโอกาสเป็น <span className="text-white font-medium">Expected Value (+EV)</span> เมื่อโอกาสเกิดจริงจากสถิติสูงกว่าราคาจ่ายที่เว็บกำหนด
        </p>
      </div>
    </div>
  );
}
