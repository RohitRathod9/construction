import { Worker, Attendance, Payment } from "./mockData";
import { storage } from "./storage";

export function generateWorkerReport(worker: Worker, month?: string) {
  const site = storage.getSites().find(s => s.id === worker.siteId);
  const allAttendance = storage.getAttendance();
  const allPayments = storage.getPayments();

  // Filter by month if provided (format: YYYY-MM)
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  
  const workerAttendance = allAttendance
    .filter(a => a.workerId === worker.id && a.date.startsWith(targetMonth))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const workerPayments = allPayments
    .filter(p => p.workerId === worker.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate totals
  const totalHours = workerAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
  const totalDays = workerAttendance.length;

  let totalEarned = 0;
  if (worker.wageType === "hourly") {
    totalEarned = totalHours * worker.wageValue;
  } else if (worker.wageType === "daily") {
    totalEarned = totalDays * worker.wageValue;
  } else if (worker.wageType === "monthly") {
    totalEarned = worker.wageValue;
  }

  const totalPaid = workerPayments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = totalEarned - totalPaid;

  const margin = 40;
  const width = 1000;
  let y = margin;

  const addHeading = (text: string) => {
    const t = `<text x="${margin}" y="${y}" font-family="Arial" font-size="16" font-weight="bold" fill="black">${text}</text>`;
    y += 28;
    return t;
  };

  const addKV = (label: string, value: string, valueX: number) => {
    const t1 = `<text x="${margin}" y="${y}" font-family="Arial" font-size="12" fill="black">${label}</text>`;
    const t2 = `<text x="${valueX}" y="${y}" font-family="Arial" font-size="12" fill="black">${value}</text>`;
    y += 18;
    return t1 + t2;
  };

  const addRow = (cols: string[], xs: number[]) => {
    let t = "";
    cols.forEach((c, i) => {
      t += `<text x="${xs[i]}" y="${y}" font-family="Arial" font-size="12" fill="black">${c}</text>`;
    });
    y += 18;
    return t;
  };

  let content = "";

  // Worker Information (two-column, no borders)
  content += addHeading(worker.fullName);
  const valueX = margin + 260;
  content += addKV("Site:", site?.name || "N/A", valueX);
  content += addKV("Role:", worker.role, valueX);
  content += addKV("Phone:", worker.phone || "", valueX);
  content += addKV("Join Date:", new Date(worker.joinDate).toLocaleDateString(), valueX);
  content += addKV("Wage:", `${worker.wageType.charAt(0).toUpperCase()}${worker.wageType.slice(1)} – ₹${worker.wageValue}`, valueX);
  y += 16;

  content += addHeading("Attendance");
  const attXs = [margin, margin + 120, margin + 210, margin + 300, margin + 360];
  content += addRow(["Date", "Time In", "Time Out", "Hours", "Status"], attXs);
  workerAttendance.forEach(a => {
    const d = new Date(a.date);
    const day = d.getDate().toString();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear().toString();
    const timeIn = new Date(a.timeIn).toTimeString().slice(0, 5);
    const timeOut = a.timeOut ? new Date(a.timeOut).toTimeString().slice(0, 5) : "";
    const hours = a.totalHours ? `${a.totalHours}` : "";
    const status = a.timeOut ? "Present" : "Active";

    content += `<text x="${attXs[0]}" y="${y}" font-family="Arial" font-size="12" font-weight="bold" fill="black">${day}</text>`;
    content += `<text x="${attXs[0] + 24}" y="${y}" font-family="Arial" font-size="12" fill="black">${month} ${year}</text>`;
    content += `<text x="${attXs[1]}" y="${y}" font-family="Arial" font-size="12" fill="black">${timeIn}</text>`;
    content += `<text x="${attXs[2]}" y="${y}" font-family="Arial" font-size="12" fill="black">${timeOut}</text>`;
    content += `<text x="${attXs[3]}" y="${y}" font-family="Arial" font-size="12" fill="black">${hours}</text>`;
    content += `<text x="${attXs[4]}" y="${y}" font-family="Arial" font-size="12" fill="black">${status}</text>`;
    y += 16;
  });
  y += 16;

  content += addHeading("Payments");
  const payXs = [margin, margin + 150, margin + 240, margin + 320, margin + 400];
  content += addRow(["Date", "Amount", "Type", "Method", "Status"], payXs);
  workerPayments.forEach(p => {
    const d = new Date(p.date);
    const day = d.getDate().toString();
    const month = d.toLocaleString("en-US", { month: "short" });
    const colsDate = `<text x="${payXs[0]}" y="${y}" font-family="Arial" font-size="12" font-weight="bold" fill="black">${day}</text>` +
      `<text x="${payXs[0] + 24}" y="${y}" font-family="Arial" font-size="12" fill="black">${month}</text>`;
    content += colsDate;
    content += `<text x="${payXs[1]}" y="${y}" font-family="Arial" font-size="12" fill="black">₹${p.amount}</text>`;
    content += `<text x="${payXs[2]}" y="${y}" font-family="Arial" font-size="12" fill="black">${p.type}</text>`;
    content += `<text x="${payXs[3]}" y="${y}" font-family="Arial" font-size="12" fill="black">${p.method || ""}</text>`;
    content += `<text x="${payXs[4]}" y="${y}" font-family="Arial" font-size="12" fill="black">${p.status}</text>`;
    y += 16;
  });
  y += 16;

  content += addHeading("Summary");
  const sumX = margin + 300;
  content += addKV("Total Days Worked:", `${totalDays}`, sumX);
  content += addKV("Total Hours Worked:", `${totalHours.toFixed(2)}`, sumX);
  content += addKV("Total Pending:", `₹${(totalEarned - totalPaid).toFixed(2)}`, sumX);
  content += addKV("Total Paid:", `₹${totalPaid.toFixed(2)}`, sumX);
  content += addKV("Net Payable:", `₹${Math.max(0, totalEarned - totalPaid).toFixed(2)}`, sumX);

  const height = Math.max(800, y + margin);
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

  return svg;
}

export function downloadWorkerReport(worker: Worker, month?: string) {
  const svg = generateWorkerReport(worker, month);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${worker.fullName.replace(/\s+/g, "_")}_report_${month || new Date().toISOString().slice(0, 7)}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}
