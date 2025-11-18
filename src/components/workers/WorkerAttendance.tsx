import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAttendanceByWorker, addAttendance } from "@/lib/firebase/firestore.attendance";
import { getWorkerById, updateWorker } from "@/lib/firebase/firestore.workers";
import { Attendance, Worker } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Edit, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AddAttendanceDialog } from "./AddAttendanceDialog";

interface WorkerAttendanceProps {
  workerId: string;
  siteId: string;
}

export function WorkerAttendance({ workerId, siteId }: WorkerAttendanceProps) {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | undefined>(undefined);

  const { data: worker, isLoading: workerLoading } = useQuery<Worker | null>({
    queryKey: ["workers", workerId],
    queryFn: () => getWorkerById(workerId),
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery<Attendance[]>({
    queryKey: ["attendance", workerId],
    queryFn: () => getAttendanceByWorker(workerId),
  });

  const { mutate: addAttendanceMutation, isPending: isAdding } = useMutation({
    mutationFn: async (newData: Omit<Attendance, "id">) => {
        // Note: Business logic for pending amounts is now in a transaction-like manner
        const newAttendance = await addAttendance(newData);
        if (worker) {
            const amountToAdd = newData.status === 'present' ? worker.wageAmount : (worker.wageAmount / 2);
            const newPendingAmount = (worker.pendingAmount || 0) + amountToAdd;
            await updateWorker(workerId, { pendingAmount: newPendingAmount });
        }
        return newAttendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', workerId] });
      queryClient.invalidateQueries({ queryKey: ['workers', workerId] });
      setShowAddDialog(false);
      setEditingAttendance(undefined);
      toast.success("Attendance recorded successfully");
    },
    onError: (error) => {
      toast.error("Failed to record attendance", { description: error.message });
    },
  });

  const handleAddAttendance = (formData: { date: string, status: 'present' | 'absent' | 'half-day' }) => {
    addAttendanceMutation({ ...formData, workerId, siteId });
  };

  // Calculate monthly summary
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyAttendance = attendance.filter(a => a.date.startsWith(currentMonth));
  const presentDays = monthlyAttendance.filter(a => a.status === 'present').length;
  const halfDays = monthlyAttendance.filter(a => a.status === 'half-day').length;
  const absentDays = monthlyAttendance.filter(a => a.status === 'absent').length;

  if (workerLoading || attendanceLoading) {
    return <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attendance</CardTitle>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Attendance
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Monthly Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{presentDays}</p>
                <p className="text-xs text-muted-foreground">Present</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{halfDays}</p>
                <p className="text-xs text-muted-foreground">Half-days</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{absentDays}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </div>

          {/* Attendance List */}
          {attendance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No attendance records</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {attendance.map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-sm font-semibold 
                    ${record.status === 'present' ? 'text-green-600' : 
                    record.status === 'half-day' ? 'text-orange-600' : 'text-red-600'}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddAttendanceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddAttendance}
        isAdding={isAdding}
      />
    </>
  );
}
