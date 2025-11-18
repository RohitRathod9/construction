import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWorkerById } from "@/lib/firebase/firestore.workers";
import { WorkerDetails } from "./WorkerDetails";
import { WorkerAttendance } from "./WorkerAttendance";
import { WorkerPayments } from "./WorkerPayments";
import { Loader2 } from "lucide-react";

interface WorkerProfileDialogProps {
  workerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkerProfileDialog({ workerId, open, onOpenChange }: WorkerProfileDialogProps) {
  const { data: worker, isLoading, isError, error } = useQuery({
    queryKey: ["workers", workerId],
    queryFn: () => getWorkerById(workerId),
    enabled: open, // Only fetch when the dialog is open
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading && <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin" /></div>}
        {isError && <div className="text-red-500 text-center">{error.message}</div>}
        {worker && (
          <>
            <DialogHeader>
              <DialogTitle>{worker.name}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="attendance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="attendance">
                <WorkerAttendance workerId={worker.id} siteId={worker.siteId} />
              </TabsContent>

              <TabsContent value="payments">
                <WorkerPayments workerId={worker.id} siteId={worker.siteId} />
              </TabsContent>

              <TabsContent value="details">
                <WorkerDetails worker={worker} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
