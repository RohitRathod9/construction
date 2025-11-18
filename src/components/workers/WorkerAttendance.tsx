import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { Attendance, Worker } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Edit, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AddAttendanceDialog } from "./AddAttendanceDialog";

interface WorkerAttendanceProps {
  workerId: string;
  siteId: string;
  onUpdate: () => void;
}

export function WorkerAttendance({ workerId, siteId, onUpdate }: WorkerAttendanceProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | undefined>(undefined);
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    loadAttendance();
    loadWorker();
  }, [workerId]);

  const loadWorker = () => {
    const allWorkers = storage.getWorkers();
    const foundWorker = allWorkers.find(w => w.id === workerId);
    setWorker(foundWorker || null);
  };

  const loadAttendance = () => {
    const allAttendance = storage.getAttendance();
    const workerAttendance = allAttendance
      .filter(a => a.workerId === workerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAttendance(workerAttendance);
  };

  const handleQuickCheckIn = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    
    // Check if already checked in today
    const todayAttendance = attendance.find(a => a.date === today);
    if (todayAttendance && !todayAttendance.timeOut) {
      toast.error("Already checked in today. Check out first.");
      return;
    }

    const newAttendance: Attendance = {
      id: `a_${Date.now()}`,
      siteId,
      workerId,
      date: today,
      timeIn: now.toISOString(),
    };

    const allAttendance = storage.getAttendance();
    storage.setAttendance([...allAttendance, newAttendance]);
    storage.addAuditLog("attendance_added", `Check-in recorded for worker ${workerId}`);
    
    // Load the latest worker data to ensure we have the current wage information
    const allWorkers = storage.getWorkers();
    const currentWorker = allWorkers.find(w => w.id === workerId);
    
    if (currentWorker) {
      // Calculate amount to add to pending based on wage type
      let amountToAdd = 0;
      
      if (currentWorker.wageType === 'daily') {
        amountToAdd = currentWorker.wageValue;
      } else if (currentWorker.wageType === 'monthly') {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        amountToAdd = currentWorker.wageValue / daysInMonth;
      }
      // For hourly workers, we'll update the pending amount when they check out
      
      if (amountToAdd > 0 && currentWorker.wageType !== 'hourly') {
        const updatedWorkers = allWorkers.map(w => 
          w.id === workerId
            ? { ...w, pendingAmount: (w.pendingAmount || 0) + amountToAdd }
            : w
        );
        storage.setWorkers(updatedWorkers);
      }
    }
    
    loadAttendance();
    onUpdate();
    toast.success("Checked in successfully");
  };

  const handleQuickCheckOut = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = attendance.find(a => a.date === today && !a.timeOut);
    
    if (!todayAttendance) {
      toast.error("No active check-in found for today");
      return;
    }

    const timeOut = new Date();
    const timeIn = new Date(todayAttendance.timeIn);
    const totalHours = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60);

    const allAttendance = storage.getAttendance();
    const updatedAttendance = allAttendance.map(a =>
      a.id === todayAttendance.id
        ? { ...a, timeOut: timeOut.toISOString(), totalHours: Number(totalHours.toFixed(2)) }
        : a
    );
    storage.setAttendance(updatedAttendance);
    
    // For hourly workers, update pending amount on check-out
    const allWorkers = storage.getWorkers();
    const currentWorker = allWorkers.find(w => w.id === workerId);
    
    if (currentWorker && currentWorker.wageType === 'hourly') {
      const amountToAdd = totalHours * currentWorker.wageValue;
      
      if (amountToAdd > 0) {
        const updatedWorkers = allWorkers.map(w => 
          w.id === workerId
            ? { ...w, pendingAmount: (w.pendingAmount || 0) + amountToAdd }
            : w
        );
        storage.setWorkers(updatedWorkers);
      }
    }
    
    storage.addAuditLog("attendance_updated", `Check-out recorded for worker ${workerId}`);
    loadAttendance();
    onUpdate();
    toast.success("Checked out successfully");
  };

  const handleAddAttendance = (attendanceData: Omit<Attendance, "id">) => {
    const allAttendance = storage.getAttendance();
    const allWorkers = storage.getWorkers();
    
    // Check if an attendance record already exists for this worker on this date
    const existingAttendance = allAttendance.find(a => 
      a.workerId === attendanceData.workerId && 
      a.date === attendanceData.date
    );

    if (existingAttendance && (!editingAttendance || existingAttendance.id !== editingAttendance.id)) {
      toast.error('Attendance for this date already exists.');
      return;
    }
    
    // Get the worker to access wage information
    const worker = allWorkers.find(w => w.id === attendanceData.workerId);
    if (!worker) {
      toast.error('Worker not found');
      return;
    }

    if (editingAttendance) {
      // Update existing attendance (preserve the payment status)
      const updatedAttendance = allAttendance.map(a =>
        a.id === editingAttendance.id
          ? { ...a, ...attendanceData }
          : a
      );
      storage.setAttendance(updatedAttendance);
      storage.addAuditLog("attendance_updated", `Updated attendance for worker ${worker.fullName}`);
      toast.success("Attendance updated successfully");
    } else {
      // Add new attendance
      const newAttendance: Attendance = {
        id: `a_${Date.now()}`,
        ...attendanceData,
      };
      
      // Calculate amount to add to pending based on wage type
      let amountToAdd = 0;
      
      if (worker.wageType === 'daily') {
        // For daily workers, add the full day's wage to pending
        amountToAdd = worker.wageValue;
      } else if (worker.wageType === 'hourly' && attendanceData.totalHours) {
        // For hourly workers, calculate based on hours worked
        amountToAdd = attendanceData.totalHours * worker.wageValue;
      } else if (worker.wageType === 'monthly') {
        // For monthly workers, calculate daily rate
        const date = new Date(attendanceData.date);
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        amountToAdd = worker.wageValue / daysInMonth;
      }
      
      // Update worker's pending amount
      if (amountToAdd > 0) {
        const updatedWorkers = allWorkers.map(w => 
          w.id === workerId
            ? { 
                ...w, 
                pendingAmount: (w.pendingAmount || 0) + amountToAdd,
                // Initialize paidAmount to 0 if not set
                paidAmount: w.paidAmount || 0
              }
            : w
        );
        storage.setWorkers(updatedWorkers);
        
        // Show success message with the amount added to pending
        toast.success(`Attendance added. Added ₹${amountToAdd.toFixed(2)} to pending amount.`);
      }
      
      // Save the new attendance
      storage.setAttendance([...allAttendance, newAttendance]);
      storage.addAuditLog(
        "attendance_added", 
        `Added attendance for ${worker.fullName}. Pending +₹${amountToAdd.toFixed(2)}`
      );
    }
    
    // Refresh the UI
    loadAttendance();
    onUpdate();
    setShowAddDialog(false);
    setEditingAttendance(undefined);
  };

  const handleEditClick = (record: Attendance) => {
    setEditingAttendance(record);
    setShowAddDialog(true);
  };

  // Calculate monthly summary
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyAttendance = attendance.filter(a => a.date.startsWith(currentMonth));
  const totalMonthlyHours = monthlyAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
  const totalMonthlyDays = monthlyAttendance.length;

  // Only show if worker is active
  if (!worker?.isActive) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Attendance is only available for active workers
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attendance Records</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                setEditingAttendance(undefined);
                setShowAddDialog(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
              <Button size="sm" onClick={handleQuickCheckIn}>
                <Clock className="w-4 h-4 mr-2" />
                Check In
              </Button>
              <Button size="sm" variant="outline" onClick={handleQuickCheckOut}>
                Check Out
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Monthly Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-primary/5 rounded-lg">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span>This Month</span>
              </div>
              <p className="text-2xl font-bold">{totalMonthlyDays}</p>
              <p className="text-xs text-muted-foreground">Days worked</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span>Total Hours</span>
              </div>
              <p className="text-2xl font-bold">{totalMonthlyHours.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Hours worked</p>
            </div>
          </div>

          {/* Attendance List */}
          {attendance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No attendance records</p>
          ) : (
            <div className="space-y-3">
              {attendance.map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>In: {new Date(record.timeIn).toLocaleTimeString()}</p>
                      {record.timeOut && (
                        <p>Out: {new Date(record.timeOut).toLocaleTimeString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {record.totalHours && (
                      <div className="text-right">
                        <p className="font-medium">{record.totalHours}h</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                    )}
                    {!record.timeOut && (
                      <div className="text-sm text-amber-600 font-medium">Active</div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditClick(record)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddAttendanceDialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) setEditingAttendance(undefined);
        }}
        onAdd={handleAddAttendance}
        workerId={workerId}
        siteId={siteId}
        editData={editingAttendance}
      />
    </>
  );
}
