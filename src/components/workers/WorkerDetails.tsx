import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Worker } from "@/lib/types";
import { updateWorker } from "@/lib/firebase/firestore.workers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Edit, Save, X } from "lucide-react";

interface WorkerDetailsProps {
  worker: Worker;
}

export function WorkerDetails({ worker }: WorkerDetailsProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(worker);

  const { mutate: updateWorkerMutation, isPending: isUpdating } = useMutation({
    mutationFn: (updatedData: Partial<Worker>) => updateWorker(worker.id, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers', worker.id] });
      queryClient.invalidateQueries({ queryKey: ['workers', { siteId: worker.siteId }] });
      setIsEditing(false);
      toast.success("Worker details updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update details", { description: error.message });
    }
  });

  const handleSave = () => {
    const { id, siteId, paidAmount, pendingAmount, ...updatableData } = formData;
    updateWorkerMutation(updatableData);
  };

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Worker Details</CardTitle>
            {!isEditing ? (
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4" />
                </Button>
            ) : (
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                        <X className="w-4 h-4" />
                    </Button>
                    <Button size="icon" onClick={handleSave} disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                </div>
            )}
        </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={!isEditing} />
                </div>
            </div>
            <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Wage Type</Label>
                        <Select value={formData.wageType} onValueChange={(val: "daily" | "hourly") => setFormData({...formData, wageType: val})} disabled={!isEditing}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="hourly">Hourly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Wage Amount</Label>
                        <Input type="number" value={formData.wageAmount} onChange={e => setFormData({...formData, wageAmount: Number(e.target.value)})} disabled={!isEditing} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Financials</Label>
                    <div className="flex gap-4 text-sm p-3 bg-muted rounded-md">
                        <div className="flex-1 text-center">
                            <p className="text-muted-foreground">Pending</p>
                            <p className="font-bold text-lg text-orange-500">₹{worker.pendingAmount.toFixed(2)}</p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-muted-foreground">Paid</p>
                            <p className="font-bold text-lg text-green-500">₹{worker.paidAmount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
