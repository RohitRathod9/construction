import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "@/lib/storage";
import { Site } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, MapPin, Calendar } from "lucide-react";
import { AddSiteDialog } from "@/components/sites/AddSiteDialog";
import { toast } from "sonner";

const Sites = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = () => {
    setSites(storage.getSites());
  };

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSite = (site: Omit<Site, "id">) => {
    const newSite: Site = {
      ...site,
      id: `site_${Date.now()}`,
    };
    
    const updatedSites = [...sites, newSite];
    storage.setSites(updatedSites);
    storage.addAuditLog("create_site", `Created site: ${site.name}`);
    setSites(updatedSites);
    setShowAddDialog(false);
    toast.success(`Site "${site.name}" created successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sites</h1>
          <p className="text-muted-foreground mt-1">Manage all construction sites</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Site
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search sites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSites.map(site => (
          <Card
            key={site.id}
            className={`hover-scale cursor-pointer ${!site.isActive ? "opacity-60" : ""}`}
            onClick={() => navigate(`/sites/${site.id}`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {site.name}
                {!site.isActive && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">Inactive</span>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                {site.address}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Created: {new Date(site.createdAt).toLocaleDateString()}</span>
              </div>
              <Button className="w-full mt-4" onClick={(e) => {
                e.stopPropagation();
                navigate(`/sites/${site.id}`);
              }}>
                View Site
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSites.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No sites found</p>
          </CardContent>
        </Card>
      )}

      <AddSiteDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddSite}
      />
    </div>
  );
};

export default Sites;
