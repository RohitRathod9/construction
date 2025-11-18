import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (formData: { amount: number, date: string, notes: string }) => void;
  isAdding: boolean;
  maxAmount: number;
}

export function AddPaymentDialog({ open, onOpenChange, onAdd, isAdding, maxAmount }: AddPaymentDialogProps) {
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      // Reset form on open
      setAmount(maxAmount > 0 ? maxAmount : 0);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes("");
    }
  }, [open, maxAmount]);

  const handleSubmit = () => {
    onAdd({ amount, date, notes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Amount (Max: ₹{maxAmount.toFixed(2)})</Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} max={maxAmount} min={0.01} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAdding}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isAdding || amount <= 0 || amount > maxAmount}>
            {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
