"use client";

import React, { useEffect, useState } from "react";
import { TaskDeadlineWidget } from "@/components/widgets/TaskDeadlineWidget";
import { TugasDeadline } from "@/types";
import { Loader2, RefreshCw } from "lucide-react";

export default function WidgetPage() {
  const [tasks, setTasks] = useState<TugasDeadline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tugas");
      if (res.ok) {
        const data = await res.json();
        if (data.tugas) {
          setTasks(data.tugas);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data tugas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f9fa] dark:bg-black p-3 sm:p-4 flex flex-col justify-between select-none">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-ios-textSecondary gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-ios-accent" />
            <span className="text-[13px] font-medium">Memuat deadline tugas...</span>
          </div>
        ) : (
          <TaskDeadlineWidget
            tasks={tasks}
            onTaskUpdated={fetchTasks}
            isStandalone={true}
            className="flex-1 shadow-sm border border-ios-border/80"
          />
        )}
      </div>

      <div className="mt-3 text-center">
        <button
          onClick={fetchTasks}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ios-textSecondary hover:text-ios-textPrimary transition-colors py-1 px-2.5 rounded-full hover:bg-ios-surfaceSecondary"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Sinkronkan Otomatis (Studia Widget)</span>
        </button>
      </div>
    </main>
  );
}
