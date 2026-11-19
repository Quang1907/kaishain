/**
 * Master Factory APS Brain Frontend Controller
 * Kết nối Trực tiếp Cơ Sở Dữ Liệu SQLite & Toàn bộ Module Điều hành
 */

let state = {
  currentView: "gantt",
  currentDate: "2026-11-12",
  currentHour: 8.0,
  currentAdminTab: "jobs",
  machines: [],
  products: {},
  operators: [],
  shippingOrders: [],
  materials: [],
  boxes: [],
  schedule: null,
  readinessReports: [],
  breaks: [],
  dbStats: {},
  feedbackLogs: [],
};

// Khởi chạy khi tải trang
document.addEventListener("DOMContentLoaded", async () => {
  await fetchMasterData();
  await loadCurrentSchedule();
  await refreshDbStats();
});

// Helper format giờ công nghiệp (VD: 7.0 -> 07:00, 14.5 -> 14:30, 25.0 -> 01:00 (+1))
function formatTimeHour(h) {
  const hourInt = Math.floor(h);
  const minInt = Math.round((h - hourInt) * 60);
  const displayH = hourInt >= 24 ? hourInt - 24 : hourInt;
  const dayTag = hourInt >= 24 ? " (+1)" : "";
  return `${String(displayH).padStart(2, "0")}:${String(minInt).padStart(2, "0")}${dayTag}`;
}

// 1. Chuyển đổi màn hình chức năng (Views)
function switchView(viewName) {
  state.currentView = viewName;

  const views = [
    "gantt",
    "orders",
    "machines",
    "products",
    "operators",
    "database",
    "admin",
  ];
  views.forEach((v) => {
    const el = document.getElementById(`view-${v}`);
    const tab = document.getElementById(`tab-nav-${v}`);
    if (el) el.classList.toggle("hidden", v !== viewName);
    if (tab) {
      if (v === viewName) {
        tab.className =
          "px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow flex items-center gap-1.5 transition";
      } else {
        tab.className =
          "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-1.5 transition";
      }
    }
  });

  // Render dữ liệu của view được chọn
  if (viewName === "orders") renderOrdersTable();
  if (viewName === "machines") renderMachinesGrid();
  if (viewName === "products") renderProductsTable();
  if (viewName === "operators") renderOperatorsTable();
  if (viewName === "database") renderDatabaseView();
  if (viewName === "admin") renderAdminPortal();
}

// 2. Tải Master Data từ Database SQLite
async function fetchMasterData() {
  try {
    const [machRes, prodRes, opRes, ordRes, dbRes, matRes, boxRes] =
      await Promise.all([
        fetch("/api/machines").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/operators").then((r) => r.json()),
        fetch("/api/shipping-orders").then((r) => r.json()),
        fetch("/api/db/stats").then((r) => r.json()),
        fetch("/api/materials").then((r) => r.json()),
        fetch("/api/boxes").then((r) => r.json()),
      ]);

    state.machines = machRes;
    state.products = prodRes;
    state.operators = opRes;
    state.shippingOrders = ordRes;
    state.dbStats = dbRes;
    state.materials = matRes;
    state.boxes = boxRes;

    const sizeEl = document.getElementById("db-size-label");
    if (sizeEl) sizeEl.innerText = `${dbRes.file_size_kb || 144} KB`;
  } catch (err) {
    console.error("Lỗi nạp Master Data từ DB:", err);
  }
}

// 3. Tải Lịch trình từ Database
async function loadCurrentSchedule() {
  try {
    const schedUrl = `/api/schedule?date=${state.currentDate}&current_hour=${state.currentHour}`;
    const readUrl = `/api/readiness?date=${state.currentDate}&current_hour=${state.currentHour}`;
    const breakUrl = `/api/breaks?hour=${state.currentHour}`;

    const [schedRes, readRes, breakRes] = await Promise.all([
      fetch(schedUrl).then((r) => r.json()),
      fetch(readUrl).then((r) => r.json()),
      fetch(breakUrl).then((r) => r.json()),
    ]);

    state.schedule = schedRes;
    state.readinessReports = readRes;
    state.breaks = breakRes;

    renderKPIs();
    renderReadinessRadar();
    renderGanttBoard();
    renderMoldChangeRibbon();
    renderOperatorRoster();
    renderBreaks();
    renderScheduleNotes();
  } catch (err) {
    console.error("Lỗi tải lịch trình:", err);
  }
}

// Chuyển đổi ngày
function switchSchedule(dateKey) {
  state.currentDate = dateKey;

  const b1 = document.getElementById("btn-day1");
  const b2 = document.getElementById("btn-day2");
  const bOpt = document.getElementById("btn-opt");

  [b1, b2, bOpt].forEach((b) => {
    b.className =
      "px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5";
  });

  if (dateKey === "2026-11-12") {
    b1.className =
      "px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow flex items-center gap-1.5";
    document.getElementById("schedule-title-badge").innerText =
      "11月12日 木曜日 (Thứ 5)";
  } else if (dateKey === "2026-11-13") {
    b2.className =
      "px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow flex items-center gap-1.5";
    document.getElementById("schedule-title-badge").innerText =
      "11月13日 金曜日 (Thứ 6)";
  } else {
    bOpt.className =
      "px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow flex items-center gap-1.5";
    document.getElementById("schedule-title-badge").innerText =
      "AI Tự Động Lập Lịch Ca Kế Tiếp (Saturday/Monday)";
  }

  loadCurrentSchedule();
}

// Thay đổi giờ giả lập
function onHourChange(val) {
  state.currentHour = parseFloat(val);
  const hourInt = Math.floor(state.currentHour);
  const minInt = Math.round((state.currentHour - hourInt) * 60);

  let displayHour = hourInt >= 24 ? hourInt - 24 : hourInt;
  let dayTag = hourInt >= 24 ? " (+1)" : "";

  document.getElementById("current-hour-display").innerText =
    `${String(displayHour).padStart(2, "0")}:${String(minInt).padStart(2, "0")}${dayTag}`;

  loadCurrentSchedule();
}

// 4. Render KPIs
function renderKPIs() {
  if (!state.schedule) return;

  const jobs = state.schedule.jobs || [];
  const currH = state.currentHour;

  const activeJobs = jobs.filter((j) => j.start <= currH && currH < j.end);
  const prodJobs = activeJobs.filter((j) => j.event === "PROD");
  const moldJobs = activeJobs.filter((j) => j.event === "MOLD_CHANGE");
  const stopJobs = activeJobs.filter((j) => j.event === "STOP");

  document.getElementById("kpi-active-machines").innerText = prodJobs.length;
  document.getElementById("kpi-mold-changes").innerText = moldJobs.length;
  document.getElementById("kpi-stopped-machines").innerText = stopJobs.length;

  const onShiftOps = state.operators.filter(
    (op) => op.start <= currH && currH <= op.end,
  );
  document.getElementById("kpi-operators-onshift").innerText =
    onShiftOps.length;
}

