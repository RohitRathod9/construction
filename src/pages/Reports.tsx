import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

const Reports = () => {
  const [stats, setStats] = useState({
    totalSites: 0,
    totalWorkers: 0,
    totalAttendance: 0,
    totalPayments: 0,
    totalPaid: 0,
    totalPending: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const sites = storage.getSites();
    const workers = storage.getWorkers();
    const attendance = storage.getAttendance();
    const payments = storage.getPayments();

    setStats({
      totalSites: sites.filter(s => s.isActive).length,
      totalWorkers: workers.filter(w => w.isActive).length,
      totalAttendance: attendance.length,
      totalPayments: payments.length,
      totalPaid: payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
      totalPending: payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0),
    });
  };

  const handleExportData = () => {
    const data = {
      sites: storage.getSites(),
      workers: storage.getWorkers(),
      attendance: storage.getAttendance(),
      payments: storage.getPayments(),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crb_export_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    toast.success("Data exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Overview and data exports</p>
        </div>
        <Button onClick={handleExportData}>
          <Download className="w-4 h-4 mr-2" />
          Export All Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{stats.totalSites}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{stats.totalWorkers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{stats.totalAttendance}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{stats.totalPayments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-success">₹{stats.totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-destructive">₹{stats.totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium">Full Database Export</h3>
              <p className="text-sm text-muted-foreground">Download all data in JSON format</p>
            </div>
            <Button onClick={handleExportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium">Workers CSV</h3>
              <p className="text-sm text-muted-foreground">Export all workers data as CSV</p>
            </div>
            <Button variant="outline" onClick={() => {
              const workers = storage.getWorkers();
              const csv = [
                ["ID", "Name", "Phone", "Role", "Site ID", "Wage Type", "Wage Value", "Join Date", "Status"],
                ...workers.map(w => [
                  w.id, w.fullName, w.phone, w.role, w.siteId,
                  w.wageType, w.wageValue.toString(), w.joinDate,
                  w.isActive ? "Active" : "Inactive"
                ])
              ].map(row => row.join(",")).join("\n");
              
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "workers_export.csv";
              a.click();
              toast.success("Workers CSV exported");
            }}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
