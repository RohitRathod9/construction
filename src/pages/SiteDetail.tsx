import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storage } from "@/lib/storage";
import { Site, Worker } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { WorkersTable } from "@/components/workers/WorkersTable";
import { AddWorkerDialog } from "@/components/workers/AddWorkerDialog";
import { WorkerProfileDialog } from "@/components/workers/WorkerProfileDialog";
import { AdminAuthDialog } from "@/components/sites/AdminAuthDialog";
import { toast } from "sonner";

const SiteDetail = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  useEffect(() => {
    if (siteId) {
      loadSiteData();
    }
  }, [siteId]);

  const loadSiteData = () => {
    const sites = storage.getSites();
    const foundSite = sites.find(s => s.id === siteId);
    setSite(foundSite || null);

    const allWorkers = storage.getWorkers();
    const siteWorkers = allWorkers.filter(w => w.siteId === siteId);
    setWorkers(siteWorkers);
  };

  const filteredWorkers = workers.filter(w =>
    w.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.phone.includes(searchQuery) ||
    w.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddWorker = (worker: Omit<Worker, "id">) => {
    const newWorker: Worker = {
      ...worker,
      id: `w_${Date.now()}`,
    };

    const allWorkers = storage.getWorkers();
    storage.setWorkers([...allWorkers, newWorker]);
    storage.addAuditLog("create_worker", `Added worker: ${worker.fullName} to ${site?.name}`);
    loadSiteData();
    setShowAddDialog(false);
    toast.success(`Worker "${worker.fullName}" added successfully`);
  };

  const handleDeleteSite = () => {
    if (!site) return;
    
    // Get all sites and remove the current one
    const sites = storage.getSites();
    const updatedSites = sites.filter(s => s.id !== site.id);
    
    // Update storage
    storage.setSites(updatedSites);
    storage.addAuditLog("delete_site", `Deleted site: ${site.name}`);
    
    // Show success message and navigate back to sites list
    toast.success(`Site "${site.name}" has been deleted`);
    navigate("/sites");
  };

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Site not found</p>
        <Button onClick={() => navigate("/sites")} className="mt-4">
          Back to Sites
        </Button>
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
          onClick={() => setShowDeleteDialog(true)}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Site
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workers ({filteredWorkers.length})</CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Worker
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search workers by name, phone, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <WorkersTable
            workers={filteredWorkers}
            onWorkerClick={(worker) => setSelectedWorker(worker)}
            onRefresh={loadSiteData}
          />
        </CardContent>
      </Card>

      <AddWorkerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddWorker}
        defaultSiteId={siteId}
      />

      <AdminAuthDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={handleDeleteSite}
        title="Delete Site"
        description={`Please enter admin credentials to confirm deletion of "${site.name}". This action cannot be undone.`}
      />

      {selectedWorker && (
        <WorkerProfileDialog
          worker={selectedWorker}
          open={!!selectedWorker}
          onOpenChange={(open) => !open && setSelectedWorker(null)}
          onUpdate={loadSiteData}
        />
      )}
    </div>
  );
};

export default SiteDetail;