// 5. Render JIT Readiness Radar
function renderReadinessRadar() {
  const container = document.getElementById("readiness-cards-container");
  if (!container || !state.readinessReports) return;

  container.innerHTML = state.readinessReports
    .map((rep) => {
      let statusBadge = "";
      let borderClass = "border-slate-800";

      if (rep.status === "READY_TO_SHIP") {
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><i class="fa-solid fa-check"></i> ĐÃ SẴN SÀNG</span>`;
        borderClass = "border-emerald-500/30";
      } else if (rep.status === "IN_PRODUCTION") {
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><i class="fa-solid fa-gear fa-spin"></i> ĐANG ÉP (${rep.progress_pct}%)</span>`;
        borderClass = "border-indigo-500/30";
      } else {
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><i class="fa-solid fa-hourglass-half"></i> ĐANG SẤY NHỰA</span>`;
        borderClass = "border-amber-500/30";
      }

      return `
      <div class="bg-slate-950/80 border ${borderClass} rounded-xl p-3 flex flex-col justify-between hover:border-slate-600 transition shadow">
        <div>
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <div class="flex items-center space-x-1.5">
                <span class="text-xs font-black text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">${rep.product_code}</span>
                <span class="text-xs font-bold text-slate-200 truncate max-w-[150px]">${rep.product_name}</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Khách hàng: <strong class="text-slate-300">${rep.customer}</strong></p>
            </div>
            ${statusBadge}
          </div>

          <div class="grid grid-cols-2 gap-2 my-2 py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
            <div>
              <span class="text-slate-400">Lệnh xuất hàng:</span>
              <p class="font-bold text-white text-xs">${rep.order_qty.toLocaleString()} cái</p>
            </div>
            <div>
              <span class="text-slate-400">Đệm an toàn (AI):</span>
              <p class="font-bold text-emerald-400 text-xs">+${rep.safety_buffer_units} cái (${rep.safety_buffer_pct}%)</p>
            </div>
          </div>

          <div class="space-y-1 text-[11px] text-slate-300 mt-1">
            <div class="flex items-center justify-between">
              <span class="text-amber-300 flex items-center gap-1"><i class="fa-solid fa-fire-burner"></i> Sấy nhựa:</span>
              <span class="font-mono text-slate-200">${rep.prep_timeline.dry_temp}°C (từ ${rep.prep_timeline.dry_start_hour.toFixed(1)}h)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-purple-300 flex items-center gap-1"><i class="fa-solid fa-box-open"></i> Xuất thùng:</span>
              <span class="font-mono text-slate-200">${rep.prep_timeline.boxes_needed} thùng (${rep.prep_timeline.box_staging_hour.toFixed(1)}h)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-cyan-300 flex items-center gap-1"><i class="fa-solid fa-industry"></i> Máy phụ trách:</span>
              <span class="font-bold text-white">${rep.assigned_machine}</span>
            </div>
          </div>
        </div>

        <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span class="text-slate-400">Hạn giao: <strong class="text-amber-400">${rep.deadline_hour.toFixed(1)}:00</strong></span>
          <span class="text-emerald-400 font-semibold"><i class="fa-solid fa-circle-check"></i> Đảm bảo 100%</span>
        </div>
      </div>
    `;
    })
    .join("");
}

// 6. Render Gantt 24h & Thay Khuôn Radar
function renderGanttBoard() {
  const root = document.getElementById("gantt-board-root");
  if (!root || !state.schedule) return;

  const jobs = state.schedule.jobs || [];
  const hours = [];
  for (let h = 7; h <= 30; h++) hours.push(h);

  let headerHtml = `
    <div class="machine-row bg-slate-900 border-b-2 border-slate-700 py-1.5 sticky top-0 z-30 font-bold text-xs text-slate-300">
      <div class="px-3 flex items-center justify-between border-r border-slate-800">
        <span>号機 (Máy ép)</span>
        <span class="text-[10px] text-slate-500 font-normal">Tấn</span>
      </div>
      ${hours
        .map((h) => {
          let displayH = h >= 24 ? h - 24 : h;
          let isNight = h >= 20;
          let nightClass = isNight
            ? "bg-slate-950/70 text-indigo-300 font-bold"
            : "text-slate-300";
          return `<div class="text-center border-r border-slate-800/50 py-1 ${nightClass} text-[11px]">${displayH}:00</div>`;
        })
        .join("")}
    </div>
  `;

  const currH = state.currentHour;
  const currPercent = ((currH - 7.0) / 24.0) * 100.0;
  const showTimeIndicator = currPercent >= 0 && currPercent <= 100;

  let rowsHtml = state.machines
    .map((m) => {
      const rawJobs = jobs.filter((j) => j.machine === m.id);
      const sortedJobs = [...rawJobs].sort((a, b) => a.start - b.start);

      // Tự động lấp đầy các khoảng trống lịch chạy bằng khối ĐỎ TẮT MÁY (□ 計画停止)
      const machineJobs = [];
      let cursor = 7.0;

      for (const job of sortedJobs) {
        if (job.start > cursor + 0.05) {
          machineJobs.push({
            id: `auto_stop_${m.id}_${cursor.toFixed(1)}_${job.start.toFixed(1)}`,
            machine: m.id,
            product: "STOP",
            start: cursor,
            end: job.start,
            event: "STOP",
            op: null,
            is_auto: true,
          });
        }
        machineJobs.push(job);
        cursor = Math.max(cursor, job.end);
      }

      if (cursor < 30.95) {
        machineJobs.push({
          id: `auto_stop_${m.id}_${cursor.toFixed(1)}_31`,
          machine: m.id,
          product: "STOP",
          start: cursor,
          end: 31.0,
          event: "STOP",
          op: null,
          is_auto: true,
        });
      }

      const blockElements = machineJobs
        .map((job) => {
          const leftH = Math.max(7.0, job.start);
          const rightH = Math.min(31.0, job.end);
          const duration = rightH - leftH;
          if (duration <= 0) return "";

          const leftPercent = ((leftH - 7.0) / 24.0) * 100.0;
          const widthPercent = (duration / 24.0) * 100.0;

          const timeRangeStr = `${formatTimeHour(job.start)} - ${formatTimeHour(job.end)}`;
          const durationStr = `${duration.toFixed(1)}h`;

          let styleClasses = "";
          let titleHtml = "";
          let sublineHtml = "";
          let hoverTooltip = "";

          if (job.event === "PROD") {
            styleClasses =
              "bg-gradient-to-r from-teal-700 to-emerald-600 text-white border border-emerald-400/60 shadow-sm";
            const pInfo = state.products[job.product] || {};
            let badgeLabel = "";
            if (pInfo.preferred_mode === "BY_PRODUCT") {
              badgeLabel = `<span class="text-[9px] bg-cyan-950 text-cyan-200 px-1 rounded ml-1 font-mono border border-cyan-800/60 flex-shrink-0">👤${job.op ? job.op.split(" ")[0] : "Chuyên"}</span>`;
            } else {
              badgeLabel = `<span class="text-[9px] bg-slate-900 text-slate-300 px-1 rounded ml-1 font-mono border border-slate-700/60 flex-shrink-0">⚙️${job.op ? job.op.split(" ")[0] : "Máy"}</span>`;
            }

            titleHtml = `
          <div class="flex items-center text-[11px] font-bold truncate leading-tight">
            <i class="fa-solid fa-cube text-[10px] mr-1 text-emerald-200 flex-shrink-0"></i>
            <span class="truncate font-bold">${job.product}</span>
            ${badgeLabel}
          </div>
        `;

            sublineHtml = `
          <div class="flex items-center text-[10px] font-mono text-emerald-100/95 mt-0.5 truncate leading-tight">
            <span class="font-bold text-white">${timeRangeStr}</span>
            <span class="opacity-90 ml-1">(${durationStr})</span>
            ${job.op ? `<span class="opacity-80 ml-1 font-sans">${job.op.split(" ")[0]}</span>` : ""}
          </div>
        `;

            hoverTooltip = `[CHẠY ÉP SẢN XUẤT]&#10;• Máy: ${job.machine}&#10;• Con hàng: ${job.product}&#10;• Khung giờ: ${timeRangeStr} (${durationStr})&#10;• Thợ đứng máy: ${job.op || "Chưa gán"}&#10;👉 Bấm để xem chi tiết 3 chân kiềng`;
          } else if (job.event === "MOLD_CHANGE") {
            styleClasses =
              "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white border-2 border-amber-300 font-bold shadow-md shadow-amber-950/40";

            titleHtml = `
          <div class="flex items-center text-[11px] font-black truncate leading-tight">
            <span class="px-1 py-0.2 mr-1 rounded bg-black/40 text-amber-200 text-[10px] font-black border border-amber-300/40 flex-shrink-0">○ 型替</span>
            <span class="truncate font-black text-white">${job.product}</span>
          </div>
        `;

            sublineHtml = `
          <div class="flex items-center text-[10px] font-mono font-bold text-amber-100 mt-0.5 whitespace-nowrap truncate leading-tight">
            <span class="bg-black/50 px-1 py-0.2 rounded text-amber-200 border border-amber-400/40 flex items-center gap-1 shadow-sm flex-shrink-0">
              <i class="fa-regular fa-clock text-[9px] text-amber-300"></i>
              <span class="font-extrabold text-white">${formatTimeHour(job.start)} → ${formatTimeHour(job.end)}</span>
              <span class="text-amber-300">(${durationStr})</span>
            </span>
            ${job.op ? `<span class="text-white font-normal ml-1 font-sans text-[9px] truncate">${job.op.split(" ")[0]}</span>` : ""}
          </div>
        `;

            hoverTooltip = `[○ THAY KHUÔN / THAY HÀNG]&#10;• Máy: ${job.machine}&#10;• Con hàng mới: ${job.product}&#10;• Khung giờ thay: ${timeRangeStr} (kéo dài ${durationStr})&#10;• Người thay khuôn: ${job.op || "Kawabata/Miyaji"}&#10;• Lịch sau: Bắt đầu chạy ${job.product} lúc ${formatTimeHour(job.end)}&#10;👉 Bấm để xem chi tiết 3 chân kiềng`;
          } else if (job.event === "COLOR_CHANGE") {
            styleClasses =
              "bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 border-2 border-yellow-300 font-bold shadow-md";

            titleHtml = `
          <div class="flex items-center text-[11px] font-black truncate leading-tight text-slate-950">
            <span class="px-1 py-0.2 mr-1 rounded bg-slate-950 text-yellow-300 text-[10px] font-black flex-shrink-0">△ 色替</span>
            <span class="truncate font-black">${job.product}</span>
          </div>
        `;

            sublineHtml = `
          <div class="flex items-center text-[10px] font-mono font-bold text-slate-900 mt-0.5 whitespace-nowrap truncate leading-tight">
            <span class="bg-slate-950/80 text-yellow-200 px-1 py-0.2 rounded border border-yellow-400/40">
              ${timeRangeStr} (${durationStr})
            </span>
          </div>
        `;

            hoverTooltip = `[△ ĐỔI MÀU NHỰA]&#10;• Máy: ${job.machine}&#10;• Khung giờ đổi màu: ${timeRangeStr} (${durationStr})&#10;👉 Bấm để xem chi tiết`;
          } else if (job.event === "STOP") {
            styleClasses = "hatch-pattern text-rose-200 font-bold";

            titleHtml = `
          <div class="flex items-center text-[11px] font-black text-rose-200 leading-tight truncate">
            <span class="w-2 h-2 rounded-full bg-rose-500 mr-1.5 flex-shrink-0 animate-pulse"></span>
            <span class="truncate">□ 計画停止 (Tắt máy)</span>
          </div>
        `;

            sublineHtml = `
          <div class="text-[10px] font-mono text-rose-200/90 font-bold mt-0.5 truncate leading-tight">
            ${timeRangeStr} (${durationStr})
          </div>
        `;

            hoverTooltip = `[□ TẮT MÁY TIẾT KIỆM ĐIỆN]&#10;• Máy: ${job.machine}&#10;• Khung giờ dừng: ${timeRangeStr} (kéo dài ${durationStr})&#10;• Trạng thái: Dừng máy để tiết kiệm điện & bảo dưỡng`;
          }

          return `
        <div 
          onclick='openJobDetailModal("${job.id}")'
          class="gantt-block ${styleClasses}"
          style="left: ${leftPercent}%; width: ${widthPercent}%;"
          title="${hoverTooltip}"
        >
          ${titleHtml}
          ${sublineHtml}
        </div>
      `;
        })
        .join("");

      return `
      <div id="machine-row-${m.id}" class="machine-row relative py-1.5 items-center transition-all duration-300">
        <div class="px-3 flex items-center justify-between border-r border-slate-800 bg-slate-900/60 z-10 h-full">
          <div class="flex items-center space-x-1.5">
            <span class="font-bold text-xs text-white">${m.id}</span>
            ${m.is_new ? '<span class="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded">新</span>' : ""}
          </div>
          <span class="text-[10px] font-mono text-slate-400">${m.tonnage}T</span>
        </div>
        <div class="col-span-24 relative h-12 w-full min-w-0">
          <div class="absolute inset-0 grid grid-cols-24 pointer-events-none">
            ${hours.map((_, i) => `<div class="border-r border-slate-800/40 h-full"></div>`).join("")}
          </div>
          ${
            showTimeIndicator
              ? `
            <div class="absolute top-0 bottom-0 w-[2px] bg-indigo-500 z-20 pointer-events-none shadow-[0_0_8px_rgba(99,102,241,0.9)]" style="left: ${currPercent}%;"></div>
          `
              : ""
          }
          ${blockElements}
        </div>
      </div>
    `;
    })
    .join("");

  root.innerHTML = headerHtml + rowsHtml;
}

