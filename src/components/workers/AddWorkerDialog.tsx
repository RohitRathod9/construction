import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Worker } from "@/lib/mockData";
import { storage } from "@/lib/storage";

interface AddWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (worker: Omit<Worker, "id">) => void;
  defaultSiteId?: string;
}

export function AddWorkerDialog({ open, onOpenChange, onAdd, defaultSiteId }: AddWorkerDialogProps) {
  const sites = storage.getSites();
  const [formData, setFormData] = useState<Omit<Worker, "id">>({
    siteId: defaultSiteId || "",
    fullName: "",
    phone: "",
    role: "",
    joinDate: new Date().toISOString().split("T")[0],
    wageType: "daily",
    wageValue: 0,
    isActive: true,
    idNumber: "",
    bankDetails: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName.trim()) {
      return;
    }
    if (!formData.joinDate) {
      return;
    }
    if (formData.wageValue <= 0) {
      return;
    }

    onAdd(formData);
    setFormData({
      siteId: defaultSiteId || "",
      fullName: "",
      phone: "",
      role: "",
      joinDate: new Date().toISOString().split("T")[0],
      wageType: "daily",
      wageValue: 0,
      isActive: true,
      idNumber: "",
      bankDetails: "",
      notes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Worker</DialogTitle>
            <DialogDescription>Enter worker details</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteId">Site</Label>
              <Select
                value={formData.siteId}
                onValueChange={(value) => setFormData({ ...formData, siteId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map(site => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wageType">Wage Type *</Label>
              <Select
                value={formData.wageType}
                onValueChange={(value: "daily" | "hourly" | "monthly") => setFormData({ ...formData, wageType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wageValue">Wage Amount *</Label>
              <Input
                id="wageValue"
                type="number"
                min="1"
                value={formData.wageValue || ""}
                onChange={(e) => setFormData({ ...formData, wageValue: Number(e.target.value) })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="joinDate">Join Date *</Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bankDetails">Bank Details (Optional)</Label>
              <Input
                id="bankDetails"
                value={formData.bankDetails}
                onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Worker</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
