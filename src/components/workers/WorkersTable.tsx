import { useState } from "react";
import { Worker } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Trash2 } from "lucide-react";
import { downloadWorkerReport } from "@/lib/reportGenerator";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { storage } from "@/lib/storage";
import { toast } from "sonner";

interface WorkersTableProps {
  workers: Worker[];
  onWorkerClick: (worker: Worker) => void;
  onRefresh: () => void;
}

export function WorkersTable({ workers, onWorkerClick, onRefresh }: WorkersTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleDownloadReport = (e: React.MouseEvent, worker: Worker) => {
    e.stopPropagation();
    downloadWorkerReport(worker);
    toast.success(`Report downloaded for ${worker.fullName}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, worker: Worker) => {
    e.stopPropagation();
    setWorkerToDelete(worker);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!workerToDelete) return;

    const allWorkers = storage.getWorkers();
    const updatedWorkers = allWorkers.filter(w => w.id !== workerToDelete.id);
    storage.setWorkers(updatedWorkers);
    storage.addAuditLog("delete_worker", `Deleted worker: ${workerToDelete.fullName}`);
    toast.success(`Worker "${workerToDelete.fullName}" deleted successfully`);
    onRefresh();
    setWorkerToDelete(null);
  };

  const getWageBadgeColor = (type: string) => {
    switch (type) {
      case "daily": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "hourly": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "monthly": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
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
              <th className="pb-3 text-sm font-medium text-muted-foreground">Role</th>
              <th className="pb-3 text-sm font-medium text-muted-foreground">Phone</th>
              <th className="pb-3 text-sm font-medium text-muted-foreground">Wage</th>
              <th className="pb-3 text-sm font-medium text-muted-foreground">Join Date</th>
              <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
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
                        {getInitials(worker.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{worker.fullName}</span>
                  </div>
                </td>
                <td className="py-4">{worker.role}</td>
                <td className="py-4">{worker.phone}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getWageBadgeColor(worker.wageType)}>
                      {worker.wageType}
                    </Badge>
                    <span className="text-sm">₹{worker.wageValue}</span>
                  </div>
                </td>
                <td className="py-4 text-sm">{new Date(worker.joinDate).toLocaleDateString()}</td>
                <td className="py-4">
                  <Badge variant={worker.isActive ? "default" : "secondary"}>
                    {worker.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDownloadReport(e, worker)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDeleteClick(e, worker)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
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
                    {getInitials(worker.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{worker.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{worker.role}</p>
                </div>
              </div>
              <Badge variant={worker.isActive ? "default" : "secondary"}>
                {worker.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p>{worker.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Join Date</p>
                <p>{new Date(worker.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getWageBadgeColor(worker.wageType)}>
                {worker.wageType}
              </Badge>
              <span className="text-sm">₹{worker.wageValue}</span>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                size="sm"
                onClick={(e) => handleDownloadReport(e, worker)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={(e) => handleDeleteClick(e, worker)}
              >
                <Trash2 className="w-4 h-4" />
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
        description="Are you sure you want to permanently delete this worker? This action cannot be undone."
      />
    </div>
  );
}
