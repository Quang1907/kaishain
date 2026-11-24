/**
 * Công cụ tính toán sản lượng kế hoạch tự động cho xưởng ép nhựa
 * Dựa trên:
 * 1. Khung thời gian chạy (Giờ bắt đầu -> Giờ kết thúc -> Tổng số giây)
 * 2. Chu kỳ ép (Cycle Time, tính bằng giây/shot, ví dụ 57s)
 * 3. Số cavity khuôn (số sản phẩm / 1 lần dập)
 * 4. Tỉ lệ trừ phế phẩm / hàng lỗi (Defect / Scrap buffer %)
 */

export interface ProductionCalculationResult {
  runHours: number;
  totalSeconds: number;
  cycleTimeSec: number;
  cavity: number;
  totalShots: number;
  grossQty: number;
  defectRatePct: number;
  defectQty: number;
  netGoodQty: number;
  pcsPerHour: number;
}

export function calculateProductionOutput(
  startHour: number,
  endHour: number,
  cycleTimeSec: number = 57.0,
  cavity: number = 1,
  defectRatePct: number = 2.5
): ProductionCalculationResult {
  // 1. Tính thời lượng chạy (tiếng và giây)
  const runHours = Math.max(0, endHour - startHour);
  const totalSeconds = Math.round(runHours * 3600);

  // 2. Bảo đảm tham số hợp lệ
  const safeCycle = cycleTimeSec > 0 ? cycleTimeSec : 57.0;
  const safeCavity = cavity > 0 ? cavity : 1;
  const safeDefectRate = Math.max(0, Math.min(100, defectRatePct));

  // 3. Tính số lần dập khuôn (Shots)
  const totalShots = safeCycle > 0 ? Math.floor(totalSeconds / safeCycle) : 0;

  // 4. Tổng sản lượng lý thuyết chưa trừ lỗi (Gross Output)
  const grossQty = totalShots * safeCavity;

  // 5. Số hàng bị lỗi / phế phẩm trừ đi (Defect / Scrap)
  const defectQty = Math.ceil(grossQty * (safeDefectRate / 100));

  // 6. Số lượng thành phẩm thực tế đạt chuẩn bàn giao (Net Good Output)
  const netGoodQty = Math.max(0, grossQty - defectQty);

  // 7. Năng suất trung bình mỗi giờ
  const pcsPerHour = runHours > 0 ? Math.round(netGoodQty / runHours) : 0;

  return {
    runHours: Number(runHours.toFixed(1)),
    totalSeconds,
    cycleTimeSec: safeCycle,
    cavity: safeCavity,
    totalShots,
    grossQty,
    defectRatePct: safeDefectRate,
    defectQty,
    netGoodQty,
    pcsPerHour,
  };
}
