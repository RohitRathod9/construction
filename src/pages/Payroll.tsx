import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Site, Worker } from "@/lib/types";
import { getSites } from "@/lib/firebase/firestore.sites";
import { getWorkersBySite } from "@/lib/firebase/firestore.workers";
import { getAttendanceByWorker } from "@/lib/firebase/firestore.attendance";
import { getPaymentsByWorker } from "@/lib/firebase/firestore.payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, FileText, IndianRupee, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Payroll = () => {
  const [searchParams] = useSearchParams();
  const [selectedSiteId, setSelectedSiteId] = useState(searchParams.get("site") || "");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: sites = [], isLoading: sitesLoading } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: getSites,
  });

  const { data: workers = [], isLoading: workersLoading } = useQuery<Worker[]>({
    queryKey: ["workers", selectedSiteId],
    queryFn: () => getWorkersBySite(selectedSiteId),
    enabled: !!selectedSiteId,
  });

  const { data: payrollDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["payrollDetails", selectedSiteId, selectedMonth, workers],
    queryFn: async () => {
      if (!workers || workers.length === 0) return { attendance: [], payments: [] };
      const monthStart = `${selectedMonth}-01`;
      const monthEnd = new Date(selectedMonth + "-01");
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      const monthEndStr = monthEnd.toISOString().split("T")[0];

      const attendancePromises = workers.map(w => getAttendanceByWorker(w.id));
      const paymentPromises = workers.map(w => getPaymentsByWorker(w.id));

      const allAttendance = (await Promise.all(attendancePromises)).flat();
      const allPayments = (await Promise.all(paymentPromises)).flat();
      
      const monthlyAttendance = allAttendance.filter(a => a.date >= monthStart && a.date <= monthEndStr);
      const monthlyPayments = allPayments.filter(p => p.date >= monthStart && p.date <= monthEndStr);

      return { attendance: monthlyAttendance, payments: monthlyPayments };
    },
    enabled: !!selectedSiteId && !!workers && workers.length > 0,
  });

  const payrollData = useMemo(() => {
    if (!workers.length || !payrollDetails) return [];

    const activeWorkers = workers.filter(w => w.isActive);

    return activeWorkers.map(worker => {
      const workerAttendance = payrollDetails.attendance.filter(a => a.workerId === worker.id);
      
      let grossSalary = 0;
      let warnings: string[] = [];

      if (worker.wageType === "hourly") {
        const totalHours = workerAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
        grossSalary = totalHours * worker.wageValue;
      } else if (worker.wageType === "daily") {
        const daysPresent = workerAttendance.filter(a => a.status === 'present' || a.status === 'halfday').length;
        const halfDays = workerAttendance.filter(a => a.status === 'halfday').length;
        grossSalary = (daysPresent - halfDays * 0.5) * worker.wageValue;
      } else if (worker.wageType === "monthly") {
        grossSalary = worker.wageValue;
      }
      
      if (workerAttendance.some(a => a.status === 'present' && !a.timeOut)) {
        warnings.push("Missing check-out times");
      }

      const advances = payrollDetails.payments
        .filter(p => p.workerId === worker.id)
        .reduce((sum, p) => sum + p.amount, 0);

      const netSalary = grossSalary - advances;

      return {
        worker,
        attendance: workerAttendance,
        grossSalary,
        advances,
        netSalary,
        warnings,
        daysPresent: workerAttendance.filter(a => a.status === 'present' || a.status === 'halfday').length,
      };
    });
  }, [workers, payrollDetails]);

  const isLoading = sitesLoading || workersLoading || detailsLoading;

  const totalGross = payrollData.reduce((sum, d) => sum + d.grossSalary, 0);
  const totalAdvances = payrollData.reduce((sum, d) => sum + d.advances, 0);
  const totalNet = payrollData.reduce((sum, d) => sum + d.netSalary, 0);

  const handleGeneratePayslips = () => {
    toast.info("Generating payslips...", { duration: 1500 });
    setTimeout(() => {
      toast.success("Payslips generated! (Simulated PDF download)");
    }, 1500);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Worker Name", "Role", "Wage Type", "Days Present", "Gross Salary", "Advances", "Net Salary", "Warnings"],
      ...payrollData.map(d => [
        d.worker.fullName,
        d.worker.role,
        d.worker.wageType,
        d.daysPresent.toString(),
        d.grossSalary.toFixed(2),
        d.advances.toFixed(2),
        d.netSalary.toFixed(2),
        d.warnings.join("; ")
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll_${selectedSiteId}_${selectedMonth}.csv`;
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
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId} disabled={sitesLoading}>
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
                <Button onClick={handleExportCSV} variant="outline" disabled={isLoading || payrollData.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
                <Button onClick={handleGeneratePayslips} disabled={isLoading || payrollData.length === 0}>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Payslips
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>}

      {!isLoading && selectedSiteId && payrollData.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Gross Salary</p>
                  <p className="text-3xl font-bold flex items-center justify-center text-primary">
                    <IndianRupee className="w-6 h-6" />
                    {totalGross.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
                    {totalAdvances.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Net Payable</p>
                  <p className="text-3xl font-bold flex items-center justify-center" style={{color: 'var(--success)'}}>
                    <IndianRupee className="w-6 h-6" />
                    {totalNet.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-3 text-sm font-medium text-muted-foreground">Worker</th>
                      <th className="p-3 text-sm font-medium text-muted-foreground">Days</th>
                      <th className="p-3 text-sm font-medium text-muted-foreground text-right">Gross</th>
                      <th className="p-3 text-sm font-medium text-muted-foreground text-right">Advances</th>
                      <th className="p-3 text-sm font-medium text-muted-foreground text-right">Net</th>
                      <th className="p-3 text-sm font-medium text-muted-foreground">Warnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.map((data) => (
                      <tr key={data.worker.id} className="border-b">
                        <td className="p-3 font-medium">{data.worker.fullName} <br/><span className="text-xs text-muted-foreground">{data.worker.role}</span></td>
                        <td className="p-3">{data.daysPresent}</td>
                        <td className="p-3 text-right">₹{data.grossSalary.toFixed(2)}</td>
                        <td className="p-3 text-right text-destructive">₹{data.advances.toFixed(2)}</td>
                        <td className="p-3 text-right font-bold">₹{data.netSalary.toFixed(2)}</td>
                        <td className="p-3">
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

      {!isLoading && selectedSiteId && payrollData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No payroll data for the selected site and month.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Payroll;
