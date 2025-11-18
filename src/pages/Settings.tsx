import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { resetToSampleData } from "@/lib/mockData";
import { toast } from "sonner";
import { Moon, Sun, RefreshCw, Download } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage application preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>Speed up your workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Focus global search</span>
              <kbd className="px-2 py-1 text-xs bg-muted rounded">F</kbd>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">New worker</span>
              <kbd className="px-2 py-1 text-xs bg-muted rounded">N</kbd>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Open payroll</span>
              <kbd className="px-2 py-1 text-xs bg-muted rounded">P</kbd>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Show shortcuts</span>
              <kbd className="px-2 py-1 text-xs bg-muted rounded">?</kbd>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Construction Record Book</strong></p>
            <p>Version 1.0.0</p>
            <p className="text-muted-foreground">
              A comprehensive system for managing construction sites, workers, attendance, and payroll.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
