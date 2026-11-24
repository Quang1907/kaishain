import { Operator, JobBlock } from "@/core/types/factory-common.types";
import { formatTimeHour } from "@/shared/utils/formatters";

export interface TimeOption {
  value: number;
  label: string; // "07:00", "08:00", "17:00", "24:00 (00:00)", "31:00 (07:00 +1)"
}

export interface MaterialHandler {
  id: string;
  name: string;
  role: string;
}

/**
 * Danh sách Người chuẩn bị nguyên liệu (Sấy hạt nhựa & Chuẩn bị thùng bao bì)
 */
export const DEFAULT_MATERIAL_HANDLERS: MaterialHandler[] = [
  { id: "MH-01", name: "エジソン (Edison)", role: "Quản lý Nguyên liệu & Sấy nhựa (Trạm phễu sấy)" },
  { id: "MH-02", name: "Nguyễn Văn Cấp Liệu", role: "Thợ cấp hạt nhựa & theo dõi sấy nhiệt" },
  { id: "MH-03", name: "Trần Chuẩn Bị Thùng", role: "Nhân viên xuất & tập kết thùng KLT" },
];

/**
 * Sinh danh sách mốc thời gian 30 phút từ 07:00 đến 31:00 (07:00 sáng hôm sau)
 * Cho phép người lập lịch chọn giờ trực quan: 08:00, 17:00...
 */
export const GENERATE_TIME_OPTIONS = (): TimeOption[] => {
  const options: TimeOption[] = [];
  for (let h = 7.0; h <= 31.0; h += 0.5) {
    const hourInt = Math.floor(h);
    const minInt = Math.round((h - hourInt) * 60);
    const minStr = String(minInt).padStart(2, "0");

    let displayH: number;
    let suffix = "";

    if (hourInt === 24) {
      options.push({ value: h, label: minInt === 0 ? "24:00 (00:00)" : `00:${minStr} (+1)` });
      continue;
    } else if (hourInt > 24) {
      displayH = hourInt - 24;
      suffix = " (+1)";
    } else {
      displayH = hourInt;
    }

    const timeStr = `${String(displayH).padStart(2, "0")}:${minStr}${suffix}`;
    options.push({ value: h, label: timeStr });
  }
  return options;
};

/**
 * Khớp tên nhân sự thông minh (hỗ trợ cả tiếng Nhật & Việt, ví dụ '川端 (Kawabata)' khớp với 'Kawabata' hoặc '川端')
 */
export function matchOperatorName(name1: string | null | undefined, name2: string | null | undefined): boolean {
  if (!name1 || !name2) return false;
  const n1 = name1.trim().toLowerCase();
  const n2 = name2.trim().toLowerCase();
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  const match1 = n1.match(/\(([^)]+)\)/);
  const match2 = n2.match(/\(([^)]+)\)/);
  if (match1 && match2 && match1[1] === match2[1]) return true;
  if (match1 && n2.includes(match1[1])) return true;
  if (match2 && n1.includes(match2[1])) return true;

  const prefix1 = n1.split("(")[0].trim();
  const prefix2 = n2.split("(")[0].trim();
  if (prefix1 && prefix2 && prefix1 === prefix2) return true;

  return false;
}

export interface BusyStatus {
  isBusy: boolean;
  busyInfo?: string;
  busyMachine?: string;
  busyStart?: number;
  busyEnd?: number;
}

/**
 * Kiểm tra xem một nhân sự có đang bận trên bất kỳ máy nào trong khoảng thời gian [startHour, endHour] không
 */
