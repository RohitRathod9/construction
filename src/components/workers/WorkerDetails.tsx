import { Worker } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Briefcase, Calendar, IndianRupee, CreditCard, FileText } from "lucide-react";

interface WorkerDetailsProps {
  worker: Worker;
  onUpdate: () => void;
}

export function WorkerDetails({ worker }: WorkerDetailsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="font-medium">{worker.fullName}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </p>
              <p className="font-medium">{worker.phone}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Role
              </p>
              <p className="font-medium">{worker.role}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Join Date
              </p>
              <p className="font-medium">{new Date(worker.joinDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Wage Details
              </p>
              <div className="flex items-center gap-2">
                <Badge>{worker.wageType}</Badge>
                <span className="font-medium">₹{worker.wageValue}</span>
              </div>
            </div>
            
            {worker.idNumber && (
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  ID Number
                </p>
                <p className="font-medium">{worker.idNumber}</p>
              </div>
            )}
            
            {worker.bankDetails && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bank Details</p>
                <p className="font-medium">{worker.bankDetails}</p>
              </div>
            )}
            
            {worker.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </p>
                <p className="text-sm">{worker.notes}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge variant={worker.isActive ? "default" : "secondary"}>
                {worker.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