// 6.1. Render Changeover Radar Ribbon (Mốc giờ thay hàng & Lịch chạy sau)
function renderMoldChangeRibbon() {
  const strip = document.getElementById("mold-change-strip");
  const countBadge = document.getElementById("mold-change-count-badge");
  if (!strip || !state.schedule) return;

  const jobs = state.schedule.jobs || [];
  const changeovers = [];

  const byMachine = {};
  jobs.forEach((j) => {
    if (!byMachine[j.machine]) byMachine[j.machine] = [];
    byMachine[j.machine].push(j);
  });

  Object.keys(byMachine).forEach((mId) => {
    const mJobs = byMachine[mId].sort((a, b) => a.start - b.start);
    mJobs.forEach((job, idx) => {
      if (job.event === "MOLD_CHANGE" || job.event === "COLOR_CHANGE") {
        const prevJob = idx > 0 ? mJobs[idx - 1] : null;
        const nextJob = idx < mJobs.length - 1 ? mJobs[idx + 1] : null;

        const prevProd =
          prevJob && prevJob.event === "PROD"
            ? prevJob.product
            : prevJob
              ? prevJob.event
              : "Đầu ca";
        const nextProd = nextJob ? nextJob.product : job.product;
        const nextTimeStr = nextJob
          ? `${formatTimeHour(nextJob.start)} - ${formatTimeHour(nextJob.end)} (${(nextJob.end - nextJob.start).toFixed(1)}h)`
          : "Chưa có lịch tiếp";

        changeovers.push({
          id: job.id,
          machine: mId,
          event: job.event,
          product: job.product,
          start: job.start,
          end: job.end,
          duration: job.end - job.start,
          op: job.op,
          prevProduct: prevProd,
          nextProduct: nextProd,
          nextTimeStr: nextTimeStr,
          nextOp: nextJob ? nextJob.op : null,
        });
      }
    });
  });

  changeovers.sort((a, b) => a.start - b.start);

  if (countBadge) {
    countBadge.innerText = `${changeovers.length} ca thay`;
  }

  if (changeovers.length === 0) {
    strip.innerHTML = `
      <div class="py-2 px-3 text-slate-400 text-xs italic">
        Không có lịch thay khuôn/đổi màu nào trong ca này.
      </div>
    `;
    return;
  }

  const currH = state.currentHour;

  strip.innerHTML = changeovers
    .map((ch) => {
      const isNow = currH >= ch.start && currH < ch.end;
      const isSoon = ch.start > currH && ch.start <= currH + 2.0;

      let borderClass = "border-amber-500/40 bg-slate-900";
      let badgeTag = "";
      if (isNow) {
        borderClass = "border-amber-400 bg-amber-950/40 ring-1 ring-amber-400";
        badgeTag = `<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950 animate-pulse">ĐANG THAY</span>`;
      } else if (isSoon) {
        borderClass = "border-amber-400/80 bg-amber-950/20";
        badgeTag = `<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">SẮP THAY</span>`;
      }

      return `
      <div 
        onclick="scrollToMachine('${ch.machine}')"
        class="flex-shrink-0 p-2 rounded-xl border ${borderClass} hover:border-amber-400 hover:bg-slate-800 transition cursor-pointer shadow-md flex items-center space-x-2.5 text-xs group"
        title="Bấm để cuộn đến ${ch.machine} trên bảng Gantt"
      >
        <div class="bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg text-center flex-shrink-0">
          <div class="text-[11px] font-mono text-amber-300 font-black whitespace-nowrap">
            ${formatTimeHour(ch.start)} → ${formatTimeHour(ch.end)}
          </div>
          <div class="text-[10px] text-amber-400/90 font-bold">${ch.duration.toFixed(1)} tiếng</div>
        </div>

        <div>
          <div class="flex items-center space-x-2">
            <span class="font-extrabold text-white text-xs">${ch.machine}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              ${ch.event === "COLOR_CHANGE" ? "△ Đổi màu" : "○ Thay khuôn"}
            </span>
            ${badgeTag}
            ${ch.op ? `<span class="text-[10px] text-slate-400 font-mono">👤 ${ch.op.split(" ")[0]}</span>` : ""}
          </div>

          <div class="flex items-center space-x-1.5 text-[11px] mt-1 whitespace-nowrap">
            <span class="text-slate-400 line-through">${ch.prevProduct}</span>
            <i class="fa-solid fa-arrow-right text-[10px] text-amber-400"></i>
            <span class="font-extrabold text-amber-300 bg-amber-950/80 px-1 rounded border border-amber-500/30">${ch.product}</span>
            <span class="text-slate-400 text-[10px] ml-1">
              • Lịch sau: <strong class="text-emerald-400 font-mono font-semibold">${ch.nextTimeStr}</strong>
            </span>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// 6.2. Cuộn và làm nổi bật máy khi bấm vào mốc thay khuôn
function scrollToMachine(mId) {
  const row = document.getElementById(`machine-row-${mId}`);
  if (row) {
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    row.classList.add("ring-2", "ring-amber-400", "bg-amber-950/30");
    setTimeout(() => {
      row.classList.remove("ring-2", "ring-amber-400", "bg-amber-950/30");
    }, 2500);
  }
}

// 7. Render Operator Roster & Breaks
function renderOperatorRoster() {
  const container = document.getElementById("operator-list-container");
  if (!container) return;

  const currH = state.currentHour;
  const onShift = state.operators.filter(
    (op) => op.start <= currH && currH <= op.end,
  );

  const countBadge = document.getElementById("operator-count-badge");
  if (countBadge) countBadge.innerText = `${onShift.length} người trong ca`;

  container.innerHTML = onShift
    .map((op) => {
      let modeBadge =
        op.mode === "BY_PRODUCT"
          ? `<span class="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50"><i class="fa-solid fa-user-tag"></i> Theo con hàng: ${op.assigned_product || "Chuyên trách"}</span>`
          : `<span class="text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"><i class="fa-solid fa-robot"></i> Trông máy: ${op.assigned_machine || "Cố định"}</span>`;

      if (op.is_relief) {
        modeBadge += `<span class="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded ml-1 border border-amber-800/50">Chạy chuyền (Relief)</span>`;
      }

      return `
      <div class="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
            ${op.name.charAt(0)}
          </div>
          <div>
            <p class="font-bold text-white text-xs">${op.name}</p>
            <p class="text-[10px] text-slate-400 font-mono">Ca: ${op.start.toFixed(1)}h - ${op.end.toFixed(1)}h</p>
          </div>
        </div>
        <div>${modeBadge}</div>
      </div>
    `;
    })
    .join("");
}

function renderBreaks() {
  const container = document.getElementById("break-list-container");
  if (!container || !state.breaks) return;

  container.innerHTML = state.breaks
    .map((b) => {
      const isCurrent =
        state.currentHour >= b.start && state.currentHour < b.end;
      const activeBorder = isCurrent
        ? "border-amber-400 bg-amber-500/10"
        : "border-slate-800 bg-slate-950";

      return `
      <div class="p-2 rounded-lg border ${activeBorder} flex flex-col justify-between text-xs">
        <div class="flex items-center justify-between font-bold">
          <span class="text-amber-300 flex items-center gap-1.5"><i class="fa-solid fa-mug-hot"></i> ${b.name}</span>
          <span class="font-mono text-slate-300">${b.start.toFixed(1)}:00 - ${b.end.toFixed(1)}:00</span>
        </div>
        <div class="flex items-center justify-between mt-1 text-[11px] text-slate-400">
          <span>Giải pháp giữ máy:</span>
          <span class="text-emerald-400 font-semibold">${b.coverage}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

function renderScheduleNotes() {
  const container = document.getElementById("schedule-notes-container");
  if (!container || !state.schedule) return;

  const notes = state.schedule.notes || [];
  container.innerHTML = notes
    .map(
      (n) => `
    <span class="bg-slate-900 border border-slate-700/60 px-2 py-0.5 rounded text-[11px] text-slate-200">
      • ${n}
    </span>
  `,
    )
    .join("");
}

// 8. Render View 2: Orders Table
function renderOrdersTable() {
  const tbody = document.getElementById("orders-table-body");
  if (!tbody) return;

  tbody.innerHTML = state.shippingOrders
    .map(
      (o) => `
    <tr class="hover:bg-slate-900/60 transition">
      <td class="p-3 font-mono font-bold text-white">${o.order_id}</td>
      <td class="p-3 font-semibold text-slate-200">${o.customer}</td>
      <td class="p-3">
        <span class="font-mono bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-indigo-300 font-bold">${o.product}</span>
        <span class="ml-1 text-slate-400">${o.product_name || ""}</span>
      </td>
      <td class="p-3 text-right font-mono font-bold text-white">${o.order_qty.toLocaleString()}</td>
      <td class="p-3 text-right font-mono font-bold text-emerald-400">+${o.safety_buffer_units || 0}</td>
      <td class="p-3 text-slate-300">${o.box_name || o.box_type} (${o.boxes_required} thùng)</td>
      <td class="p-3 font-mono text-amber-300">${o.ship_date} lúc ${o.ship_deadline_hour}:00</td>
      <td class="p-3 text-center">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${o.status === "READY" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}">
          ${o.status}
        </span>
      </td>
    </tr>
  `,
    )
    .join("");
}

// 9. Render View 3: Machines Grid
function renderMachinesGrid() {
  const container = document.getElementById("machines-grid-container");
  if (!container) return;

  container.innerHTML = state.machines
    .map(
      (m) => `
    <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="font-bold text-sm text-white">${m.id}</span>
          ${m.is_new ? '<span class="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold">新号機</span>' : ""}
        </div>
        <p class="text-xs text-slate-400">Lực kẹp: <strong class="text-slate-200 font-mono">${m.tonnage} Tấn</strong></p>
        <p class="text-xs text-slate-400">Công suất: <strong class="text-slate-200 font-mono">${m.power_kw} kW</strong></p>
        <p class="text-xs text-slate-400">Khu vực: <strong class="text-indigo-400">Bay ${m.bay}</strong></p>
      </div>
      <div class="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
        <span class="text-slate-500">Trạng thái:</span>
        <span class="text-emerald-400 font-semibold flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sẵn sàng
        </span>
      </div>
    </div>
  `,
    )
    .join("");
}

// 10. Render View 4: Products Table
function renderProductsTable() {
  const tbody = document.getElementById("products-table-body");
  if (!tbody) return;

  const prods = Object.values(state.products);
  tbody.innerHTML = prods
    .map(
      (p) => `
    <tr class="hover:bg-slate-900/60 transition">
      <td class="p-3 font-mono font-bold text-white">${p.code}</td>
      <td class="p-3 font-semibold text-slate-200">${p.name}</td>
      <td class="p-3 text-slate-300">${p.material.name} (${p.material.resin_id})</td>
      <td class="p-3 font-mono text-amber-300">${p.material.dry_temp}°C (${p.material.dry_hours}h)</td>
      <td class="p-3 text-center">
        ${p.material.is_dry_coat ? '<span class="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">青○ Có</span>' : '<span class="text-slate-600">-</span>'}
      </td>
      <td class="p-3 text-slate-300">${p.box.name} (${p.box.pcs_per_box} cái/thùng)</td>
      <td class="p-3 font-mono text-cyan-300">${p.cavity} cav • ${p.cycle_time_sec}s</td>
      <td class="p-3 text-slate-400 text-[11px]">${(p.compatible_machines || []).join(", ")}</td>
      <td class="p-3">
        ${p.preferred_mode === "BY_PRODUCT" ? `<span class="text-cyan-300 font-bold">👤 ${p.dedicated_operator || "Theo hàng"}</span>` : '<span class="text-slate-400">⚙️ Theo máy</span>'}
      </td>
    </tr>
  `,
    )
    .join("");
}

// 11. Render View 5: Operators Table
function renderOperatorsTable() {
  const tbody = document.getElementById("operators-table-body");
  if (!tbody) return;

  tbody.innerHTML = state.operators
    .map(
      (op) => `
    <tr class="hover:bg-slate-900/60 transition">
      <td class="p-3 font-bold text-white flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">${op.name.charAt(0)}</span>
        ${op.name}
      </td>
      <td class="p-3 font-semibold text-indigo-300">${op.shift}</td>
      <td class="p-3 font-mono text-slate-300">${op.start.toFixed(1)}:00 - ${op.end.toFixed(1)}:00</td>
      <td class="p-3">${op.mode === "BY_PRODUCT" ? '<span class="text-cyan-300 font-bold">👤 Đứng theo con hàng</span>' : '<span class="text-slate-400">⚙️ Trông máy cố định</span>'}</td>
      <td class="p-3 text-slate-300">${op.assigned_product || op.assigned_machine || "Đa năng"}</td>
      <td class="p-3 font-mono text-amber-400">Bậc ${op.skill}</td>
      <td class="p-3 text-center">${op.is_relief ? '<span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">✓ Chạy chuyền</span>' : '<span class="text-slate-600">-</span>'}</td>
    </tr>
  `,
    )
    .join("");
}

// 12. Render View 6: Database & Feedback Logs
async function refreshDbStats() {
  try {
    const [stats, logs] = await Promise.all([
      fetch("/api/db/stats").then((r) => r.json()),
      fetch("/api/feedback/logs").then((r) => r.json()),
    ]);
    state.dbStats = stats;
    state.feedbackLogs = logs;
    renderDatabaseView();
  } catch (e) {
    console.error("Lỗi cập nhật stats DB:", e);
  }
}

function renderDatabaseView() {
  const container = document.getElementById("db-metrics-container");
  if (!container || !state.dbStats.table_counts) return;

  const counts = state.dbStats.table_counts;
  const metrics = [
    {
      label: "Máy Ép (machines)",
      val: counts.machines,
      icon: "fa-industry",
      color: "emerald",
    },
    {
      label: "Nguyên Liệu (materials)",
      val: counts.materials,
      icon: "fa-fire-burner",
      color: "amber",
    },
    {
      label: "Quy Cách Thùng (boxes)",
      val: counts.boxes,
      icon: "fa-box-open",
      color: "purple",
    },
    {
      label: "Sản Phẩm & BOM (products)",
      val: counts.products,
      icon: "fa-cubes-stacked",
      color: "cyan",
    },
    {
      label: "Nhân Sự (operators)",
      val: counts.operators,
      icon: "fa-users",
      color: "indigo",
    },
    {
      label: "Kế Hoạch Ngày (schedules)",
      val: counts.schedules,
      icon: "fa-calendar-days",
      color: "blue",
    },
    {
      label: "Công Đoạn Ép (job_blocks)",
      val: counts.job_blocks,
      icon: "fa-chart-gantt",
      color: "teal",
    },
    {
      label: "Lệnh Xuất Hàng (orders)",
      val: counts.shipping_orders,
      icon: "fa-truck-fast",
      color: "sky",
    },
    {
      label: "Khung Nghỉ (break_schedules)",
      val: counts.break_schedules,
      icon: "fa-mug-hot",
      color: "rose",
    },
    {
      label: "Nhật Ký Tự Học (feedback_logs)",
      val: counts.learning_feedback_logs,
      icon: "fa-graduation-cap",
      color: "yellow",
    },
  ];

  container.innerHTML = metrics
    .map(
      (m) => `
    <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
      <div>
        <span class="text-[11px] text-slate-400">${m.label}</span>
        <p class="text-xl font-black text-${m.color}-400 font-mono mt-0.5">${m.val || 0}</p>
      </div>
      <div class="w-8 h-8 rounded-lg bg-${m.color}-500/10 border border-${m.color}-500/20 flex items-center justify-center text-${m.color}-400">
        <i class="fa-solid ${m.icon}"></i>
      </div>
    </div>
  `,
    )
    .join("");

  const logsBody = document.getElementById("feedback-logs-body");
  if (!logsBody) return;

  if (state.feedbackLogs.length === 0) {
    logsBody.innerHTML = `<tr><td colspan="7" class="p-3 text-center text-slate-500">Chưa có nhật ký tự học nào. Hãy bấm nút 'Huấn Luyện AI' để tạo thử nghiệm!</td></tr>`;
  } else {
    logsBody.innerHTML = state.feedbackLogs
      .map(
        (l) => `
      <tr class="hover:bg-slate-900/60">
        <td class="p-2.5 font-mono text-slate-400 text-[11px]">${l.timestamp}</td>
        <td class="p-2.5 font-bold font-mono text-indigo-300">${l.product_code}</td>
        <td class="p-2.5 text-slate-300">${l.machine_id}</td>
        <td class="p-2.5 text-right font-mono text-rose-400 font-bold">${l.scraps} cái</td>
        <td class="p-2.5 text-right font-mono text-slate-300">${l.actual_run_hours}h</td>
        <td class="p-2.5 text-right font-mono text-emerald-400 font-bold">${l.prev_buffer_pct}% → ${l.new_buffer_pct}%</td>
        <td class="p-2.5 text-slate-300 text-[11px]">${l.note}</td>
      </tr>
    `,
      )
      .join("");
  }
}

// 13. Modal Chi Tiết Job
function openJobDetailModal(jobOrId) {
  const modal = document.getElementById("job-modal");
  if (!modal) return;

  let job =
    typeof jobOrId === "string"
      ? (state.schedule?.jobs || []).find((j) => j.id === jobOrId)
      : jobOrId;

  // Hỗ trợ bấm vào khối tắt máy tự động lấp đầy khoảng trống
  if (!job && typeof jobOrId === "string" && jobOrId.startsWith("auto_stop_")) {
    const parts = jobOrId.split("_");
    const mId = parts[2];
    const sH = parseFloat(parts[3]) || 7.0;
    const eH = parseFloat(parts[4]) || 31.0;
    job = {
      id: jobOrId,
      machine: mId,
      product: "STOP",
      event: "STOP",
      start: sH,
      end: eH,
      op: null,
      prerequisites: {
        material: {
          resin_name: "Không dùng",
          dry_temp: 0,
          dry_hours: 0,
          detail: "Không yêu cầu cấp liệu (Máy tắt tiết kiệm điện)",
        },
        box: {
          box_name: "Không dùng",
          pcs_per_box: 0,
          detail: "Không yêu cầu xuất thùng",
        },
        operator: { mode: "STOP", detail: "Không bố trí thợ đứng máy" },
      },
    };
  }

  if (!job) return;

  document.getElementById("modal-badge-type").innerText = job.event;
  document.getElementById("modal-title").innerText =
    `Lô: ${job.product} (${job.machine})`;

  const prereq = job.prerequisites || {};
  const mat = prereq.material || {};
  const box = prereq.box || {};
  const op = prereq.operator || {};

  document.getElementById("modal-mat-resin").innerText =
    mat.resin_name || `Nhựa ${job.product}`;
  document.getElementById("modal-mat-temp").innerText =
    `Sấy: ${mat.dry_temp || 80}°C (${mat.dry_hours || 3.0}h)${mat.is_dry_coat ? " • Dry Coat (青○)" : ""}`;
  document.getElementById("modal-mat-status").innerText =
    mat.detail || "Đã kiểm tra phễu sấy";

  document.getElementById("modal-box-name").innerText =
    box.box_name || "Thùng tiêu chuẩn";
  document.getElementById("modal-box-pcs").innerText =
    `${box.pcs_per_box || 100} cái / thùng`;
  document.getElementById("modal-box-status").innerText =
    box.detail || "Đã xuất tại line máy";

  document.getElementById("modal-op-name").innerText = job.op || "Chưa gán thợ";
  document.getElementById("modal-op-mode").innerText =
    op.mode === "BY_PRODUCT"
      ? "Đứng theo con hàng (Chuyên trách)"
      : "Trông máy cố định";
  document.getElementById("modal-op-status").innerText =
    op.detail || "Sẵn sàng vận hành";

  document.getElementById("modal-job-details").innerHTML = `
    <div>• Giờ bắt đầu: ${job.start.toFixed(1)}h  |  Giờ kết thúc: ${job.end.toFixed(1)}h (Tổng: ${(job.end - job.start).toFixed(1)} tiếng)</div>
    <div>• Sản lượng kế hoạch: ${job.planned_qty ? job.planned_qty.toLocaleString() + " cái" : "Theo mẻ tiêu chuẩn"}</div>
    <div>• Mã công việc hệ thống: ${job.id}</div>
  `;

  modal.classList.remove("hidden");
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("hidden");
}

// 14. Tạo Lệnh Xuất Hàng Mới
function openAddOrderModal() {
  document.getElementById("add-order-modal").classList.remove("hidden");
}

async function submitNewOrder(e) {
  e.preventDefault();
  const cust = document.getElementById("order-customer").value;
  const prod = document.getElementById("order-product").value;
  const qty = parseInt(document.getElementById("order-qty").value) || 500;
  const dline =
    parseFloat(document.getElementById("order-deadline").value) || 16.0;
  const sDate = document.getElementById("order-date").value;

  try {
    const res = await fetch("/api/shipping-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: cust,
        product: prod,
        order_qty: qty,
        ship_deadline_hour: dline,
        ship_date: sDate,
      }),
    });
    const result = await res.json();
    alert(
      `✅ Đã lưu lệnh xuất hàng ${result.order.order_id} vào Database SQLite!`,
    );
    closeModal("add-order-modal");
    await fetchMasterData();
    await loadCurrentSchedule();
    if (state.currentView === "orders") renderOrdersTable();
  } catch (err) {
    alert("Lỗi tạo lệnh xuất: " + err);
  }
}

