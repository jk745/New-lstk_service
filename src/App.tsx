/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ConciergeBell, 
  Settings, 
  Sparkles, 
  Smartphone, 
  ArrowUpRight, 
  Database, 
  Activity, 
  HeartHandshake,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ClipboardList,
  Users,
  Download
} from "lucide-react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface RoleCard {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  description: string;
  audience: string;
  actionText: string;
  features: string[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"all" | "ops" | "admin">("all");

  const [performanceData, setPerformanceData] = useState([
    { time: "08:00", dispatches: 8, avgTime: 14 },
    { time: "10:00", dispatches: 24, avgTime: 18 },
    { time: "12:00", dispatches: 42, avgTime: 22 },
    { time: "14:00", dispatches: 38, avgTime: 19 },
    { time: "16:00", dispatches: 56, avgTime: 16 },
    { time: "18:00", dispatches: 48, avgTime: 21 },
    { time: "20:00", dispatches: 35, avgTime: 15 },
    { time: "22:00", dispatches: 15, avgTime: 12 },
  ]);

  const [opsMetrics, setOpsMetrics] = useState({
    pendingTasks: 6,
    avgCompletionTime: 16.8,
    onlineStaff: 14
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceData(prev => {
        return prev.map((item, index) => {
          if (index === prev.length - 1 || index === prev.length - 2) {
            const dispOffset = Math.floor(Math.random() * 3) - 1;
            const timeOffset = Math.floor(Math.random() * 3) - 1;
            return {
              ...item,
              dispatches: Math.max(5, item.dispatches + dispOffset),
              avgTime: Math.max(8, item.avgTime + timeOffset)
            };
          }
          return item;
        });
      });

      setOpsMetrics(prev => {
        const taskChange = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newTasks = Math.max(3, Math.min(12, prev.pendingTasks + taskChange));
        
        const timeChange = (Math.random() * 0.6 - 0.3);
        const newTime = Math.max(12, Math.min(22, prev.avgCompletionTime + timeChange));

        const staffChange = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newStaff = Math.max(11, Math.min(16, prev.onlineStaff + staffChange));

        return {
          pendingTasks: newTasks,
          avgCompletionTime: parseFloat(newTime.toFixed(1)),
          onlineStaff: newStaff
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    const headers = ["時間 (Time)", "今日派遣數量 (Dispatches)", "平均完成時間 (Avg Completion Time - min)"];
    const rows = performanceData.map(item => [
      item.time,
      item.dispatches,
      item.avgTime
    ]);
    
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lakeshore_performance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 需求預測計算：根據過去 4 小時 (即最後 3 個資料點) 推估未來 2 小時 (即下一個點)
  const chartDataWithPrediction = React.useMemo(() => {
    if (performanceData.length < 3) return performanceData.map(item => ({ ...item, predictedDispatches: null as number | null }));

    const len = performanceData.length;
    const y0 = performanceData[len - 3].dispatches;
    const y1 = performanceData[len - 2].dispatches;
    const y2 = performanceData[len - 1].dispatches;

    // 最小平方法擬合 3 個等距點之斜率推估：
    // predictedValue = (4 * y2 + y1 - 2 * y0) / 3
    const predictedValue = Math.max(0, Math.round((4 * y2 + y1 - 2 * y0) / 3));

    // 計算預測時段 (增加 2 小時)
    const getLastTime = performanceData[len - 1]?.time || "22:00";
    const [hours, minutes] = getLastTime.split(":").map(Number);
    const nextHours = (hours + 2) % 24;
    const formatNextTime = `${String(nextHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} (預測)`;

    const result = performanceData.map((item, index) => {
      if (index === len - 1) {
        // 連接點：將最後一個實測點的預測值設為其實際值，讓虛線有連續的起點
        return {
          ...item,
          predictedDispatches: item.dispatches as number | null,
        };
      }
      return {
        ...item,
        predictedDispatches: null as number | null,
      };
    });

    result.push({
      time: formatNextTime,
      dispatches: null as any,
      avgTime: null as any,
      predictedDispatches: predictedValue,
    });

    return result;
  }, [performanceData]);

  const roles: RoleCard[] = [
    {
      id: "guest",
      title: "房客端服務系統",
      subtitle: "Guest Room Service Portal",
      path: "/guest.html",
      badge: "房客專用",
      badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      icon: <Smartphone className="w-8 h-8 text-gold" />,
      description: "行動智慧房客助理。房客只需點擊即可快速申請備品補充、行李寄送、預約清潔及即時報修，享有一鍵即達的星級奢華體驗。",
      audience: "現正入住之貴賓 (手機/平板優化)",
      actionText: "啟動房客服務",
      features: ["一鍵點選備品補充", "服務預度進度追蹤", "線上退房預約", "客房清潔指派申請"]
    },
    {
      id: "staff",
      title: "櫃台事務及客服派遣系統",
      subtitle: "Reception & Concierge Desk",
      path: "/staff.html",
      badge: "客服專用",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      icon: <ConciergeBell className="w-8 h-8 text-gold" />,
      description: "一線工作人員之控管核心。即時監聽與接收所有客房的需求通報，進行派遣指派、備註協調與狀態追蹤，維繫極致流暢的星級效率。",
      audience: "櫃台人員、客服主任 (電腦/平板適用)",
      actionText: "進入櫃台管理",
      features: ["即時 Realtime 需求監聽", "一鍵轉指派至清潔人員", "客房重要備註編輯", "多房號管理面板"]
    },
    {
      id: "housekeeping",
      title: "房務清潔與派遣端",
      subtitle: "Housekeeping & Facility Management",
      path: "/housekeeping.html",
      badge: "房務專用",
      badgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/20",
      icon: <Sparkles className="w-8 h-8 text-gold" />,
      description: "房務與清潔先鋒介面。接收由前台或房客直接派遣之清消任務、客房修繕申報，並於完成後即時同步更新房務狀態與物料庫存。",
      audience: "房務部全體主管與清消人員 (手機/平板優化)",
      actionText: "進入房務調度",
      features: ["個人工作調度清單", "備品庫存即時預警", "客房清消狀態速報", "完成一鍵即時通報"]
    },
    {
      id: "admin",
      title: "主控及系統管理後台",
      subtitle: "Core System Administration Portal",
      path: "/admin.html",
      badge: "系統管理",
      badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
      icon: <Settings className="w-8 h-8 text-gold" />,
      description: "完整業務維度之主控中心。提供精準的客房與住客主檔、備品常規列表、即時營運圖表、歷史紀錄調閱及系統初始化安全重設。",
      audience: "房務部、客務部主管",
      actionText: "開啟管理總署",
      features: ["客房/住客主檔建置與清空", "備品品項與預設值設定", "全系統運行日誌安全導出", "物料補給數據監控"]
    }
  ];

  const filteredRoles = roles.filter(role => {
    if (activeTab === "all") return true;
    if (activeTab === "ops") return role.id === "guest" || role.id === "staff" || role.id === "housekeeping";
    if (activeTab === "admin") return role.id === "admin";
    return true;
  });

  return (
    <div className="min-h-screen bg-deep text-surface font-sans selection:bg-gold/30 selection:text-gold-light pb-20">
      {/* BRAND HEADER BAR */}
      <header className="border-b border-gold-dark/20 bg-deep/95 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gold/10 rounded-lg border border-gold/30">
            <ConciergeBell className="w-6 h-6 text-gold-light" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-widest text-lg font-semibold text-gold-light">LAKESHORE RESORT & HOTEL</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-gold/20 text-gold-light uppercase tracking-wider font-mono border border-gold/30">Live Host</span>
            </div>
            <h1 className="text-xs text-text-muted font-normal tracking-widest uppercase mt-0.5">
              煙波大飯店花蓮太魯閣 • 客房與房務派遣系統
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-xs font-mono text-gold-light">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            即時伺服器已連線
          </div>
          <span className="text-xs text-text-muted/60 font-mono hidden md:inline-block">
            2026-06-03 UTC
          </span>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-12 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gold/10 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="z-10"
        >
          <div className="font-serif tracking-[0.3em] text-gold text-lg mb-3">LAKESHORE SERVICE HUB</div>
          <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-white mb-6">
            煙波大飯店花蓮太魯閣 ─ 客房與客服指揮派遣系統
          </h2>
          <p className="max-w-2xl mx-auto text-text-muted leading-relaxed text-sm md:text-base">
            歡迎使用煙波花蓮太魯閣的智慧調度入口！這是專為我們團隊設計的服務派遣系統。
            您可以和同事一起在不同手機、平板或電腦上開啟各自的工作介面，大家的派單、接單與進度都會自動同步，讓夥伴們協作無間、服務更輕鬆！
          </p>
        </motion.div>


      </section>

      {/* FILTER TABS */}
      <div className="flex justify-center mb-10 gap-2 px-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-5 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-gold text-deep border-gold font-semibold shadow-lg shadow-gold/10"
              : "bg-transparent text-text-muted border-gold/20 hover:border-gold/5s"
          }`}
        >
          全部系統模組 (All Ports)
        </button>
        <button
          onClick={() => setActiveTab("ops")}
          className={`px-5 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            activeTab === "ops"
              ? "bg-gold text-deep border-gold font-semibold shadow-lg shadow-gold/10"
              : "bg-transparent text-text-muted border-gold/20 hover:border-gold/5s"
          }`}
        >
          現業運行端 (Guest & Staff Ops)
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`px-5 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            activeTab === "admin"
              ? "bg-gold text-deep border-gold font-semibold shadow-lg shadow-gold/10"
              : "bg-transparent text-text-muted border-gold/20 hover:border-gold/5s"
          }`}
        >
          後勤與系統管理 (Admin)
        </button>
      </div>

      {/* ROLES CARDS GRID */}
      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredRoles.map((role, idx) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="flex flex-col rounded-2xl border border-gold-dark/20 bg-warm/30 p-6 md:p-8 hover:bg-warm/50 hover:border-gold/40 hover:-translate-y-1 transition-all duration-300 relative group box-border shadow-md hover:shadow-xl hover:shadow-black/20"
          >
            {/* Corner Accent Line */}
            <div className="absolute top-0 right-0 w-32 h-[1px] bg-gradient-to-r from-transparent to-gold/40 group-hover:to-gold/80 transition-all duration-300"></div>
            <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-gold/40 to-transparent group-hover:from-gold/80 transition-all duration-300"></div>

            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-deep rounded-xl border border-gold/30">
                {role.icon}
              </div>
              <span className={`px-2.5 py-1 text-[11px] rounded-full font-medium tracking-wide border uppercase ${role.badgeColor}`}>
                {role.badge}
              </span>
            </div>

            <div className="mb-2">
              <h3 className="text-xl md:text-2xl font-serif font-light text-white group-hover:text-gold-light transition-colors duration-200">
                {role.title}
              </h3>
              <p className="text-xs text-gold/70 tracking-widest uppercase font-mono mt-0.5">
                {role.subtitle}
              </p>
            </div>

            <p className="text-sm text-text-muted mb-6 leading-relaxed flex-grow">
              {role.description}
            </p>

            {/* Targeted User Audience */}
            <div className="border-t border-gold/10 pt-4 mb-6 flex items-center justify-between text-xs text-text-muted">
              <span>使用對象 / Audience:</span>
              <span className="font-semibold text-gold-light tracking-wide">{role.audience}</span>
            </div>

            {/* Features list */}
            <div className="mb-6 flex flex-wrap gap-2">
              {role.features.map((feat, fIdx) => (
                <span 
                  key={fIdx} 
                  className="px-2 py-1 text-[10px] rounded bg-deep/80 border border-gold-dark/15 text-text-muted/90 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3 h-3 text-gold" />
                  {feat}
                </span>
              ))}
            </div>

            {/* Launch Button */}
            <a
              href={role.path}
              id={`btn-launch-${role.id}`}
              className="mt-auto py-3 px-6 rounded-xl bg-gradient-to-r from-gold-dark/30 to-gold/20 text-gold-light border border-gold/40 hover:from-gold hover:to-gold-light hover:text-deep hover:border-gold font-medium duration-300 flex items-center justify-center gap-2 tracking-widest text-sm focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {role.actionText}
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </motion.div>
        ))}
      </main>
      
      {/* OPERATIONS SUMMARY CARDS */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-4 h-4 text-gold-light" />
          <h2 id="ops-summary-heading" className="text-lg font-serif font-light text-white tracking-wide">
            今日營運關鍵摘要
          </h2>
          <span className="text-[9px] bg-gold/10 text-gold-light px-2 py-0.5 rounded border border-gold/25 font-mono uppercase tracking-widest ml-2">
            Operations Summary
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 今日待處理任務總數 */}
          <div className="rounded-2xl border border-gold-dark/20 bg-warm/30 p-6 relative overflow-hidden transition-all duration-300 hover:border-gold/40 hover:-translate-y-1 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-[1px] bg-gradient-to-r from-transparent to-amber-500/30"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-text-muted font-sans uppercase tracking-wider">
                  今日待處理任務
                </p>
                <h3 className="text-3xl font-serif text-white font-semibold mt-2 font-mono flex items-baseline gap-1">
                  {opsMetrics.pendingTasks}
                  <span className="text-xs text-text-muted font-normal font-sans">件</span>
                </h3>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <ClipboardList className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gold-dark/10 flex items-center justify-between text-[11px]">
              <span className="text-text-muted font-sans">任務即時儲存於雲端資料同步庫</span>
              <span className="flex items-center gap-1 text-amber-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                待處理中
              </span>
            </div>
          </div>

          {/* Card 2: 平均完成時長 */}
          <div className="rounded-2xl border border-gold-dark/20 bg-warm/30 p-6 relative overflow-hidden transition-all duration-300 hover:border-gold/40 hover:-translate-y-1 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-[1px] bg-gradient-to-r from-transparent to-teal-500/30"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-text-muted font-sans uppercase tracking-wider">
                  平均完成時長
                </p>
                <h3 className="text-3xl font-serif text-white font-semibold mt-2 font-mono flex items-baseline gap-1">
                  {opsMetrics.avgCompletionTime}
                  <span className="text-xs text-text-muted font-normal font-sans">分鐘</span>
                </h3>
              </div>
              <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
                <Clock className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gold-dark/10 flex items-center justify-between text-[11px]">
              <span className="text-text-muted font-sans">較昨日提速約 8%</span>
              <span className="text-teal-400 font-serif font-medium">高效運轉</span>
            </div>
          </div>

          {/* Card 3: 系統目前在線的房務人員數量 */}
          <div className="rounded-2xl border border-gold-dark/20 bg-warm/30 p-6 relative overflow-hidden transition-all duration-300 hover:border-gold/40 hover:-translate-y-1 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-[1px] bg-gradient-to-r from-transparent to-emerald-500/30"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-text-muted font-sans uppercase tracking-wider">
                  在線房務人員
                </p>
                <h3 className="text-3xl font-serif text-white font-semibold mt-2 font-mono flex items-baseline gap-1">
                  {opsMetrics.onlineStaff}
                  <span className="text-xs text-text-muted font-normal font-sans">人</span>
                </h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gold-dark/10 flex items-center justify-between text-[11px]">
              <span className="text-text-muted font-sans">房務接單平台即時在線</span>
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                即時同步
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE MONITORING SECTION */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <div className="rounded-2xl border border-gold-dark/20 bg-warm/30 p-6 md:p-8 relative overflow-hidden shadow-md">
          {/* Corner Accent Lines */}
          <div className="absolute top-0 right-0 w-32 h-[1px] bg-gradient-to-r from-transparent to-gold/40"></div>
          <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-gold/40 to-transparent"></div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Activity className="w-5 h-5 text-gold-light" />
                <span className="font-serif tracking-wider text-sm font-semibold text-gold-light uppercase">
                  Service Performance Telemetry
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono tracking-widest uppercase animate-pulse">
                  Live
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h2 className="text-2xl font-serif font-light text-white">
                  即時服務效能監控
                </h2>
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gold border border-gold-dark/30 hover:border-gold hover:bg-gold/10 rounded-lg transition-all duration-200 font-sans cursor-pointer shadow-sm bg-deep/40"
                  title="匯出今日圖表數據為 CSV"
                >
                  <Download className="w-3.5 h-3.5 text-gold" />
                  <span className="font-medium">匯出報表</span>
                </button>
              </div>
              <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
                跨終端派遣系統運轉效能看板。即時統計今日各時段前台受理並由房務端（Housekeeping）完成之服務派遣量與平均處理時間。疊加 <strong className="text-amber-400 font-medium">橙色虛線需求預測線</strong>（根據過去 4 小時預測趨勢，推估未來 2 小時需求），供現場主任提前調度人手。
              </p>
            </div>

            <div className="flex gap-4 items-center shrink-0 w-full lg:w-auto">
              <div className="bg-deep/80 border border-gold-dark/15 rounded-xl px-5 py-3 flex-1 lg:flex-none text-right">
                <div className="text-[10px] text-text-muted uppercase font-mono tracking-wider">今日累計派遣</div>
                <div className="text-2xl font-serif text-gold-light font-bold mt-0.5 font-mono">
                  {performanceData.reduce((acc, curr) => acc + curr.dispatches, 0)} <span className="text-xs text-text-muted font-normal font-sans">次</span>
                </div>
              </div>
              <div className="bg-deep/80 border border-gold-dark/15 rounded-xl px-5 py-3 flex-1 lg:flex-none text-right">
                <div className="text-[10px] text-text-muted uppercase font-mono tracking-wider">平均處理時間</div>
                <div className="text-2xl font-serif text-teal-300 font-bold mt-0.5 font-mono">
                  {(performanceData.reduce((acc, curr) => acc + curr.avgTime, 0) / performanceData.length).toFixed(1)} <span className="text-xs text-text-muted font-normal font-sans">分鐘</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Chart Container */}
          <div className="h-[280px] md:h-[340px] w-full bg-deep/50 rounded-xl p-4 border border-gold-dark/10">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartDataWithPrediction}
                margin={{ top: 12, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="chartGoldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2A24" opacity={0.6} />
                <XAxis 
                  dataKey="time" 
                  stroke="#8C887E" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2D2A24' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#C9A96E" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2D2A24' }}
                  label={{ value: '派遣數量 (件)', angle: -90, position: 'insideLeft', fill: '#C9A96E', fontSize: 10, offset: 5 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#5EEAD4" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2D2A24' }}
                  label={{ value: '平均處理時間 (分)', angle: 90, position: 'insideRight', fill: '#5EEAD4', fontSize: 10, offset: 5 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E1B15', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(201,169,110,0.3)',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={40} 
                  iconSize={10} 
                  fontSize={11}
                />
                <Area 
                  yAxisId="left"
                  name="今日派遣數量 (件)" 
                  type="monotone" 
                  dataKey="dispatches" 
                  fill="url(#chartGoldGradient)" 
                  stroke="#C9A96E" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  name="平均完成時間 (分)" 
                  type="monotone" 
                  dataKey="avgTime" 
                  stroke="#5EEAD4" 
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: '#5EEAD4', strokeWidth: 2, fill: '#1E1B15' }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="left"
                  name="SLA 需求預測線 (件)" 
                  type="monotone" 
                  dataKey="predictedDispatches" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4, stroke: '#F59E0B', strokeWidth: 2, fill: '#1E1B15' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* FOOTER METRICS INFO */}
      <footer className="mt-24 border-t border-gold-dark/10 pt-8 px-6 max-w-7xl mx-auto text-center space-y-3">
        <div className="flex justify-center gap-3 items-center opacity-60 text-xs text-text-muted">
          <Activity className="w-3.5 h-3.5 text-gold" />
          <span>系統狀態：運轉良好</span>
          <span>•</span>
          <HeartHandshake className="w-3.5 h-3.5 text-gold" />
          <span>煙波飯店 - 全心待您</span>
        </div>
        <p className="text-[11px] text-text-muted/50 font-mono tracking-widest">
          Hosted in Google Cloud Run • Built with HTML5, CSS3, ES11, and High-Speed Realtime Sync Engine
        </p>
        <p className="text-[11px] text-text-muted/30 tracking-widest font-sans pt-1">
          Design by Jonas Kao 煙波系統設計－高勇偉
        </p>
      </footer>
    </div>
  );
}
