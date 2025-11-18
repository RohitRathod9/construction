import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Worker } from "@/lib/mockData";
import { WorkerDetails } from "./WorkerDetails";
import { WorkerAttendance } from "./WorkerAttendance";
import { WorkerPayments } from "./WorkerPayments";

interface WorkerProfileDialogProps {
  worker: Worker;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function WorkerProfileDialog({ worker, open, onOpenChange, onUpdate }: WorkerProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{worker.fullName}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <WorkerAttendance workerId={worker.id} siteId={worker.siteId} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="payments">
            <WorkerPayments workerId={worker.id} siteId={worker.siteId} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="details">
            <WorkerDetails worker={worker} onUpdate={onUpdate} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
