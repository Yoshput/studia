"use client";

import React from "react";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { formatDateIndo } from "@/lib/utils";

interface DeadlinePickerProps {
  value: string; // YYYY-MM-DDTHH:mm or ISO string
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

export function DeadlinePicker({
  value,
  onChange,
  label = "Batas Waktu (Deadline)",
  required = true,
}: DeadlinePickerProps) {
  // Parse date and time from value
  let datePart = "";
  let timePart = "23:59";

  if (value) {
    if (value.includes("T")) {
      const [d, t] = value.split("T");
      datePart = d || "";
      timePart = t ? t.slice(0, 5) : "23:59";
    } else {
      datePart = value.slice(0, 10);
    }
  }

  const updateDateTime = (newDate: string, newTime: string) => {
    const finalDate = newDate || new Date().toISOString().slice(0, 10);
    const finalTime = newTime || "23:59";
    onChange(`${finalDate}T${finalTime}`);
  };

  const setQuickDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const dateStr = d.toISOString().slice(0, 10);
    updateDateTime(dateStr, timePart);
  };

  const setQuickTime = (timeStr: string) => {
    updateDateTime(datePart, timeStr);
  };

  // Preview formatted text
  let previewText = "";
  if (datePart) {
    try {
      const previewDate = new Date(`${datePart}T${timePart}:00`);
      if (!isNaN(previewDate.getTime())) {
        previewText = `${formatDateIndo(previewDate)} pukul ${timePart} WIB`;
      }
    } catch {}
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[13px] font-medium text-ios-textSecondary">
          {label} {required && <span className="text-ios-danger">*</span>}
        </label>
        {previewText && (
          <span className="text-[11px] font-semibold text-ios-accent truncate max-w-[200px]">
            {previewText}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Date Input */}
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="date"
              value={datePart}
              onClick={(e) => {
                try {
                  (e.target as any).showPicker?.();
                } catch {}
              }}
              onChange={(e) => updateDateTime(e.target.value, timePart)}
              className="w-full px-3.5 py-2.5 rounded-btn bg-ios-surfaceSecondary border border-ios-border text-[14px] font-medium text-ios-textPrimary focus:outline-none focus:border-ios-accent focus:bg-ios-surface transition-all cursor-pointer min-h-[44px]"
              required={required}
            />
            <Calendar className="w-4 h-4 text-ios-accent absolute right-3.5 top-3.5 pointer-events-none opacity-80" />
          </div>

          {/* Quick Date Pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-ios-textSecondary mr-0.5">Tgl:</span>
            {[
              { label: "Hari Ini", days: 0 },
              { label: "Besok", days: 1 },
              { label: "+3 Hari", days: 3 },
              { label: "+1 Minggu", days: 7 },
            ].map((p) => {
              const d = new Date();
              d.setDate(d.getDate() + p.days);
              const targetStr = d.toISOString().slice(0, 10);
              const isSelected = datePart === targetStr;

              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setQuickDate(p.days)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all ${
                    isSelected
                      ? "bg-ios-accent text-white border-ios-accent shadow-sm"
                      : "bg-ios-surface border-ios-border hover:border-ios-accent/50 text-ios-textSecondary"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Input */}
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="time"
              value={timePart}
              onClick={(e) => {
                try {
                  (e.target as any).showPicker?.();
                } catch {}
              }}
              onChange={(e) => updateDateTime(datePart, e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-btn bg-ios-surfaceSecondary border border-ios-border text-[14px] font-medium text-ios-textPrimary focus:outline-none focus:border-ios-accent focus:bg-ios-surface transition-all cursor-pointer min-h-[44px]"
              required={required}
            />
            <Clock className="w-4 h-4 text-ios-accent absolute right-3.5 top-3.5 pointer-events-none opacity-80" />
          </div>

          {/* Quick Time Pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-ios-textSecondary mr-0.5">Jam:</span>
            {[
              { label: "23:59 (CeLOE)", time: "23:59" },
              { label: "17:00", time: "17:00" },
              { label: "12:00", time: "12:00" },
              { label: "08:00", time: "08:00" },
            ].map((p) => {
              const isSelected = timePart === p.time;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setQuickTime(p.time)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all ${
                    isSelected
                      ? "bg-ios-accent text-white border-ios-accent shadow-sm"
                      : "bg-ios-surface border-ios-border hover:border-ios-accent/50 text-ios-textSecondary"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}