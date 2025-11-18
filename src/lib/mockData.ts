export interface Site {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  isActive: boolean;
}

export interface Worker {
  id: string;
  siteId: string;
  fullName: string;
  phone: string;
  role: string;
  joinDate: string;
  wageType: "daily" | "hourly" | "monthly";
  wageValue: number;
  isActive: boolean;
  idNumber?: string;
  bankDetails?: string;
  notes?: string;
  pendingAmount?: number; // Track pending payment amount
  paidAmount?: number;    // Track paid amount
}

export interface Attendance {
  id: string;
  siteId: string;
  workerId: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  totalHours?: number;
}

export interface Payment {
  id: string;
  siteId: string;
  workerId: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
  type: "salary" | "advance" | "bonus";
  method?: "cash" | "bank" | "upi";
  note?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  adminUid: string;
  details: string;
}

export const INITIAL_DATA = {
  sites: [
    { id: "site_goa", name: "Goa Site", address: "Mapusa, Goa", createdAt: "2025-07-01", isActive: true },
    { id: "site_panvel", name: "Panvel Site", address: "Panvel, Navi Mumbai", createdAt: "2025-07-02", isActive: true },
    { id: "site_mumbai", name: "Mumbai Site", address: "Andheri West, Mumbai", createdAt: "2025-07-03", isActive: true },
    { id: "site_pune", name: "Pune Site", address: "Hinjewadi, Pune", createdAt: "2025-07-04", isActive: true }
  ] as Site[],
  
  workers: [
    { id: "w_001", siteId: "site_goa", fullName: "Ramesh Patil", phone: "9876543210", role: "Mason", joinDate: "2025-03-01", wageType: "daily" as const, wageValue: 800, isActive: true },
    { id: "w_002", siteId: "site_goa", fullName: "Suresh More", phone: "9876501234", role: "Carpenter", joinDate: "2025-06-15", wageType: "hourly" as const, wageValue: 100, isActive: true },
    { id: "w_003", siteId: "site_mumbai", fullName: "Amit Sharma", phone: "9812345678", role: "Plumber", joinDate: "2024-12-01", wageType: "monthly" as const, wageValue: 20000, isActive: true },
    { id: "w_004", siteId: "site_goa", fullName: "Vijay Kumar", phone: "9876541111", role: "Electrician", joinDate: "2025-05-10", wageType: "daily" as const, wageValue: 900, isActive: true },
    { id: "w_005", siteId: "site_panvel", fullName: "Prakash Singh", phone: "9123456789", role: "Welder", joinDate: "2025-01-15", wageType: "hourly" as const, wageValue: 120, isActive: true },
    { id: "w_006", siteId: "site_panvel", fullName: "Rajesh Yadav", phone: "9876502345", role: "Helper", joinDate: "2025-08-01", wageType: "daily" as const, wageValue: 500, isActive: true },
    { id: "w_007", siteId: "site_mumbai", fullName: "Kiran Desai", phone: "9998877665", role: "Supervisor", joinDate: "2024-11-01", wageType: "monthly" as const, wageValue: 35000, isActive: true },
    { id: "w_008", siteId: "site_pune", fullName: "Ganesh Pawar", phone: "9876503456", role: "Mason", joinDate: "2025-02-20", wageType: "daily" as const, wageValue: 850, isActive: true },
    { id: "w_009", siteId: "site_pune", fullName: "Santosh Jadhav", phone: "9123454321", role: "Carpenter", joinDate: "2025-04-01", wageType: "hourly" as const, wageValue: 110, isActive: true },
    { id: "w_010", siteId: "site_goa", fullName: "Deepak Naik", phone: "9876504567", role: "Painter", joinDate: "2025-07-15", wageType: "daily" as const, wageValue: 700, isActive: true },
    { id: "w_011", siteId: "site_mumbai", fullName: "Sunil Kamble", phone: "9912233445", role: "Mason", joinDate: "2025-01-10", wageType: "daily" as const, wageValue: 800, isActive: true },
    { id: "w_012", siteId: "site_panvel", fullName: "Mahesh Bhosale", phone: "9876505678", role: "Electrician", joinDate: "2025-05-20", wageType: "hourly" as const, wageValue: 130, isActive: true },
    { id: "w_013", siteId: "site_pune", fullName: "Anil Shinde", phone: "9123455555", role: "Plumber", joinDate: "2025-03-15", wageType: "daily" as const, wageValue: 750, isActive: true },
    { id: "w_014", siteId: "site_goa", fullName: "Ravi Sawant", phone: "9876506789", role: "Helper", joinDate: "2025-09-01", wageType: "daily" as const, wageValue: 450, isActive: true },
    { id: "w_015", siteId: "site_mumbai", fullName: "Ashok Patil", phone: "9998866554", role: "Welder", joinDate: "2024-12-15", wageType: "hourly" as const, wageValue: 125, isActive: true },
    { id: "w_016", siteId: "site_panvel", fullName: "Balaji Mane", phone: "9876507890", role: "Mason", joinDate: "2025-06-01", wageType: "daily" as const, wageValue: 820, isActive: true },
    { id: "w_017", siteId: "site_pune", fullName: "Chandrakant More", phone: "9123456666", role: "Supervisor", joinDate: "2025-01-05", wageType: "monthly" as const, wageValue: 32000, isActive: true },
    { id: "w_018", siteId: "site_goa", fullName: "Dinesh Kulkarni", phone: "9876508901", role: "Carpenter", joinDate: "2025-04-10", wageType: "hourly" as const, wageValue: 105, isActive: true },
    { id: "w_019", siteId: "site_mumbai", fullName: "Eknath Sawant", phone: "9912211009", role: "Painter", joinDate: "2025-07-01", wageType: "daily" as const, wageValue: 680, isActive: true },
    { id: "w_020", siteId: "site_panvel", fullName: "Govind Bhoir", phone: "9876509012", role: "Helper", joinDate: "2025-08-15", wageType: "daily" as const, wageValue: 480, isActive: true }
  ] as Worker[],
  
  attendance: [
    { id: "a_001", siteId: "site_goa", workerId: "w_001", date: "2025-11-01", timeIn: "2025-11-01T09:00:00", timeOut: "2025-11-01T17:00:00", totalHours: 8 },
    { id: "a_002", siteId: "site_goa", workerId: "w_002", date: "2025-11-01", timeIn: "2025-11-01T08:30:00", timeOut: "2025-11-01T14:30:00", totalHours: 6 },
    { id: "a_003", siteId: "site_mumbai", workerId: "w_003", date: "2025-11-01", timeIn: "2025-11-01T09:00:00", timeOut: "2025-11-01T18:00:00", totalHours: 9 },
    { id: "a_004", siteId: "site_goa", workerId: "w_001", date: "2025-11-02", timeIn: "2025-11-02T09:00:00", timeOut: "2025-11-02T17:30:00", totalHours: 8.5 },
    { id: "a_005", siteId: "site_panvel", workerId: "w_005", date: "2025-11-02", timeIn: "2025-11-02T08:00:00", timeOut: "2025-11-02T16:00:00", totalHours: 8 }
  ] as Attendance[],
  
  payments: [
    { id: "p_001", siteId: "site_goa", workerId: "w_001", amount: 5000, date: "2025-10-25", status: "paid" as const, type: "salary" as const, method: "bank" as const },
    { id: "p_002", siteId: "site_goa", workerId: "w_002", amount: 2000, date: "2025-10-30", status: "pending" as const, type: "advance" as const, method: "cash" as const },
    { id: "p_003", siteId: "site_mumbai", workerId: "w_003", amount: 20000, date: "2025-10-31", status: "paid" as const, type: "salary" as const, method: "bank" as const }
  ] as Payment[],
  
  auditLogs: [] as AuditLog[]
};

