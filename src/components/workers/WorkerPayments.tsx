import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentsByWorker, addPayment } from "@/lib/firebase/firestore.payments";
import { getWorkerById, updateWorker } from "@/lib/firebase/firestore.workers";
import { Payment, Worker } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, IndianRupee, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AddPaymentDialog } from "./AddPaymentDialog";

interface WorkerPaymentsProps {
  workerId: string;
  siteId: string;
}

export function WorkerPayments({ workerId, siteId }: WorkerPaymentsProps) {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: worker, isLoading: workerLoading } = useQuery<Worker | null>({
    queryKey: ["workers", workerId],
    queryFn: () => getWorkerById(workerId),
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["payments", workerId],
    queryFn: () => getPaymentsByWorker(workerId),
  });

  const { mutate: addPaymentMutation, isPending: isAdding } = useMutation({
    mutationFn: async (newData: Omit<Payment, "id">) => {
        // Note: Business logic for amounts is now in a transaction-like manner
        const newPayment = await addPayment(newData);
        if (worker) {
            const newPendingAmount = (worker.pendingAmount || 0) - newPayment.amount;
            const newPaidAmount = (worker.paidAmount || 0) + newPayment.amount;
            await updateWorker(workerId, { 
                pendingAmount: newPendingAmount,
                paidAmount: newPaidAmount,
             });
        }
        return newPayment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', workerId] });
      queryClient.invalidateQueries({ queryKey: ['workers', workerId] });
      setShowAddDialog(false);
      toast.success("Payment recorded successfully");
    },
    onError: (error) => {
      toast.error("Failed to record payment", { description: error.message });
    },
  });

  const handleAddPayment = (formData: { amount: number, date: string, notes: string }) => {
    if (formData.amount <= 0) {
        toast.error("Amount must be positive");
        return;
    }
    if ((worker?.pendingAmount ?? 0) < formData.amount) {
        toast.error("Payment exceeds pending amount");
        return;
    }
    addPaymentMutation({ ...formData, workerId, siteId });
  };

  if (workerLoading || paymentsLoading) {
    return <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payments</CardTitle>
            <Button size="sm" onClick={() => setShowAddDialog(true)} disabled={!worker || worker.pendingAmount <= 0}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4 text-center p-4 bg-muted/50 rounded-lg">
                <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-orange-500">₹{worker?.pendingAmount.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-2xl font-bold text-green-500">₹{worker?.paidAmount.toFixed(2)}</p>
                </div>
            </div>

          {/* Payments List */}
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payment records</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {payments.map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">₹{record.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                    {record.notes && <p className="text-xs italic text-muted-foreground pt-1">{record.notes}</p>}
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
        isAdding={isAdding}
        maxAmount={worker?.pendingAmount ?? 0}
      />
    </>
  );
}
