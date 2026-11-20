import React, { useState, useEffect } from "react";
import { Clock, Radio, RotateCcw, Activity } from "lucide-react";
import { useAppStore } from "@/app/store/useAppStore";
import { formatTimeHour } from "@/shared/utils/formatters";
import { FACTORY_TIMELINE } from "@/core/config/constants";
import { Button } from "@/shared/components/ui/Button";

export const GanttTimelineSlider: React.FC = () => {
  const { currentHour, setHour } = useAppStore();
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [liveDate, setLiveDate] = useState<Date>(new Date());

  // Đồng hồ thời gian thực tế nhà máy (cập nhật từng giây)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveDate(now);

      // Nếu đang ở chế độ Live Mode, đồng bộ vạch chỉ báo Gantt chính xác theo giờ thực tế
      if (isLiveMode) {
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();
        // Quy đổi sang hệ trục 24h nhà máy (7:00 sáng đến 31:00 = 7:00 sáng hôm sau)
        // Nếu giờ từ 0 đến 6 sáng (sau nửa đêm), quy đổi thành 24 + h
        const factoryHour = (h < 7 ? 24 + h : h) + m / 60 + s / 3600;
        setHour(parseFloat(factoryHour.toFixed(2)));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLiveMode, setHour]);

  // Xác định ca làm việc thực tế hiện tại
  const currentActualHour = liveDate.getHours() + liveDate.getMinutes() / 60;
  let currentShiftName = "Ca Ngày (08:00 - 17:00)";
  let shiftColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";

  if (currentActualHour >= 17.0 && currentActualHour < 20.0) {
    currentShiftName = "Tăng Ca 1 (17:00 - 20:00)";
    shiftColor = "text-amber-400 border-amber-500/30 bg-amber-500/10";
  } else if (currentActualHour >= 20.0 || currentActualHour < 5.0) {
    currentShiftName = "Ca Đêm (20:00 - 05:00)";
    shiftColor = "text-indigo-400 border-indigo-500/30 bg-indigo-500/10";
  } else if (currentActualHour >= 5.0 && currentActualHour < 8.0) {
    currentShiftName = "Giao Ca & Khởi Động Sáng";
    shiftColor = "text-slate-400 border-slate-500/30 bg-slate-500/10";
  }

  const handleSnapToLive = () => {
    setIsLiveMode(true);
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const factoryHour = (h < 7 ? 24 + h : h) + m / 60;
    setHour(parseFloat(factoryHour.toFixed(2)));
  };

  return (
    <div className="bg-factory-card border border-factory-border rounded-xl p-3 sm:p-4 mb-3 sm:mb-5 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
      {/* Real-time Factory Clock (Thời Gian Thực Tế 100%) */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm shrink-0">
          <Clock size={20} className={isLiveMode ? "animate-pulse" : ""} />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[10px] sm:text-[11px] uppercase text-slate-400 font-bold tracking-wider">
              Thời Gian Thực Tế
            </span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold border ${shiftColor}`}>
              {currentShiftName}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              {liveDate.toLocaleTimeString("vi-VN", { hour12: false })}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
              (Trục Gantt: <strong className="text-blue-400">{formatTimeHour(currentHour)}</strong>)
            </span>
          </div>
        </div>
      </div>

      {/* Slider Control for Shift Seek */}
      <div className="flex-1 w-full max-w-full lg:max-w-xl px-0 sm:px-2">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-400 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
            <Activity size={13} className="text-blue-400" />
            <span>Mốc Khảo Sát JIT:</span>
          </span>
          <span className="font-mono font-bold text-blue-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs">
            {formatTimeHour(currentHour)}
          </span>
        </div>

        <input
          type="range"
          min={FACTORY_TIMELINE.START_HOUR}
          max={FACTORY_TIMELINE.END_HOUR}
          step={0.25}
          value={currentHour}
          onChange={(e) => {
            setIsLiveMode(false);
            setHour(parseFloat(e.target.value));
          }}
          className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
        />

        <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono mt-1">
          <span>07:00</span>
          <span>12:00</span>
          <span className="hidden sm:inline">17:00</span>
          <span>20:00</span>
          <span>07:00 (+1)</span>
        </div>
      </div>

      {/* Live Sync Controls */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t border-factory-border/40 lg:border-none">
        {isLiveMode ? (
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>ĐANG BÁM GIỜ THỰC</span>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSnapToLive}
            className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 shadow-sm"
          >
            <Radio size={13} className="text-white animate-pulse" />
            <span>Về Giờ Thực Tế</span>
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setIsLiveMode(false);
            setHour(8.0);
          }}
          className="h-8 px-2 sm:px-2.5 text-xs text-slate-400 hover:text-white"
          title="Xem mốc bắt đầu ca sáng (08:00)"
        >
          <RotateCcw size={13} />
          <span className="text-xs">08:00</span>
        </Button>
      </div>
    </div>
  );
};
