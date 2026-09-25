/**
 * iCal / ICS Parser Utility for Telkom University CeLOE (Moodle LMS)
 * Zero-dependency robust parser for calendar feeds.
 */

export interface ParsedLmsEvent {
  uid: string;
  judul: string;
  deskripsi: string;
  deadline: Date;
  courseName?: string;
  url?: string;
  prioritas: "rendah" | "sedang" | "tinggi";
}

function parseIcalDate(val: string): Date {
  // Format: 20260930T165900Z or 20260930T165900 or 20260930
  const clean = val.replace(/[^0-9TZ]/g, "");
  if (clean.length === 8) {
    const year = parseInt(clean.substring(0, 4), 10);
    const month = parseInt(clean.substring(4, 6), 10) - 1;
    const day = parseInt(clean.substring(6, 8), 10);
    return new Date(Date.UTC(year, month, day, 23, 59, 59));
  }

  const match = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (match) {
    const [_, y, m, d, hh, mm, ss, z] = match;
    if (z === "Z") {
      return new Date(
        Date.UTC(
          parseInt(y, 10),
          parseInt(m, 10) - 1,
          parseInt(d, 10),
          parseInt(hh, 10),
          parseInt(mm, 10),
          parseInt(ss, 10)
        )
      );
    }
    // Local / Asia/Jakarta (UTC+7)
    return new Date(
      parseInt(y, 10),
      parseInt(m, 10) - 1,
      parseInt(d, 10),
      parseInt(hh, 10),
      parseInt(mm, 10),
      parseInt(ss, 10)
    );
  }

  // Fallback native parse
  const fallback = new Date(val);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

export function parseMoodleIcs(icsText: string): ParsedLmsEvent[] {
  // 1. Unfold multi-line strings (RFC 5545 specifies that lines starting with space or tab continue the previous line)
  const unfolded = icsText.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  const events: ParsedLmsEvent[] = [];
  let inEvent = false;
  let currentEvent: Record<string, string> = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      currentEvent = {};
      continue;
    }

    if (line === "END:VEVENT") {
      inEvent = false;
      if (currentEvent.UID && (currentEvent.DTEND || currentEvent.DTSTART || currentEvent.DUE)) {
        // Extract fields
        const uid = currentEvent.UID;
        let rawSummary = currentEvent.SUMMARY || "Tugas LMS CeLOE";
        
        // Clean Moodle standard suffixes
        rawSummary = rawSummary
          .replace(/ is due$/i, "")
          .replace(/ must be completed$/i, "")
          .replace(/ closes$/i, "")
          .replace(/ opens$/i, "")
          .replace(/ is open$/i, "")
          .trim();

        let description = (currentEvent.DESCRIPTION || "")
          .replace(/\\n/g, "\n")
          .replace(/\\,/g, ",")
          .replace(/\\;/g, ";")
          .trim();

        const dateStr = currentEvent.DTEND || currentEvent.DUE || currentEvent.DTSTART;
        const deadline = parseIcalDate(dateStr);

        // Course name extraction from CATEGORIES or SUMMARY pattern
        let courseName = currentEvent.CATEGORIES || "";
        if (!courseName && rawSummary.includes(" - ")) {
          const parts = rawSummary.split(" - ");
          if (parts.length > 1) {
            courseName = parts[0].trim();
          }
        }

        // Determine priority based on keyword
        let prioritas: "rendah" | "sedang" | "tinggi" = "sedang";
        const lowerTitle = rawSummary.toLowerCase();
        const lowerDesc = description.toLowerCase();
        if (
          lowerTitle.includes("uts") ||
          lowerTitle.includes("uas") ||
          lowerTitle.includes("tubes") ||
          lowerTitle.includes("projek") ||
          lowerTitle.includes("project")
        ) {
          prioritas = "tinggi";
        } else if (lowerTitle.includes("kuis") || lowerTitle.includes("quiz")) {
          prioritas = "sedang";
        } else if (lowerDesc.includes("opsional") || lowerTitle.includes("forum")) {
          prioritas = "rendah";
        }

        events.push({
          uid,
          judul: rawSummary,
          deskripsi: description,
          deadline,
          courseName: courseName || undefined,
          url: currentEvent.URL || undefined,
          prioritas,
        });
      }
      currentEvent = {};
      continue;
    }

    if (inEvent) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        let key = line.substring(0, colonIdx);
        const value = line.substring(colonIdx + 1);

        // Strip parameters like DTSTART;VALUE=DATE:
        if (key.includes(";")) {
          key = key.split(";")[0];
        }
        currentEvent[key.toUpperCase()] = value;
      }
    }
  }

  return events;
}
