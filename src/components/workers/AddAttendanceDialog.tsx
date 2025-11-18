import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Attendance } from "@/lib/mockData";

interface AddAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (attendance: Omit<Attendance, "id">) => void;
  workerId: string;
  siteId: string;
  editData?: Attendance;
}

export function AddAttendanceDialog({
  open,
  onOpenChange,
  onAdd,
  workerId,
  siteId,
  editData,
}: AddAttendanceDialogProps) {
  const [formData, setFormData] = useState<{
    date: string;
    timeIn: string;
    timeOut: string;
  }>({
    date: editData?.date || new Date().toISOString().split("T")[0],
    timeIn: editData?.timeIn ? new Date(editData.timeIn).toTimeString().slice(0, 5) : "09:00",
    timeOut: editData?.timeOut ? new Date(editData.timeOut).toTimeString().slice(0, 5) : "17:00",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timeInDate = new Date(`${formData.date}T${formData.timeIn}`);
    const timeOutDate = new Date(`${formData.date}T${formData.timeOut}`);
    const totalHours = (timeOutDate.getTime() - timeInDate.getTime()) / (1000 * 60 * 60);

    const attendance: Omit<Attendance, "id"> = {
      siteId,
      workerId,
      date: formData.date,
      timeIn: timeInDate.toISOString(),
      timeOut: timeOutDate.toISOString(),
      totalHours: Number(totalHours.toFixed(2)),
    };

    onAdd(attendance);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editData ? "Edit Attendance" : "Add Attendance"}</DialogTitle>
            <DialogDescription>
              {editData ? "Update attendance record" : "Add a new attendance record"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeIn">Time In *</Label>
              <Input
                id="timeIn"
                type="time"
                value={formData.timeIn}
                onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeOut">Time Out *</Label>
              <Input
                id="timeOut"
                type="time"
                value={formData.timeOut}
                onChange={(e) => setFormData({ ...formData, timeOut: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editData ? "Update" : "Add"} Attendance</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