export function checkOperatorBusyStatus(
  operatorName: string,
  startHour: number,
  endHour: number,
  scheduleJobs: JobBlock[],
  excludeJobId?: string
): BusyStatus {
  if (!operatorName || !scheduleJobs?.length) {
    return { isBusy: false };
  }

  for (const job of scheduleJobs) {
    if (excludeJobId && job.id === excludeJobId) continue;
    // Kiểm tra xem người này có được gán vào op, technician_name hoặc operator_name của job không
    const assignedPersons = [job.op, job.technician, job.technician_name, job.operator, job.operator_name].filter(Boolean);
    const isAssigned = assignedPersons.some((p) => matchOperatorName(p, operatorName));

    if (isAssigned) {
      // Kiểm tra xung đột giao nhau thời gian: job.start < endHour && job.end > startHour
      if (job.start < endHour && job.end > startHour) {
        const timeDesc = `${formatTimeHour(job.start)} → ${formatTimeHour(job.end)}`;
        return {
          isBusy: true,
          busyInfo: `Đang bận trên ${job.machine} (${timeDesc})`,
          busyMachine: job.machine,
          busyStart: job.start,
          busyEnd: job.end,
        };
      }
    }
  }

  return { isBusy: false };
}

export interface FilteredPersonnelGroup {
  assignedToMachine: Operator[]; // Nhân công được phân công đảm nhiệm máy này & đang rảnh
  skilledForProduct: Operator[]; // Nhân công có skill/được giao con hàng này & đang rảnh
  reliefOperators: Operator[];   // Nhân công chạy chuyền / tăng cường & đang rảnh
  otherAvailable: Operator[];    // Các nhân công khác đang rảnh
  availableTechnicians: Operator[]; // Thợ máy kỹ thuật / thay khuôn & đang rảnh
  materialHandlers: MaterialHandler[]; // Người chuẩn bị nguyên liệu
  busyPersonnel: { op: Operator; busyInfo: string }[]; // Nhân sự đang bận trong khung giờ
}

/**
 * Phân loại và lọc danh sách nhân sự phù hợp nhất dựa trên:
 * 1. Thợ máy kỹ thuật (Technician)
 * 2. Nhân công đứng chuyền (Operator)
 * 3. Người chuẩn bị nguyên liệu (Material Handler)
 * 4. Trạng thái rảnh / không bị trùng lịch trong khung giờ [startHour, endHour]
 */
export function getAvailablePersonnel(
  operators: Operator[],
  scheduleJobs: JobBlock[],
  _eventType: string,
  selectedMachine: string,
  productCode: string,
  startHour: number,
  endHour: number,
  excludeJobId?: string
): FilteredPersonnelGroup {
  const result: FilteredPersonnelGroup = {
    assignedToMachine: [],
    skilledForProduct: [],
    reliefOperators: [],
    otherAvailable: [],
    availableTechnicians: [],
    materialHandlers: DEFAULT_MATERIAL_HANDLERS,
    busyPersonnel: [],
  };

  if (!operators?.length) return result;

  for (const op of operators) {
    const busyStatus = checkOperatorBusyStatus(
      op.name,
      startHour,
      endHour,
      scheduleJobs,
      excludeJobId
    );

    const isTechnician =
      op.assigned_machine?.includes("Bảo trì") ||
      op.assigned_machine?.includes("Setup") ||
      op.assigned_machine?.includes("型替") ||
      op.name.includes("Miyaji") ||
      op.name.includes("Kawabata") ||
      op.name.includes("宮地") ||
      op.name.includes("川端") ||
      (op.skill >= 3 && op.is_relief);

    if (busyStatus.isBusy) {
      result.busyPersonnel.push({
        op,
        busyInfo: busyStatus.busyInfo || "Đang bận",
      });
      continue;
    }

    // Nếu là thợ máy: đưa vào availableTechnicians (dùng cho cả STOP và PROD)
    if (isTechnician) {
      result.availableTechnicians.push(op);
      continue;
    }

    // Nếu là nhân công đứng chuyền:
    const isAssignedMachine =
      op.assigned_machine === selectedMachine ||
      (op.assigned_machine && op.assigned_machine.includes(selectedMachine));

    const isSkilledForProduct =
      op.assigned_product === productCode ||
      (op.skill >= 2 && op.mode === "BY_PRODUCT" && op.assigned_product === productCode);

    if (isAssignedMachine) {
      result.assignedToMachine.push(op);
    } else if (isSkilledForProduct) {
      result.skilledForProduct.push(op);
    } else if (op.is_relief || op.assigned_machine?.includes("Relief") || op.assigned_machine?.includes("Bay")) {
      result.reliefOperators.push(op);
    } else {
      result.otherAvailable.push(op);
    }
  }

  return result;
}
