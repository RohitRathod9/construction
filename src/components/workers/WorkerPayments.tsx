import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { Payment } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, IndianRupee } from "lucide-react";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { toast } from "sonner";

interface WorkerPaymentsProps {
  workerId: string;
  siteId: string;
  onUpdate: () => void;
}

export function WorkerPayments({ workerId, siteId, onUpdate }: WorkerPaymentsProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  const loadPayments = () => {
    const allPayments = storage.getPayments();
    const workerPayments = allPayments
      .filter(p => p.workerId === workerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setPayments(workerPayments);
  };

  const currentWorker = storage.getWorkers().find(w => w.id === workerId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wageAccruedPending = (currentWorker && (currentWorker as any).pendingAmount) ? (currentWorker as any).pendingAmount : 0;
  const sumPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const sumPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = sumPaid;
  const totalPending = Math.max(0, wageAccruedPending + sumPending - sumPaid);

  const handleAddPayment = (payment: Omit<Payment, "id">) => {
    if (payment.amount <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    const newPayment: Payment = {
      ...payment,
      id: `p_${Date.now()}`,
      workerId,
      siteId,
      date: payment.date || new Date().toISOString().split("T")[0],
    };

    const allPayments = storage.getPayments();
    storage.setPayments([...allPayments, newPayment]);

    loadPayments();
    onUpdate();
    setShowAddDialog(false);

    const updatedPaid = totalPaid + (newPayment.status === "paid" ? newPayment.amount : 0);
    const updatedPending = Math.max(0, (wageAccruedPending + sumPending - sumPaid) + (newPayment.status === "pending" ? newPayment.amount : -newPayment.amount));

    storage.addAuditLog(
      "payment_added",
      `Payment of ₹${newPayment.amount.toFixed(2)} added for worker ${workerId} at site ${siteId}. ` +
      `Totals → Pending: ₹${updatedPending.toFixed(2)}, Paid: ₹${updatedPaid.toFixed(2)}`
    );

    toast.success("Payment added successfully");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-success/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
              <p className="text-2xl font-bold flex items-center">
                <IndianRupee className="w-5 h-5" />
                {totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Pending</p>
              <p className="text-2xl font-bold flex items-center">
                <IndianRupee className="w-5 h-5" />
                {totalPending.toLocaleString()}
              </p>
            </div>
          </div>

          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payment records</p>
          ) : (
            <div className="space-y-3">
              {payments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                        {payment.status}
                      </Badge>
                      <Badge variant="outline">{payment.type}</Badge>
                      {payment.method && <Badge variant="outline">{payment.method}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                    {payment.note && (
                      <p className="text-sm text-muted-foreground mt-1">{payment.note}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold flex items-center">
                      <IndianRupee className="w-4 h-4" />
                      {payment.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddPaymentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddPayment}
        workerId={workerId}
        siteId={siteId}
      />
    </>
  );
}
