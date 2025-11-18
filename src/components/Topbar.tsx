import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "./theme-toggle";
import { Worker } from "@/lib/types";
import { WorkerProfileDialog } from "@/components/workers/WorkerProfileDialog";
import { AddWorkerDialog } from "@/components/workers/AddWorkerDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { getSites } from "@/lib/firebase/firestore.sites";
import { getAllWorkers, addWorker } from "@/lib/firebase/firestore.workers";

export function Topbar() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ worker: Worker; siteName: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    getSites().then(setSites);
    getAllWorkers().then(setWorkers);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("crb_token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const siteNameById = useMemo(() => {
    const map: Record<string, string> = {};
    sites.forEach(s => { map[s.id] = s.name; });
    return map;
  }, [sites]);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setShowResults(false);
      setActiveIndex(-1);
      return;
    }
    const matches = workers
      .filter(w => w.fullName.toLowerCase().includes(q))
      .slice(0, 10)
      .map(w => ({ worker: w, siteName: siteNameById[w.siteId] || w.siteId }));
    setResults(matches);
    setShowResults(true);
    setActiveIndex(matches.length > 0 ? 0 : -1);
  }, [searchQuery, siteNameById, workers]);

  const handleResultSelect = (idx: number) => {
    const item = results[idx];
    if (!item) return;
    setSelectedWorker(item.worker);
    setShowResults(false);
    setMobileSearchOpen(false);
  };

  const handleKeyNav = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) handleResultSelect(activeIndex);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="-ml-2" />
        {!isMobile && (
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search workers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
              onFocus={() => setShowResults(!!searchQuery)}
              onKeyDown={handleKeyNav}
            />
            {showResults && (
              <div className="absolute left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-auto">
                {results.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No workers found</p>
                    <Button className="mt-2" size="sm" onClick={() => setShowAddWorker(true)}>Add new worker</Button>
                  </div>
                ) : (
                  results.map((r, i) => (
                    <button
                      key={r.worker.id}
                      className={`w-full text-left px-4 py-2 hover:bg-muted ${activeIndex === i ? "bg-muted" : ""}`}
                      onMouseDown={(e) => { e.preventDefault(); handleResultSelect(i); }}
                    >
                      <div className="font-medium">{r.worker.fullName}</div>
                      <div className="text-xs text-muted-foreground">{r.siteName}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setMobileSearchOpen(true)} aria-label="Search">
            <Search className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@company.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
        <DialogContent className="sm:max-w-lg w-[95vw] h-[80vh]">
          <DialogHeader>
            <DialogTitle>Search workers</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              autoFocus
              type="search"
              placeholder="Search workers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="overflow-auto max-h-[60vh]">
              {results.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>No workers found</p>
                  <Button className="mt-2" onClick={() => { setMobileSearchOpen(false); setShowAddWorker(true); }}>Add new worker</Button>
                </div>
              ) : (
                results.map((r, i) => (
                  <button
                    key={r.worker.id}
                    className="w-full text-left px-4 py-3 border-b border-border"
                    onClick={() => handleResultSelect(i)}
                  >
                    <div className="font-medium">{r.worker.fullName}</div>
                    <div className="text-xs text-muted-foreground">{r.siteName}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedWorker && (
        <WorkerProfileDialog
          worker={selectedWorker}
          open={!!selectedWorker}
          onOpenChange={(open) => !open && setSelectedWorker(null)}
          onUpdate={() => {
            getAllWorkers().then(setWorkers);
          }}
        />
      )}

      <AddWorkerDialog
        open={showAddWorker}
        onOpenChange={setShowAddWorker}
        onAdd={async (worker) => {
          const newWorker = await addWorker(worker);
          setWorkers(prev => [...prev, newWorker]);
          setShowAddWorker(false);
          toast.success(`Worker "${worker.fullName}" added successfully`);
        }}
      />
    </header>
  );
}