// 15. Kích Hoạt AI Tối Ưu Hóa Lập Lịch
async function triggerOptimization() {
  try {
    const res = await fetch("/api/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_date: "2026-11-14" }),
    });
    const data = await res.json();
    alert(
      `🎉 BỘ NÃO AI ĐÃ TỐI ƯU HÓA & LƯU VÀO SQLITE THÀNH CÔNG!\n\n- Đã phân bổ ${data.summary.total_jobs} công đoạn\n- Đảm bảo 1 HÀNG CHỈ CHẠY 1 LẦN TRÊN 1 MÁY\n- Tự động tắt máy (□ 計画停止) tiết kiệm ước tính: ${data.summary.estimated_power_saved_kwh} kWh điện!\n- Đang hiển thị lịch tối ưu hóa...`,
    );

    switchSchedule("optimized");
  } catch (err) {
    alert("Lỗi tối ưu hóa: " + err);
  }
}

// 16. Nhập Dữ Liệu Tự Học & Huấn Luyện AI
function openFeedbackModal() {
  document.getElementById("feedback-modal").classList.remove("hidden");
}

async function submitFeedback(event) {
  event.preventDefault();
  const prod = document.getElementById("fb-product").value;
  const mach = document.getElementById("fb-machine").value;
  const scraps = parseInt(document.getElementById("fb-scraps").value) || 0;
  const actHours =
    parseFloat(document.getElementById("fb-actual-hours").value) || 8.0;

  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_code: prod,
        machine_id: mach,
        scraps: scraps,
        actual_run_hours: actHours,
        planned_run_hours: 8.0,
      }),
    });
    const result = await res.json();
    alert(
      `✅ ${result.message}\n\nHệ số đệm an toàn mới cho ${prod}: ${result.updated_profile.dynamic_safety_stock_pct[prod]}%\nĐã lưu vĩnh viễn vào Database SQLite!`,
    );
    closeModal("feedback-modal");
    await refreshDbStats();
    await loadCurrentSchedule();
  } catch (err) {
    alert("Lỗi cập nhật feedback: " + err);
  }
}

