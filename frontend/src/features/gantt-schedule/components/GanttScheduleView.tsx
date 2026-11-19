import React from "react";
import { useAppStore } from "@/app/store/useAppStore";
import { useScheduleQuery } from "../api/scheduleApi";
import { GanttTimelineSlider } from "./GanttTimelineSlider";
import { GanttBoard } from "./GanttBoard";
import { JobDetailModal } from "./JobDetailModal";

export const GanttScheduleView: React.FC = () => {
  const { currentDate, currentHour } = useAppStore();
  const { data: schedule, isLoading } = useScheduleQuery(currentDate, currentHour);

  return (
    <div className="space-y-4">
      <GanttTimelineSlider />
      <GanttBoard schedule={schedule} isLoading={isLoading} />
      <JobDetailModal />
    </div>
  );
};

