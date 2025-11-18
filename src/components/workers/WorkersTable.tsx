import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Worker } from "@/lib/types";
import { deleteWorker } from "@/lib/firebase/firestore.workers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Trash2, Loader2 } from "lucide-react";
import { downloadWorkerReport } from "@/lib/reportGenerator"; // Assuming this is still relevant
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";

interface WorkersTableProps {
  workers: Worker[];
  onWorkerClick: (worker: Worker) => void;
}

export function WorkersTable({ workers, onWorkerClick }: WorkersTableProps) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  const { mutate: deleteWorkerMutation, isPending: isDeleting } = useMutation({
    mutationFn: (workerId: string) => deleteWorker(workerId),
    onSuccess: (_, workerId) => {
        queryClient.invalidateQueries({ queryKey: ['workers'] });
        toast.success("Worker deleted successfully");
    },
    onError: (error) => {
        toast.error("Failed to delete worker", { description: error.message });
    }
  });

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleDownloadReport = (e: React.MouseEvent, worker: Worker) => {
    e.stopPropagation();
    // downloadWorkerReport(worker); // This needs to be adapted for Firestore data
    toast.info("Report generation is not yet implemented for Firestore.");
  };

  const handleDeleteClick = (e: React.MouseEvent, worker: Worker) => {
    e.stopPropagation();
    setWorkerToDelete(worker);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!workerToDelete) return;
    deleteWorkerMutation(workerToDelete.id);
    setDeleteDialogOpen(false);
  };

  const getWageBadgeColor = (type: string) => {
    switch (type) {
      case "daily": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "hourly": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "";
    }
  };

  if (workers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No workers found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr className="text-left">
              <th className="pb-3 text-sm font-medium text-muted-foreground">Worker</th>
              <th className="pb-3 text-sm font-medium text-muted-foreground">Phone</th>
              <th className="pb-3 text-sm font-medium text-muted-foreground">Wage</th>
              <th className="pb-3 text-sm font-medium text-muted-foreground">Pending Amount</th>
              <th className="pb-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workers.map(worker => (
              <tr
                key={worker.id}
                className="border-b border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => onWorkerClick(worker)}
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(worker.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{worker.name}</span>
                  </div>
                </td>
                <td className="py-4">{worker.phone}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getWageBadgeColor(worker.wageType)}>
                      {worker.wageType}
                    </Badge>
                    <span className="text-sm">₹{worker.wageAmount}</span>
                  </div>
                </td>
                <td className="py-4 text-sm font-medium">₹{worker.pendingAmount.toFixed(2)}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDownloadReport(e, worker)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Report
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDeleteClick(e, worker)}
                      disabled={isDeleting && workerToDelete?.id === worker.id}
                    >
                      {isDeleting && workerToDelete?.id === worker.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4 text-destructive" />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {workers.map(worker => (
          <div
            key={worker.id}
            className="bg-card border border-border rounded-lg p-4 space-y-3 hover-scale cursor-pointer"
            onClick={() => onWorkerClick(worker)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(worker.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{worker.name}</h3>
                  <p className="text-sm text-muted-foreground">{worker.phone}</p>
                </div>
              </div>
              <Badge className={getWageBadgeColor(worker.wageType)}>
                {worker.wageType} - ₹{worker.wageAmount}
              </Badge>
            </div>
            
            <div className="text-sm">
                <p className="text-muted-foreground">Pending Amount</p>
                <p className="font-medium">₹{worker.pendingAmount.toFixed(2)}</p>
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button 
                className="flex-1" 
                size="sm"
                onClick={(e) => handleDownloadReport(e, worker)}
              >
                <Download className="w-4 h-4 mr-2" />
                Report
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={(e) => handleDeleteClick(e, worker)}
                disabled={isDeleting && workerToDelete?.id === worker.id}
              >
                 {isDeleting && workerToDelete?.id === worker.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Worker"
        description={`Are you sure you want to permanently delete "${workerToDelete?.name}"? This action cannot be undone.`}
        isDestructive={true}
        isPerformingAction={isDeleting}
      />
    </div>
  );
}
