import { Site, Worker, Attendance, Payment, AuditLog } from "./mockData";

export const storage = {
  getSites: (): Site[] => JSON.parse(localStorage.getItem("crb_sites") || "[]"),
  setSites: (sites: Site[]) => localStorage.setItem("crb_sites", JSON.stringify(sites)),
  
  getWorkers: (): Worker[] => JSON.parse(localStorage.getItem("crb_workers") || "[]"),
  setWorkers: (workers: Worker[]) => localStorage.setItem("crb_workers", JSON.stringify(workers)),
  
  getAttendance: (): Attendance[] => JSON.parse(localStorage.getItem("crb_attendance") || "[]"),
  setAttendance: (attendance: Attendance[]) => localStorage.setItem("crb_attendance", JSON.stringify(attendance)),
  
  getPayments: (): Payment[] => JSON.parse(localStorage.getItem("crb_payments") || "[]"),
  setPayments: (payments: Payment[]) => localStorage.setItem("crb_payments", JSON.stringify(payments)),
  
  getAuditLogs: (): AuditLog[] => JSON.parse(localStorage.getItem("crb_auditLogs") || "[]"),
  setAuditLogs: (logs: AuditLog[]) => localStorage.setItem("crb_auditLogs", JSON.stringify(logs)),
  
  addAuditLog: (action: string, details: string) => {
    const logs = storage.getAuditLogs();
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      action,
      timestamp: new Date().toISOString(),
      adminUid: "admin_001",
      details
    };
    logs.unshift(newLog);
    storage.setAuditLogs(logs.slice(0, 100)); // Keep last 100 logs
  }
};