export function initializeLocalStorage() {
  if (!localStorage.getItem("crb_sites")) {
    localStorage.setItem("crb_sites", JSON.stringify(INITIAL_DATA.sites));
  }
  if (!localStorage.getItem("crb_workers")) {
    localStorage.setItem("crb_workers", JSON.stringify(INITIAL_DATA.workers));
  }
  if (!localStorage.getItem("crb_attendance")) {
    localStorage.setItem("crb_attendance", JSON.stringify(INITIAL_DATA.attendance));
  }
  if (!localStorage.getItem("crb_payments")) {
    localStorage.setItem("crb_payments", JSON.stringify(INITIAL_DATA.payments));
  }
  if (!localStorage.getItem("crb_auditLogs")) {
    localStorage.setItem("crb_auditLogs", JSON.stringify(INITIAL_DATA.auditLogs));
  }
}

export function resetToSampleData() {
  localStorage.setItem("crb_sites", JSON.stringify(INITIAL_DATA.sites));
  localStorage.setItem("crb_workers", JSON.stringify(INITIAL_DATA.workers));
  localStorage.setItem("crb_attendance", JSON.stringify(INITIAL_DATA.attendance));
  localStorage.setItem("crb_payments", JSON.stringify(INITIAL_DATA.payments));
  localStorage.setItem("crb_auditLogs", JSON.stringify([]));
}
