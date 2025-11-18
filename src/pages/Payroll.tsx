import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { storage } from "@/lib/storage";
import { Site, Worker, Attendance, Payment } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, FileText, IndianRupee } from "lucide-react";
import { toast } from "sonner";

const Payroll = () => {
  const [searchParams] = useSearchParams();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState(searchParams.get("site") || "");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payrollData, setPayrollData] = useState<any[]>([]);

  useEffect(() => {
    setSites(storage.getSites());
  }, []);

  useEffect(() => {
    if (selectedSiteId) {
      calculatePayroll();
    }
  }, [selectedSiteId, selectedMonth]);

  const calculatePayroll = () => {
    const workers = storage.getWorkers().filter(w => w.siteId === selectedSiteId && w.isActive);
    const attendance = storage.getAttendance();
    const payments = storage.getPayments();

    const monthStart = `${selectedMonth}-01`;
    const monthEnd = new Date(selectedMonth + "-01");
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    const monthEndStr = monthEnd.toISOString().split("T")[0];

    const data = workers.map(worker => {
      const workerAttendance = attendance.filter(
        a => a.workerId === worker.id && a.date >= monthStart && a.date <= monthEndStr
      );

      let grossSalary = 0;
      let warnings: string[] = [];

      if (worker.wageType === "hourly") {
        const totalHours = workerAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
        grossSalary = totalHours * worker.wageValue;
      } else if (worker.wageType === "daily") {
        const daysPresent = workerAttendance.length;
        grossSalary = daysPresent * worker.wageValue;
      } else if (worker.wageType === "monthly") {
        grossSalary = worker.wageValue;
      }

      // Check for missing timeOut
      const missingTimeOut = workerAttendance.some(a => !a.timeOut);
      if (missingTimeOut) {
        warnings.push("Missing check-out times");
      }

      const advances = payments.filter(
        p => p.workerId === worker.id && 
        p.type === "advance" && 
        p.date >= monthStart && 
        p.date <= monthEndStr
      ).reduce((sum, p) => sum + p.amount, 0);

      const netSalary = grossSalary - advances;

      return {
        worker,
        attendance: workerAttendance,
        grossSalary,
        advances,
        netSalary,
        warnings,
      };
    });

    setPayrollData(data);
  };

  const totalGross = payrollData.reduce((sum, d) => sum + d.grossSalary, 0);
  const totalAdvances = payrollData.reduce((sum, d) => sum + d.advances, 0);
  const totalNet = payrollData.reduce((sum, d) => sum + d.netSalary, 0);

  const handleGeneratePayslips = () => {
    toast.info("Generating payslips...", { duration: 2000 });
    
    setTimeout(() => {
      toast.success("Payslips generated! (Simulated - would download ZIP of PDFs)");
      storage.addAuditLog("generate_payslips", `Generated payslips for ${payrollData.length} workers`);
    }, 1500);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Worker Name", "Role", "Wage Type", "Days/Hours", "Gross Salary", "Advances", "Net Salary", "Warnings"],
      ...payrollData.map(d => [
        d.worker.fullName,
        d.worker.role,
        d.worker.wageType,
        d.attendance.length.toString(),
        d.grossSalary.toString(),
        d.advances.toString(),
        d.netSalary.toString(),
        d.warnings.join("; ")
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll_${selectedMonth}.csv`;
    a.click();
    toast.success("Payroll CSV exported");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payroll Generation</h1>
        <p className="text-muted-foreground mt-1">Calculate and generate payroll for workers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Site and Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Site</Label>
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
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
              <Label>Month</Label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleExportCSV} variant="outline" disabled={!selectedSiteId}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handleGeneratePayslips} disabled={!selectedSiteId}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Payslips
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSiteId && payrollData.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Gross Salary</p>
                  <p className="text-3xl font-bold flex items-center justify-center text-primary">
                    <IndianRupee className="w-6 h-6" />
                    {totalGross.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Advances</p>
                  <p className="text-3xl font-bold flex items-center justify-center text-destructive">
                    <IndianRupee className="w-6 h-6" />
                    {totalAdvances.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Net Payable</p>
                  <p className="text-3xl font-bold flex items-center justify-center text-success">
                    <IndianRupee className="w-6 h-6" />
                    {totalNet.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payroll Summary ({payrollData.length} workers)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left">
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Worker</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Days/Hours</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Gross</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Advances</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Net</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.map((data) => (
                      <tr key={data.worker.id} className="border-b border-border">
                        <td className="py-4 font-medium">{data.worker.fullName}</td>
                        <td className="py-4">{data.worker.role}</td>
                        <td className="py-4">{data.attendance.length}</td>
                        <td className="py-4">₹{data.grossSalary.toLocaleString()}</td>
                        <td className="py-4 text-destructive">₹{data.advances.toLocaleString()}</td>
                        <td className="py-4 font-bold">₹{data.netSalary.toLocaleString()}</td>
                        <td className="py-4">
                          {data.warnings.length > 0 && (
                            <span className="text-xs text-amber-600">{data.warnings.join(", ")}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {selectedSiteId && payrollData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No workers found for this site</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Payroll;
