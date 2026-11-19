/**
 * Industrial Hour & Number Formatters
 */

/**
 * Định dạng số giờ số thực sang chuỗi giờ công nghiệp (chu kỳ 24h từ 7:00 -> 31:00)
 * VD: 7.0 -> "07:00"
 *     14.5 -> "14:30"
 *     25.0 -> "01:00 (+1)"
 */
export function formatTimeHour(hour: number): string {
  const hourInt = Math.floor(hour);
  const minInt = Math.round((hour - hourInt) * 60);
  const displayH = hourInt >= 24 ? hourInt - 24 : hourInt;
  const dayTag = hourInt >= 24 ? " (+1)" : "";
  return `${String(displayH).padStart(2, "0")}:${String(minInt).padStart(2, "0")}${dayTag}`;
}

/**
 * Định dạng số có dấu phẩy phân cách hàng nghìn
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0";
  return num.toLocaleString("vi-VN");
}

/**
 * Format dung lượng file KB -> MB
 */
export function formatFileSize(kb: number | undefined): string {
  if (!kb) return "0 KB";
  if (kb > 1024) {
    return `${(kb / 1024).toFixed(2)} MB`;
  }
  return `${kb} KB`;
}