// 17. Re-seed Database
async function reseedDatabase() {
  if (
    !confirm(
      "Bạn có chắc chắn muốn nạp lại dữ liệu gốc từ 4 bảng kế hoạch sản xuất vào Database không?",
    )
  )
    return;
  try {
    const res = await fetch("/api/db/seed", { method: "POST" });
    const data = await res.json();
    alert("✅ Đã khởi tạo lại toàn bộ dữ liệu SQLite Database thành công!");
    await fetchMasterData();
    await loadCurrentSchedule();
    await refreshDbStats();
  } catch (e) {
    alert("Lỗi re-seed DB: " + e);
  }
}

// ==============================================================
// 18. HỆ THỐNG QUẢN TRỊ ADMIN TOÀN DIỆN (FULL ADMIN PORTAL)
// ==============================================================

// Toast Notification
function showToast(msg, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  const color =
    type === "error"
      ? "bg-rose-950 border-rose-500 text-rose-200"
      : "bg-emerald-950 border-emerald-500 text-emerald-200";
  const icon = type === "error" ? "fa-circle-xmark" : "fa-circle-check";
  toast.className = `p-3 rounded-xl border ${color} shadow-2xl flex items-center space-x-2.5 text-xs font-semibold transform transition-all duration-300 translate-y-2 opacity-0 pointer-events-auto max-w-sm`;
  toast.innerHTML = `
    <i class="fa-solid ${icon} text-base flex-shrink-0"></i>
    <span>${msg}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Khởi tạo & Chuyển tab trong trang Admin
function renderAdminPortal() {
  switchAdminTab(state.currentAdminTab || "jobs");
}

function switchAdminTab(tabName) {
  state.currentAdminTab = tabName;
  const tabs = [
    "jobs",
    "machines",
    "products",
    "operators",
    "orders",
    "materials",
  ];
  tabs.forEach((t) => {
    const btn = document.getElementById(`admin-nav-${t}`);
    const sec = document.getElementById(`admin-section-${t}`);
    if (sec) sec.classList.toggle("hidden", t !== tabName);
    if (btn) {
      if (t === tabName) {
        btn.className =
          "px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold shadow flex items-center gap-1.5 transition";
      } else {
        btn.className =
          "px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-1.5 transition";
      }
    }
  });

  if (tabName === "jobs") renderAdminJobsTable();
  if (tabName === "machines") renderAdminMachinesTable();
  if (tabName === "products") renderAdminProductsTable();
  if (tabName === "operators") renderAdminOperatorsTable();
  if (tabName === "orders") renderAdminOrdersTable();
  if (tabName === "materials") {
    renderAdminMaterialsTable();
    renderAdminBoxesTable();
  }
}

// -------------------------------------------------------------
// 18.1. QUẢN LÝ JOBS / ĐIỀU PHỐI LỊCH SẢN XUẤT
// -------------------------------------------------------------
function renderAdminJobsTable() {
  const tbody = document.getElementById("admin-jobs-tbody");
  if (!tbody || !state.schedule) return;

  const dateSelect = document.getElementById("admin-job-date-select");
  if (dateSelect) dateSelect.value = state.currentDate;

  // Điền dropdown lọc máy nếu chưa có
  const machFilter = document.getElementById("admin-job-machine-filter");
  if (machFilter && machFilter.options.length <= 1) {
    state.machines.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.innerText = `${m.id} (${m.tonnage}T - Bay ${m.bay})`;
      machFilter.appendChild(opt);
    });
  }

  const selectedMach = machFilter ? machFilter.value : "";
  const eventFilter = document.getElementById("admin-job-event-filter");
  const selectedEvent = eventFilter ? eventFilter.value : "";

  let jobs = state.schedule.jobs || [];
  if (selectedMach) jobs = jobs.filter((j) => j.machine === selectedMach);
  if (selectedEvent) jobs = jobs.filter((j) => j.event === selectedEvent);

  jobs = [...jobs].sort(
    (a, b) =>
      a.machine.localeCompare(b.machine, undefined, { numeric: true }) ||
      a.start - b.start,
  );

  if (jobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-slate-400 italic">Không có công việc nào phù hợp với bộ lọc hiện tại.</td></tr>`;
    return;
  }

  tbody.innerHTML = jobs
    .map((j) => {
      let eventBadge = "";
      if (j.event === "PROD") {
        eventBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Chạy ép (PROD)</span>`;
      } else if (j.event === "MOLD_CHANGE") {
        eventBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">○ Thay khuôn</span>`;
      } else if (j.event === "COLOR_CHANGE") {
        eventBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">△ Đổi màu</span>`;
      } else {
        eventBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">□ Tắt máy (停止)</span>`;
      }

      const duration = (j.end - j.start).toFixed(1);

      return `
      <tr class="hover:bg-slate-900/60 transition">
        <td class="p-3 font-bold text-white">${j.machine}</td>
        <td class="p-3">${eventBadge}</td>
        <td class="p-3 font-mono font-bold text-amber-300">${j.product || "-"}</td>
        <td class="p-3 font-mono text-slate-200">${formatTimeHour(j.start)} → ${formatTimeHour(j.end)}</td>
        <td class="p-3 text-right font-mono text-cyan-300">${duration}h</td>
        <td class="p-3 text-right font-mono text-slate-300">${j.planned_qty ? j.planned_qty.toLocaleString() : "-"}</td>
        <td class="p-3 text-slate-300">${j.op || '<span class="text-slate-500 italic">Không gán</span>'}</td>
        <td class="p-3 text-center whitespace-nowrap">
          <button onclick="editJob('${j.id}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 mr-1.5 transition" title="Chỉnh sửa job">
            <i class="fa-solid fa-pen-to-square"></i> Sửa
          </button>
          <button onclick="deleteJob('${j.id}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400 border border-slate-700 transition" title="Xóa job">
            <i class="fa-solid fa-trash-can"></i> Xóa
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

async function onAdminJobDateChange(val) {
  state.currentDate = val;
  await loadCurrentSchedule();
  renderAdminJobsTable();
}

function onJobEventChange(ev) {
  const prodSelect = document.getElementById("ajob-product");
  const qtyInput = document.getElementById("ajob-qty");
  if (ev === "STOP") {
    if (prodSelect) prodSelect.value = "STOP";
    if (qtyInput) qtyInput.value = 0;
  }
}

function openAddJobModal(job = null) {
  const modal = document.getElementById("admin-job-modal");
  if (!modal) return;

  const machSelect = document.getElementById("ajob-machine");
  const prodSelect = document.getElementById("ajob-product");
  const opSelect = document.getElementById("ajob-op");
  const titleEl = document.getElementById("admin-job-modal-title");

  // Populate machines
  machSelect.innerHTML = state.machines
    .map(
      (m) =>
        `<option value="${m.id}">${m.id} (${m.tonnage}T - Bay ${m.bay})</option>`,
    )
    .join("");

  // Populate products
  const prods = Object.values(state.products);
  prodSelect.innerHTML =
    `<option value="STOP">STOP (Tắt máy □)</option>` +
    prods
      .map((p) => `<option value="${p.code}">${p.code} - ${p.name}</option>`)
      .join("");

  // Populate operators
  opSelect.innerHTML =
    `<option value="">(Không gán thợ / Tắt máy)</option>` +
    state.operators
      .map(
        (op) => `<option value="${op.name}">${op.name} (${op.shift})</option>`,
      )
      .join("");

  if (job) {
    if (titleEl) titleEl.innerText = "Chỉnh Sửa Công Việc Sản Xuất";
    document.getElementById("ajob-id").value = job.id;
    document.getElementById("ajob-schedule-id").value = state.currentDate;
    machSelect.value = job.machine;
    document.getElementById("ajob-event").value = job.event;
    prodSelect.value = job.product;
    document.getElementById("ajob-start").value = job.start;
    document.getElementById("ajob-end").value = job.end;
    document.getElementById("ajob-qty").value = job.planned_qty || 0;
    opSelect.value = job.op || "";
  } else {
    if (titleEl) titleEl.innerText = "Thêm Công Việc Mới Vào Lịch Trình";
    document.getElementById("ajob-id").value = "";
    document.getElementById("ajob-schedule-id").value = state.currentDate;
    machSelect.value = state.machines[0]?.id || "2号機";
    document.getElementById("ajob-event").value = "PROD";
    prodSelect.value = prods[0]?.code || "W165";
    document.getElementById("ajob-start").value = 7.0;
    document.getElementById("ajob-end").value = 15.0;
    document.getElementById("ajob-qty").value = 500;
    opSelect.value = "";
  }

  modal.classList.remove("hidden");
}

function editJob(jobId) {
  const job = (state.schedule?.jobs || []).find((j) => j.id === jobId);
  if (job) openAddJobModal(job);
}

async function submitAdminJob(e) {
  e.preventDefault();
  const jId = document.getElementById("ajob-id").value;
  const schedId = document.getElementById("ajob-schedule-id").value;
  const machine = document.getElementById("ajob-machine").value;
  const eventType = document.getElementById("ajob-event").value;
  const product = document.getElementById("ajob-product").value;
  const start = parseFloat(document.getElementById("ajob-start").value);
  const end = parseFloat(document.getElementById("ajob-end").value);
  const qty = parseInt(document.getElementById("ajob-qty").value) || 0;
  const op = document.getElementById("ajob-op").value || null;

  if (end <= start) {
    alert("Giờ kết thúc phải lớn hơn giờ bắt đầu!");
    return;
  }

  const payload = {
    id: jId || undefined,
    schedule_id: schedId,
    machine: machine,
    event: eventType,
    product: product,
    start: start,
    end: end,
    planned_qty: qty,
    op: op,
  };

  try {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    closeModal("admin-job-modal");
    await loadCurrentSchedule();
    renderAdminJobsTable();
    showToast(`✅ Đã lưu công đoạn [${machine}: ${product}] thành công!`);
  } catch (err) {
    alert("Lỗi lưu job: " + err);
  }
}

async function deleteJob(jobId) {
  if (!confirm(`Bạn có chắc chắn muốn xóa công đoạn này khỏi lịch sản xuất?`))
    return;

  try {
    const res = await fetch("/api/jobs/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: jobId }),
    });
    await loadCurrentSchedule();
    renderAdminJobsTable();
    showToast("🗑️ Đã xóa công đoạn thành công!");
  } catch (err) {
    alert("Lỗi xóa job: " + err);
  }
}

// -------------------------------------------------------------
// 18.2. QUẢN LÝ 22 MÁY ÉP (MACHINES)
// -------------------------------------------------------------
function renderAdminMachinesTable() {
  const tbody = document.getElementById("admin-machines-tbody");
  if (!tbody || !state.machines) return;

  tbody.innerHTML = state.machines
    .map((m) => {
      let statusBadge = "";
      if (m.status === "RUNNING")
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Đang chạy</span>`;
      else if (m.status === "SETUP_MOLD")
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Thay khuôn</span>`;
      else if (m.status === "SETUP_COLOR")
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Đổi màu</span>`;
      else
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-rose-400 border border-rose-500/30">Tắt máy</span>`;

      return `
      <tr class="hover:bg-slate-900/60 transition">
        <td class="p-3 font-bold text-white flex items-center gap-1.5">
          <span>${m.id}</span>
          ${m.is_new ? '<span class="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded font-bold">新</span>' : ""}
        </td>
        <td class="p-3 text-right font-mono font-bold text-slate-200">${m.tonnage}T</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">Khu Bay ${m.bay}</span>
        </td>
        <td class="p-3">${m.is_new ? '<span class="text-blue-300 font-semibold">Máy thế hệ mới</span>' : '<span class="text-slate-400">Máy tiêu chuẩn</span>'}</td>
        <td class="p-3 text-right font-mono text-cyan-300">${m.power_kw || 22} kW</td>
        <td class="p-3">${statusBadge}</td>
        <td class="p-3 text-center whitespace-nowrap">
          <button onclick="editMachine('${m.id}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 mr-1.5 transition">
            <i class="fa-solid fa-pen-to-square"></i> Sửa
          </button>
          <button onclick="deleteMachine('${m.id}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400 border border-slate-700 transition">
            <i class="fa-solid fa-trash-can"></i> Xóa
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

function openAddMachineModal(mId = null) {
  const modal = document.getElementById("admin-machine-modal");
  if (!modal) return;

  const idInput = document.getElementById("amach-id");
  const titleEl = document.getElementById("admin-machine-modal-title");

  if (mId) {
    const mach = state.machines.find((m) => m.id === mId);
    if (!mach) return;
    if (titleEl) titleEl.innerText = `Chỉnh Sửa Máy Ép [${mId}]`;
    idInput.value = mach.id;
    idInput.readOnly = true;
    document.getElementById("amach-tonnage").value = mach.tonnage;
    document.getElementById("amach-bay").value = mach.bay;
    document.getElementById("amach-power").value = mach.power_kw || 22.0;
    document.getElementById("amach-is-new").checked = bool(mach.is_new);
    document.getElementById("amach-status").value =
      mach.status || "PLANNED_STOP";
  } else {
    if (titleEl) titleEl.innerText = "Thêm Máy Ép Mới";
    idInput.value = "";
    idInput.readOnly = false;
    document.getElementById("amach-tonnage").value = 110;
    document.getElementById("amach-bay").value = "A";
    document.getElementById("amach-power").value = 22.0;
    document.getElementById("amach-is-new").checked = false;
    document.getElementById("amach-status").value = "PLANNED_STOP";
  }

  modal.classList.remove("hidden");
}

function editMachine(mId) {
  openAddMachineModal(mId);
}

async function submitAdminMachine(e) {
  e.preventDefault();
  const id = document.getElementById("amach-id").value.trim();
  const tonnage = parseInt(document.getElementById("amach-tonnage").value);
  const bay = document.getElementById("amach-bay").value;
  const power =
    parseFloat(document.getElementById("amach-power").value) || 22.0;
  const isNew = document.getElementById("amach-is-new").checked;
  const status = document.getElementById("amach-status").value;

  const payload = {
    id: id,
    tonnage: tonnage,
    bay: bay,
    power_kw: power,
    is_new: isNew,
    status: status,
  };

  try {
    const res = await fetch("/api/machines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    closeModal("admin-machine-modal");
    await fetchMasterData();
    renderAdminMachinesTable();
    renderGanttBoard();
    showToast(`✅ Đã lưu máy ép [${id}] thành công!`);
  } catch (err) {
    alert("Lỗi lưu máy ép: " + err);
  }
}

async function deleteMachine(mId) {
  if (!confirm(`Bạn có chắc muốn xóa máy [${mId}] khỏi hệ thống?`)) return;

  try {
    await fetch("/api/machines/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: mId }),
    });
    await fetchMasterData();
    renderAdminMachinesTable();
    renderGanttBoard();
    showToast(`🗑️ Đã xóa máy [${mId}] thành công!`);
  } catch (err) {
    alert("Lỗi xóa máy ép: " + err);
  }
}

// -------------------------------------------------------------
// 18.3. QUẢN LÝ CON HÀNG & ĐỊNH MỨC BOM (PRODUCTS)
// -------------------------------------------------------------
function renderAdminProductsTable() {
  const tbody = document.getElementById("admin-products-tbody");
  if (!tbody || !state.products) return;

  const prods = Object.values(state.products);
  tbody.innerHTML = prods
    .map((p) => {
      return `
      <tr class="hover:bg-slate-900/60 transition">
        <td class="p-3 font-mono font-black text-amber-300">${p.code}</td>
        <td class="p-3 font-semibold text-white">${p.name}</td>
        <td class="p-3">
          <span class="text-slate-200 font-medium">${p.material.name}</span>
          <span class="text-[10px] text-slate-400 font-mono block">${p.material.resin_id} • ${p.material.color}</span>
        </td>
        <td class="p-3 font-mono text-amber-300">
          ${p.material.dry_temp}°C (${p.material.dry_hours}h)
          ${p.material.is_dry_coat ? '<span class="text-[10px] text-blue-400 ml-1 font-bold">青○</span>' : ""}
        </td>
        <td class="p-3">
          <span class="text-slate-300">${p.box.name}</span>
          <span class="text-[10px] text-cyan-300 font-mono block font-bold">${p.box.pcs_per_box} cái/thùng</span>
        </td>
        <td class="p-3 font-mono text-slate-300">${p.cavity} cav • ${p.cycle_time_sec}s</td>
        <td class="p-3 text-[11px]">
          ${p.preferred_mode === "BY_PRODUCT" ? `<span class="text-cyan-300 font-bold">👤 ${p.dedicated_operator || "Theo hàng"}</span>` : '<span class="text-slate-400">⚙️ Theo máy</span>'}
        </td>
        <td class="p-3 text-right font-mono text-emerald-400 font-bold">+${p.defect_buffer_pct}%</td>
        <td class="p-3 text-slate-400 text-[10px] max-w-[140px] truncate" title="${(p.compatible_machines || []).join(", ")}">
          ${(p.compatible_machines || []).join(", ")}
        </td>
        <td class="p-3 text-center whitespace-nowrap">
          <button onclick="editProduct('${p.code}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 mr-1.5 transition">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button onclick="deleteProduct('${p.code}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400 border border-slate-700 transition">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

function openAddProductModal(code = null) {
  const modal = document.getElementById("admin-product-modal");
  if (!modal) return;

  const matSelect = document.getElementById("aprod-material");
  const boxSelect = document.getElementById("aprod-box");
  const opSelect = document.getElementById("aprod-dedicated-op");
  const machContainer = document.getElementById("aprod-machines-container");
  const codeInput = document.getElementById("aprod-code");
  const titleEl = document.getElementById("admin-product-modal-title");

  // Populate materials
  matSelect.innerHTML = (state.materials || [])
    .map(
      (m) =>
        `<option value="${m.id}">${m.id} - ${m.resin_name} (${m.dry_temp_celsius}°C)</option>`,
    )
    .join("");

  // Populate boxes
  boxSelect.innerHTML = (state.boxes || [])
    .map(
      (b) =>
        `<option value="${b.id}">${b.id} - ${b.box_name} (${b.pcs_per_box} cái)</option>`,
    )
    .join("");

  // Populate operators
  opSelect.innerHTML =
    `<option value="">(Không chỉ định)</option>` +
    state.operators
      .map((op) => `<option value="${op.name}">${op.name}</option>`)
      .join("");

  const existing = code ? state.products[code] : null;

  // Populate machine checkboxes
  machContainer.innerHTML = state.machines
    .map((m) => {
      const isChecked = existing
        ? (existing.compatible_machines || []).includes(m.id)
        : true;
      return `
      <label class="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[11px] cursor-pointer hover:bg-slate-800">
        <input type="checkbox" name="aprod-mach" value="${m.id}" ${isChecked ? "checked" : ""} class="accent-indigo-500 rounded">
        <span class="text-slate-200 font-bold">${m.id}</span>
      </label>
    `;
    })
    .join("");

  if (existing) {
    if (titleEl) titleEl.innerText = `Chỉnh Sửa Con Hàng & BOM [${code}]`;
    codeInput.value = existing.code;
    codeInput.readOnly = true;
    document.getElementById("aprod-name").value = existing.name;
    matSelect.value = existing.material?.resin_id || "";
    boxSelect.value = existing.box?.box_id || "";
    document.getElementById("aprod-cycle").value = existing.cycle_time_sec;
    document.getElementById("aprod-cavity").value = existing.cavity;
    document.getElementById("aprod-buffer").value = existing.defect_buffer_pct;
    document.getElementById("aprod-mode").value =
      existing.preferred_mode || "BY_MACHINE";
    opSelect.value = existing.dedicated_operator || "";
  } else {
    if (titleEl) titleEl.innerText = "Thêm Con Hàng & Định Mức BOM Mới";
    codeInput.value = "";
    codeInput.readOnly = false;
    document.getElementById("aprod-name").value = "";
    document.getElementById("aprod-cycle").value = 35.0;
    document.getElementById("aprod-cavity").value = 2;
    document.getElementById("aprod-buffer").value = 3.0;
    document.getElementById("aprod-mode").value = "BY_MACHINE";
    opSelect.value = "";
  }

  modal.classList.remove("hidden");
}

function editProduct(code) {
  openAddProductModal(code);
}

async function submitAdminProduct(e) {
  e.preventDefault();
  const code = document.getElementById("aprod-code").value.trim();
  const name = document.getElementById("aprod-name").value.trim();
  const matId = document.getElementById("aprod-material").value;
  const boxId = document.getElementById("aprod-box").value;
  const cycle = parseFloat(document.getElementById("aprod-cycle").value);
  const cavity = parseInt(document.getElementById("aprod-cavity").value);
  const buffer = parseFloat(document.getElementById("aprod-buffer").value);
  const mode = document.getElementById("aprod-mode").value;
  const dedicatedOp =
    document.getElementById("aprod-dedicated-op").value || null;

  const checkedMachines = Array.from(
    document.querySelectorAll("input[name='aprod-mach']:checked"),
  ).map((cb) => cb.value);

  const payload = {
    code: code,
    name: name,
    material_id: matId,
    box_id: boxId,
    cycle_time_sec: cycle,
    cavity: cavity,
    defect_buffer_pct: buffer,
    preferred_mode: mode,
    dedicated_operator_name: dedicatedOp,
    compatible_machines: checkedMachines,
  };

  try {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    closeModal("admin-product-modal");
    await fetchMasterData();
    renderAdminProductsTable();
    showToast(`✅ Đã lưu con hàng & BOM [${code}] thành công!`);
  } catch (err) {
    alert("Lỗi lưu sản phẩm: " + err);
  }
}

async function deleteProduct(code) {
  if (!confirm(`Bạn có chắc muốn xóa mã hàng [${code}] khỏi hệ thống?`)) return;

  try {
    await fetch("/api/products/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code }),
    });
    await fetchMasterData();
    renderAdminProductsTable();
    showToast(`🗑️ Đã xóa mã hàng [${code}] thành công!`);
  } catch (err) {
    alert("Lỗi xóa con hàng: " + err);
  }
}

// -------------------------------------------------------------
// 18.4. QUẢN LÝ NHÂN SỰ & CA KÍP (OPERATORS)
// -------------------------------------------------------------
function renderAdminOperatorsTable() {
  const tbody = document.getElementById("admin-operators-tbody");
  if (!tbody || !state.operators) return;

  tbody.innerHTML = state.operators
    .map((op) => {
      let shiftBadge = "";
      if (op.shift === "DAY")
        shiftBadge = `<span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">Ca Ngày</span>`;
      else if (op.shift === "NIGHT")
        shiftBadge = `<span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">Ca Đêm</span>`;
      else if (op.shift === "DAY_OT")
        shiftBadge = `<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">Tăng Ca</span>`;
      else
        shiftBadge = `<span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">Bán Thời Gian</span>`;

      let skillText =
        op.skill === 3
          ? "Bậc 3 (Trưởng ca / Setup)"
          : op.skill === 2
            ? "Bậc 2 (Đứng máy chính)"
            : "Bậc 1 (Phụ máy)";

      return `
      <tr class="hover:bg-slate-900/60 transition">
        <td class="p-3 font-bold text-white">${op.name}</td>
        <td class="p-3">${shiftBadge}</td>
        <td class="p-3 font-mono text-slate-200">${formatTimeHour(op.start)} → ${formatTimeHour(op.end)}</td>
        <td class="p-3 text-[11px] text-slate-300">${op.mode === "BY_PRODUCT" ? "Theo con hàng" : "Trông máy"}</td>
        <td class="p-3 text-slate-300 font-mono">${op.assigned_product || op.assigned_machine || '<span class="text-slate-500 italic">Linh hoạt</span>'}</td>
        <td class="p-3 text-slate-300 text-[11px]">${skillText}</td>
        <td class="p-3 text-center">
          ${op.is_relief ? '<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">Relief Có</span>' : '<span class="text-slate-600">-</span>'}
        </td>
        <td class="p-3 text-center whitespace-nowrap">
          <button onclick="editOperator('${op.name}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 mr-1.5 transition">
            <i class="fa-solid fa-pen-to-square"></i> Sửa
          </button>
          <button onclick="deleteOperator('${op.id || op.name}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400 border border-slate-700 transition">
            <i class="fa-solid fa-trash-can"></i> Xóa
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

function openAddOperatorModal(name = null) {
  const modal = document.getElementById("admin-operator-modal");
  if (!modal) return;

  const machSelect = document.getElementById("aop-assigned-mach");
  const prodSelect = document.getElementById("aop-assigned-prod");
  const titleEl = document.getElementById("admin-operator-modal-title");

  // Populate machines
  machSelect.innerHTML =
    `<option value="">(Không cố định)</option>` +
    state.machines
      .map((m) => `<option value="${m.id}">${m.id}</option>`)
      .join("");

  // Populate products
  prodSelect.innerHTML =
    `<option value="">(Không cố định)</option>` +
    Object.keys(state.products)
      .map((code) => `<option value="${code}">${code}</option>`)
      .join("");

  if (name) {
    const op = state.operators.find((o) => o.name === name);
    if (!op) return;
    if (titleEl) titleEl.innerText = `Chỉnh Sửa Nhân Sự [${name}]`;
    document.getElementById("aop-id").value = op.id || "";
    document.getElementById("aop-name").value = op.name;
    document.getElementById("aop-shift").value = op.shift;
    document.getElementById("aop-start").value = op.start;
    document.getElementById("aop-end").value = op.end;
    document.getElementById("aop-mode").value = op.mode || "BY_MACHINE";
    machSelect.value = op.assigned_machine || "";
    prodSelect.value = op.assigned_product || "";
    document.getElementById("aop-skill").value = op.skill || 2;
    document.getElementById("aop-relief").checked = bool(op.is_relief);
  } else {
    if (titleEl) titleEl.innerText = "Thêm Nhân Sự Mới";
    document.getElementById("aop-id").value = "";
    document.getElementById("aop-name").value = "";
    document.getElementById("aop-shift").value = "DAY";
    document.getElementById("aop-start").value = 8.0;
    document.getElementById("aop-end").value = 17.0;
    document.getElementById("aop-mode").value = "BY_MACHINE";
    machSelect.value = "";
    prodSelect.value = "";
    document.getElementById("aop-skill").value = 2;
    document.getElementById("aop-relief").checked = false;
  }

  modal.classList.remove("hidden");
}

function editOperator(name) {
  openAddOperatorModal(name);
}

async function submitAdminOperator(e) {
  e.preventDefault();
  const id = document.getElementById("aop-id").value;
  const name = document.getElementById("aop-name").value.trim();
  const shift = document.getElementById("aop-shift").value;
  const start = parseFloat(document.getElementById("aop-start").value);
  const end = parseFloat(document.getElementById("aop-end").value);
  const mode = document.getElementById("aop-mode").value;
  const mach = document.getElementById("aop-assigned-mach").value || null;
  const prod = document.getElementById("aop-assigned-prod").value || null;
  const skill = parseInt(document.getElementById("aop-skill").value);
  const isRelief = document.getElementById("aop-relief").checked;

  const payload = {
    id: id ? parseInt(id) : undefined,
    name: name,
    shift: shift,
    start: start,
    end: end,
    mode: mode,
    assigned_machine: mach,
    assigned_product: prod,
    skill: skill,
    is_relief: isRelief,
  };

  try {
    await fetch("/api/operators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    closeModal("admin-operator-modal");
    await fetchMasterData();
    renderAdminOperatorsTable();
    showToast(`✅ Đã lưu thông tin nhân sự [${name}] thành công!`);
  } catch (err) {
    alert("Lỗi lưu nhân sự: " + err);
  }
}

async function deleteOperator(idOrName) {
  if (!confirm(`Bạn có chắc muốn xóa nhân sự này khỏi hệ thống?`)) return;

  try {
    await fetch("/api/operators/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: idOrName }),
    });
    await fetchMasterData();
    renderAdminOperatorsTable();
    showToast(`🗑️ Đã xóa nhân sự thành công!`);
  } catch (err) {
    alert("Lỗi xóa nhân sự: " + err);
  }
}

// -------------------------------------------------------------
// 18.5. QUẢN LÝ LỆNH XUẤT HÀNG (ORDERS)
// -------------------------------------------------------------
function renderAdminOrdersTable() {
  const tbody = document.getElementById("admin-orders-tbody");
  if (!tbody || !state.shippingOrders) return;

  tbody.innerHTML = state.shippingOrders
    .map((o) => {
      let statusBadge = "";
      if (o.status === "READY" || o.status === "READY_TO_SHIP") {
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Sẵn sàng giao</span>`;
      } else if (o.status === "IN_PRODUCTION") {
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Đang ép</span>`;
      } else {
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Đang chuẩn bị</span>`;
      }

      return `
      <tr class="hover:bg-slate-900/60 transition">
        <td class="p-3 font-mono font-bold text-cyan-300">${o.order_id}</td>
        <td class="p-3 font-semibold text-white">${o.customer}</td>
        <td class="p-3 font-mono font-bold text-amber-300">${o.product}</td>
        <td class="p-3 text-right font-mono font-bold text-white">${o.order_qty.toLocaleString()} cái</td>
        <td class="p-3 font-mono text-slate-300">${o.ship_date} (${formatTimeHour(o.ship_deadline_hour)})</td>
        <td class="p-3 text-slate-300 text-[11px]">${o.box_name} (${o.boxes_required} thùng)</td>
        <td class="p-3 text-center">${statusBadge}</td>
        <td class="p-3 text-center whitespace-nowrap">
          <button onclick="deleteOrder('${o.order_id}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400 border border-slate-700 transition" title="Xóa lệnh">
            <i class="fa-solid fa-trash-can"></i> Xóa
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

async function deleteOrder(orderId) {
  if (!confirm(`Bạn có chắc muốn xóa lệnh xuất hàng [${orderId}]?`)) return;

  try {
    await fetch("/api/shipping-orders/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });
    await fetchMasterData();
    renderAdminOrdersTable();
    renderOrdersTable();
    showToast(`🗑️ Đã xóa lệnh xuất [${orderId}] thành công!`);
  } catch (err) {
    alert("Lỗi xóa lệnh xuất: " + err);
  }
}

// -------------------------------------------------------------
// 18.6. QUẢN LÝ HẠT NHỰA & THÙNG BAO BÌ
// -------------------------------------------------------------
function renderAdminMaterialsTable() {
  const tbody = document.getElementById("admin-materials-tbody");
  if (!tbody || !state.materials) return;

  tbody.innerHTML = state.materials
    .map(
      (m) => `
    <tr class="hover:bg-slate-900/60 transition text-xs">
      <td class="p-2 font-mono font-bold text-amber-300">${m.id}</td>
      <td class="p-2 text-white font-medium">${m.resin_name}</td>
      <td class="p-2 text-slate-300">${m.color_code || "-"}</td>
      <td class="p-2 font-mono text-cyan-300">${m.dry_temp_celsius}°C (${m.dry_time_hours}h)</td>
      <td class="p-2 text-center">${m.is_dry_coat ? '<span class="text-blue-400 font-bold">青○</span>' : "-"}</td>
      <td class="p-2 text-center">
        <button onclick="deleteMaterial('${m.id}')" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400">
          <i class="fa-solid fa-trash-can text-[10px]"></i>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function renderAdminBoxesTable() {
  const tbody = document.getElementById("admin-boxes-tbody");
  if (!tbody || !state.boxes) return;

  tbody.innerHTML = state.boxes
    .map(
      (b) => `
    <tr class="hover:bg-slate-900/60 transition text-xs">
      <td class="p-2 font-mono font-bold text-purple-300">${b.id}</td>
      <td class="p-2 text-white font-medium">${b.box_name}</td>
      <td class="p-2 text-right font-mono text-cyan-300 font-bold">${b.pcs_per_box} cái</td>
      <td class="p-2 text-right font-mono text-slate-300">${b.staging_lead_hours}h</td>
      <td class="p-2 text-right font-mono text-emerald-400 font-bold">${(b.inventory_qty || 0).toLocaleString()}</td>
      <td class="p-2 text-center">
        <button onclick="deleteBox('${b.id}')" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400">
          <i class="fa-solid fa-trash-can text-[10px]"></i>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function openAddMaterialModal() {
  document.getElementById("admin-material-modal").classList.remove("hidden");
}

async function submitAdminMaterial(e) {
  e.preventDefault();
  const id = document.getElementById("amat-id").value.trim();
  const name = document.getElementById("amat-name").value.trim();
  const color = document.getElementById("amat-color").value.trim();
  const temp = parseInt(document.getElementById("amat-temp").value);
  const hours = parseFloat(document.getElementById("amat-hours").value);
  const drycoat = document.getElementById("amat-drycoat").checked;

  try {
    await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
        resin_name: name,
        color_code: color,
        dry_temp_celsius: temp,
        dry_time_hours: hours,
        is_dry_coat: drycoat,
      }),
    });
    closeModal("admin-material-modal");
    await fetchMasterData();
    renderAdminMaterialsTable();
    showToast(`✅ Đã lưu loại hạt nhựa [${id}] thành công!`);
  } catch (err) {
    alert("Lỗi lưu hạt nhựa: " + err);
  }
}

async function deleteMaterial(matId) {
  if (!confirm(`Bạn có chắc muốn xóa hạt nhựa [${matId}]?`)) return;

  try {
    await fetch("/api/materials/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: matId }),
    });
    await fetchMasterData();
    renderAdminMaterialsTable();
    showToast(`🗑️ Đã xóa hạt nhựa [${matId}]!`);
  } catch (err) {
    alert("Lỗi xóa hạt nhựa: " + err);
  }
}

function openAddBoxModal() {
  document.getElementById("admin-box-modal").classList.remove("hidden");
}

async function submitAdminBox(e) {
  e.preventDefault();
  const id = document.getElementById("abox-id").value.trim();
  const name = document.getElementById("abox-name").value.trim();
  const pcs = parseInt(document.getElementById("abox-pcs").value);
  const staging = parseFloat(document.getElementById("abox-staging").value);
  const inv = parseInt(document.getElementById("abox-inv").value) || 0;

  try {
    await fetch("/api/boxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
        box_name: name,
        pcs_per_box: pcs,
        staging_lead_hours: staging,
        inventory_qty: inv,
      }),
    });
    closeModal("admin-box-modal");
    await fetchMasterData();
    renderAdminBoxesTable();
    showToast(`✅ Đã lưu quy cách thùng [${id}] thành công!`);
  } catch (err) {
    alert("Lỗi lưu thùng: " + err);
  }
}

async function deleteBox(boxId) {
  if (!confirm(`Bạn có chắc muốn xóa thùng [${boxId}]?`)) return;

  try {
    await fetch("/api/boxes/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: boxId }),
    });
    await fetchMasterData();
    renderAdminBoxesTable();
    showToast(`🗑️ Đã xóa quy cách thùng [${boxId}]!`);
  } catch (err) {
    alert("Lỗi xóa thùng: " + err);
  }
}
