import React from "react";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { useAppStore } from "@/app/store/useAppStore";
import { formatTimeHour } from "@/shared/utils/formatters";
import { FACTORY_TIMELINE } from "@/core/config/constants";
import { Button } from "@/shared/components/ui/Button";

export const GanttTimelineSlider: React.FC = () => {
  const { currentHour, setHour } = useAppStore();
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setHour(currentHour >= FACTORY_TIMELINE.END_HOUR ? FACTORY_TIMELINE.START_HOUR : currentHour + 0.5);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentHour, setHour]);

  return (
    <div className="bg-factory-card border border-factory-border rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Current Simulation Clock */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Clock size={20} />
        </div>
        <div>
          <div className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
            Thời Gian Giả Lập Điều Hành
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatTimeHour(currentHour)}
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div className="flex-1 max-w-xl w-full px-4">
        <input
          type="range"
          min={FACTORY_TIMELINE.START_HOUR}
          max={FACTORY_TIMELINE.END_HOUR}
          step={FACTORY_TIMELINE.STEP_HOUR}
          value={currentHour}
          onChange={(e) => setHour(parseFloat(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
          <span>07:00 (Sáng)</span>
          <span>12:00 (Nghỉ trưa)</span>
          <span>17:00 (Tan ca 1)</span>
          <span>20:00 (Ca đêm)</span>
          <span>07:00 (+1)</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="h-9 px-3"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          <span>{isPlaying ? "Tạm dừng" : "Chạy tự động"}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHour(8.0)}
          className="h-9 px-2.5 text-slate-400"
          title="Đặt lại 08:00"
        >
          <RotateCcw size={14} />
        </Button>
      </div>
    </div>
  );
};

