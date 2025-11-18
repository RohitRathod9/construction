import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Worker } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface AddWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (worker: Omit<Worker, "id">) => void;
  isAdding: boolean;
  siteId: string;
}

const initialFormData = {
  name: "",
  phone: "",
  wageType: "daily" as "daily" | "hourly",
  wageAmount: 0,
};

export function AddWorkerDialog({ open, onOpenChange, onAdd, isAdding, siteId }: AddWorkerDialogProps) {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setFormData(initialFormData);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      siteId: siteId,
      pendingAmount: 0,
      paidAmount: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Worker</DialogTitle>
            <DialogDescription>Enter the details for the new worker.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isAdding}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isAdding}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wageType">Wage Type *</Label>
                  <Select
                    value={formData.wageType}
                    onValueChange={(value: "daily" | "hourly") => setFormData({ ...formData, wageType: value })}
                    disabled={isAdding}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wageAmount">Wage Amount *</Label>
                  <Input
                    id="wageAmount"
                    type="number"
                    min="1"
                    value={formData.wageAmount || ""}
                    onChange={(e) => setFormData({ ...formData, wageAmount: Number(e.target.value) })}
                    required
                    disabled={isAdding}
                  />
                </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding}>
              {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              Add Worker
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
