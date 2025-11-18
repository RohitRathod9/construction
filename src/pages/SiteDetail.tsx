import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSiteById, deleteSite } from "@/lib/firebase/firestore.sites";
import { getWorkersBySite, addWorker } from "@/lib/firebase/firestore.workers";
import { Site, Worker } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, Trash2, Loader2 } from "lucide-react";
import { WorkersTable } from "@/components/workers/WorkersTable";
import { AddWorkerDialog } from "@/components/workers/AddWorkerDialog";
import { WorkerProfileDialog } from "@/components/workers/WorkerProfileDialog";
import { AdminAuthDialog } from "@/components/sites/AdminAuthDialog";
import { toast } from "sonner";

const SiteDetail = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddWorkerDialog, setShowAddWorkerDialog] = useState(false);
  const [showDeleteSiteDialog, setShowDeleteSiteDialog] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  // Fetch site details
  const { data: site, isLoading: siteLoading, isError: siteError } = useQuery<Site, Error>({
    queryKey: ["sites", siteId],
    queryFn: () => getSiteById(siteId!),
    enabled: !!siteId,
  });

  // Fetch workers for the site
  const { data: workers = [], isLoading: workersLoading, isError: workersError } = useQuery<Worker[], Error>({
    queryKey: ["workers", siteId],
    queryFn: () => getWorkersBySite(siteId!),
    enabled: !!siteId,
  });

  // Mutation for adding a worker
  const { mutate: addWorkerMutation, isPending: isAddingWorker } = useMutation({
    mutationFn: (workerData: Omit<Worker, 'id'>) => addWorker(workerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers', siteId] });
      setShowAddWorkerDialog(false);
      toast.success("Worker added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add worker", { description: error.message });
    }
  });

  // Mutation for deleting a site
  const { mutate: deleteSiteMutation, isPending: isDeletingSite } = useMutation({
    mutationFn: () => deleteSite(siteId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success(`Site "${site?.name}" has been deleted`);
      navigate("/sites");
    },
    onError: (error) => {
      toast.error("Failed to delete site", { description: error.message });
    }
  });

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.phone.includes(searchQuery)
  );

  if (siteLoading || workersLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (siteError || workersError) {
    return <div className="text-red-500 text-center">Error loading site data.</div>;
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Site not found</p>
        <Button onClick={() => navigate("/sites")} className="mt-4">Back to Sites</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/sites")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{site.name}</h1>
          <p className="text-muted-foreground mt-1">{site.address}</p>
        </div>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteSiteDialog(true)}
          className="gap-2"
          disabled={isDeletingSite}
        >
          {isDeletingSite ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
          Delete Site
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workers ({filteredWorkers.length})</CardTitle>
            <Button onClick={() => setShowAddWorkerDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Worker
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search workers by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <WorkersTable
            workers={filteredWorkers}
            onWorkerClick={(worker) => setSelectedWorker(worker)}
          />
        </CardContent>
      </Card>

      <AddWorkerDialog
        open={showAddWorkerDialog}
        onOpenChange={setShowAddWorkerDialog}
        onAdd={addWorkerMutation}
        isAdding={isAddingWorker}
        siteId={siteId!}
      />

      <AdminAuthDialog
        open={showDeleteSiteDialog}
        onOpenChange={setShowDeleteSiteDialog}
        onSuccess={() => deleteSiteMutation()}
        title="Delete Site"
        description={`Please enter admin credentials to confirm deletion of "${site.name}". This action cannot be undone.`}
      />

      {selectedWorker && (
        <WorkerProfileDialog
          workerId={selectedWorker.id}
          open={!!selectedWorker}
          onOpenChange={(open) => !open && setSelectedWorker(null)}
        />
      )}
    </div>
  );
};

export default SiteDetail;
