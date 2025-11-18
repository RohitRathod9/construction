export interface Site {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string; 
}

export interface Worker {
  id: string;
  siteId: string;
  name: string;
  phone: string;
  wageType: "daily" | "hourly";
  wageAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

export interface Attendance {
  id: string;
  workerId: string;
  siteId: string;
  date: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  wageEarned: number;
}

export interface Payment {
  id: string;
  workerId: string;
  siteId: string;
  date: string;
  amount: number;
  method: string;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}
