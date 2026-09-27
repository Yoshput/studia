/**
 * Telkom University Informatics (IF) Course Catalog & Lecturer Knowledge Base
 * Automatically matches course codes, names, SKS, lecturers, and class schedules.
 */

export interface CourseCatalogItem {
  kode: string;
  nama: string;
  sks: number;
  warna: string;
  defaultRuang?: string;
  aliases: string[];
}

export const TELKOM_COURSES_CATALOG: Record<string, CourseCatalogItem> = {
  CAK3KAB3: {
    kode: "CAK3KAB3",
    nama: "Tata Tulis Ilmiah",
    sks: 2,
    warna: "#34C759",
    defaultRuang: "DC-104",
    aliases: ["tata tulis ilmiah", "scientific writing", "tti"],
  },
  CAK3FAB3: {
    kode: "CAK3FAB3",
    nama: "Manajemen Projek TIK",
    sks: 3,
    warna: "#007AFF",
    defaultRuang: "DC-203",
    aliases: ["manajemen projek tik", "ict project management", "manpro", "mp tik"],
  },
  CAK3EAB3: {
    kode: "CAK3EAB3",
    nama: "Komputasi Awan dan Terdistribusi",
    sks: 3,
    warna: "#5856D6",
    defaultRuang: "Lab Cloud / RPL 1",
    aliases: ["komputasi awan dan terdistribusi", "cloud and distributed computing", "cloud computing"],
  },
  CAK3CAB3: {
    kode: "CAK3CAB3",
    nama: "Keamanan Siber",
    sks: 3,
    warna: "#FF2D55",
    defaultRuang: "Lab Cyber / DC-101",
    aliases: ["keamanan siber", "cyber security", "cybersecurity", "kamsib"],
  },
  UBKXACB2: {
    kode: "UBKXACB2",
    nama: "Kewarganegaraan",
    sks: 2,
    warna: "#FF9500",
    defaultRuang: "DC-201",
    aliases: ["kewarganegaraan", "civics", "pkn"],
  },
  CAK3GAB2: {
    kode: "CAK3GAB2",
    nama: "Sosio-Informatik dan Keprofesian",
    sks: 2,
    warna: "#AF52DE",
    defaultRuang: "DC-103",
    aliases: ["sosio-informatik dan keprofesian", "sosio-informatika", "sosio informatika", "sosio"],
  },
  CAK3DAB3: {
    kode: "CAK3DAB3",
    nama: "Kecerdasan Artifisial",
    sks: 3,
    warna: "#32ADE6",
    defaultRuang: "DC-102",
    aliases: ["kecerdasan artifisial", "artificial intelligence", "ai"],
  },
  UBKXCCB2: {
    kode: "UBKXCCB2",
    nama: "Bahasa Indonesia",
    sks: 2,
    warna: "#FF3B30",
    defaultRuang: "DC-202",
    aliases: ["bahasa indonesia", "indonesian language", "bind"],
  },
  CAK4RBB3: {
    kode: "CAK4RBB3",
    nama: "Sistem Keamanan Cerdas",
    sks: 3,
    warna: "#00C7BE",
    defaultRuang: "Lab Jarkom",
    aliases: ["sistem keamanan cerdas", "intelligent security system", "skc"],
  },
};

export const LECTURERS_DICT: Record<string, string> = {
  THX: "Trihastuti Yuniati, S.T., M.T.",
  AFF: "Affan Hilmy Natsir, S.T., M.T.",
  IPA: "Ipam Fuaddina Adam, S.Kom., M.Kom.",
  NGH: "Hilal Hudan Nuha, S.T., M.T.",
  AUS: "Aulia Sholichah Iman Nurkhotimah, S.Pd., M.Pd.",
  ANT: "Annisaa Utami, S.Kom., M.Kom.",
  YDR: "Yesy Diah Rosita, S.Kom., M.Kom.",
  LLO: "M. Lukman Leksono, S.S., M.Pd.",
  GWS: "Gunawan Wibisono, S.T., M.T.",
};

export interface ClassScheduleTemplateItem {
  kode: string;
  nama: string;
  dosen: string;
  sks: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  ruang: string;
  warna: string;
}

export const CLASS_TEMPLATES: Record<string, ClassScheduleTemplateItem[]> = {
  "S1IF-12-07": [
    {
      kode: "CAK3KAB3",
      nama: "Tata Tulis Ilmiah",
      dosen: "Trihastuti Yuniati, S.T., M.T.",
      sks: 2,
      hari: "Senin",
      jam_mulai: "07:30",
      jam_selesai: "10:30",
      ruang: "DC-104",
      warna: "#34C759",
    },
    {
      kode: "CAK3FAB3",
      nama: "Manajemen Projek TIK",
      dosen: "Affan Hilmy Natsir, S.T., M.T.",
      sks: 3,
      hari: "Selasa",
      jam_mulai: "07:30",
      jam_selesai: "10:30",
      ruang: "DC-203",
      warna: "#007AFF",
    },
    {
      kode: "CAK3EAB3",
      nama: "Komputasi Awan dan Terdistribusi",
      dosen: "Ipam Fuaddina Adam, S.Kom., M.Kom.",
      sks: 3,
      hari: "Selasa",
      jam_mulai: "12:30",
      jam_selesai: "15:30",
      ruang: "Lab Cloud / RPL 1",
      warna: "#5856D6",
    },
    {
      kode: "CAK3CAB3",
      nama: "Keamanan Siber",
      dosen: "Hilal Hudan Nuha, S.T., M.T.",
      sks: 3,
      hari: "Rabu",
      jam_mulai: "12:30",
      jam_selesai: "15:30",
      ruang: "Lab Cyber / DC-101",
      warna: "#FF2D55",
    },
    {
      kode: "UBKXACB2",
      nama: "Kewarganegaraan",
      dosen: "Aulia Sholichah Iman Nurkhotimah, S.Pd., M.Pd.",
      sks: 2,
      hari: "Kamis",
      jam_mulai: "06:30",
      jam_selesai: "08:30",
      ruang: "DC-201",
      warna: "#FF9500",
    },
    {
      kode: "CAK3GAB2",
      nama: "Sosio-Informatik dan Keprofesian",
      dosen: "Annisaa Utami, S.Kom., M.Kom.",
      sks: 2,
      hari: "Kamis",
      jam_mulai: "13:30",
      jam_selesai: "15:30",
      ruang: "DC-103",
      warna: "#AF52DE",
    },
    {
      kode: "CAK3DAB3",
      nama: "Kecerdasan Artifisial",
      dosen: "Yesy Diah Rosita, S.Kom., M.Kom.",
      sks: 3,
      hari: "Kamis",
      jam_mulai: "15:30",
      jam_selesai: "18:30",
      ruang: "DC-102",
      warna: "#32ADE6",
    },
    {
      kode: "UBKXCCB2",
      nama: "Bahasa Indonesia",
      dosen: "M. Lukman Leksono, S.S., M.Pd.",
      sks: 2,
      hari: "Jumat",
      jam_mulai: "09:30",
      jam_selesai: "11:30",
      ruang: "DC-202",
      warna: "#FF3B30",
    },
    {
      kode: "CAK4RBB3",
      nama: "Sistem Keamanan Cerdas",
      dosen: "Gunawan Wibisono, S.T., M.T.",
      sks: 3,
      hari: "Jumat",
      jam_mulai: "13:30",
      jam_selesai: "16:30",
      ruang: "Lab Jarkom",
      warna: "#00C7BE",
    },
  ],
  "S1IF-12-06": [
    {
      kode: "CAK3KAB3",
      nama: "Tata Tulis Ilmiah",
      dosen: "Trihastuti Yuniati, S.T., M.T.",
      sks: 2,
      hari: "Senin",
      jam_mulai: "07:30",
      jam_selesai: "10:30",
      ruang: "DC-104",
      warna: "#34C759",
    },
    {
      kode: "CAK3CAB3",
      nama: "Keamanan Siber",
      dosen: "Hilal Hudan Nuha, S.T., M.T.",
      sks: 3,
      hari: "Selasa",
      jam_mulai: "15:30",
      jam_selesai: "18:30",
      ruang: "Lab Cyber / DC-101",
      warna: "#FF2D55",
    },
    {
      kode: "CAK3FAB3",
      nama: "Manajemen Projek TIK",
      dosen: "Affan Hilmy Natsir, S.T., M.T.",
      sks: 3,
      hari: "Rabu",
      jam_mulai: "12:30",
      jam_selesai: "15:30",
      ruang: "DC-203",
      warna: "#007AFF",
    },
    {
      kode: "UBKXACB2",
      nama: "Kewarganegaraan",
      dosen: "Aulia Sholichah Iman Nurkhotimah, S.Pd., M.Pd.",
      sks: 2,
      hari: "Kamis",
      jam_mulai: "06:30",
      jam_selesai: "08:30",
      ruang: "DC-201",
      warna: "#FF9500",
    },
    {
      kode: "CAK3EAB3",
      nama: "Komputasi Awan dan Terdistribusi",
      dosen: "Ipam Fuaddina Adam, S.Kom., M.Kom.",
      sks: 3,
      hari: "Kamis",
      jam_mulai: "15:30",
      jam_selesai: "18:30",
      ruang: "Lab Cloud / RPL 1",
      warna: "#5856D6",
    },
    {
      kode: "CAK4RBB3",
      nama: "Sistem Keamanan Cerdas",
      dosen: "Gunawan Wibisono, S.T., M.T.",
      sks: 3,
      hari: "Jumat",
      jam_mulai: "08:30",
      jam_selesai: "11:30",
      ruang: "Lab Jarkom",
      warna: "#00C7BE",
    },
    {
      kode: "CAK3GAB2",
      nama: "Sosio-Informatik dan Keprofesian",
      dosen: "Annisaa Utami, S.Kom., M.Kom.",
      sks: 2,
      hari: "Jumat",
      jam_mulai: "13:30",
      jam_selesai: "15:30",
      ruang: "DC-103",
      warna: "#AF52DE",
    },
    {
      kode: "CAK3DAB3",
      nama: "Kecerdasan Artifisial",
      dosen: "Yesy Diah Rosita, S.Kom., M.Kom.",
      sks: 3,
      hari: "Jumat",
      jam_mulai: "15:30",
      jam_selesai: "18:30",
      ruang: "DC-102",
      warna: "#32ADE6",
    },
  ],
};

/**
 * Extracts and resolves course metadata from raw LMS strings
 * (e.g. "CAK3CAB3-S1IF-12-07" or "BAHASA INDONESIA S1IF-12-GAB-02 [LLO]")
 */
export function resolveCourseMeta(
  rawCourseString: string,
  detectedClass?: string
): {
  kode: string;
  nama: string;
  sks: number;
  dosen: string;
  ruang: string;
  warna: string;
  hari?: string;
  jam_mulai?: string;
  jam_selesai?: string;
} {
  const cleanStr = (rawCourseString || "").trim();

  // 1. Try to extract course code (e.g. CAK3CAB3, UBKXCCB2)
  const codeMatch = cleanStr.match(/[A-Z]{3,4}[0-9][A-Z0-9]{3,4}/i);
  const matchedCode = codeMatch ? codeMatch[0].toUpperCase() : "";

  // 2. Try to extract lecturer code in brackets [THX], [AFF]
  const lectMatch = cleanStr.match(/\[([A-Z]{2,4})\]/i);
  let resolvedDosen = "Dosen Pengampu";
  if (lectMatch && LECTURERS_DICT[lectMatch[1].toUpperCase()]) {
    resolvedDosen = LECTURERS_DICT[lectMatch[1].toUpperCase()];
  }

  // 3. Check if we have standard catalog info for this code
  const catalogItem = matchedCode ? TELKOM_COURSES_CATALOG[matchedCode] : undefined;

  let resolvedNama = catalogItem?.nama;
  if (!resolvedNama) {
    // Try matching by course title in string
    const lower = cleanStr.toLowerCase();
    for (const item of Object.values(TELKOM_COURSES_CATALOG)) {
      if (item.aliases.some((a) => lower.includes(a))) {
        resolvedNama = item.nama;
        break;
      }
    }
  }

  if (!resolvedNama) {
    // Fallback: clean up raw string
    resolvedNama = cleanStr
      .replace(/\[.*?\]/g, "")
      .replace(/S1IF-[\w-]+/gi, "")
      .replace(/-\s*$/, "")
      .trim();
    if (!resolvedNama) resolvedNama = cleanStr;
  }

  const resolvedSks = catalogItem?.sks || 3;
  const resolvedWarna = catalogItem?.warna || "#007AFF";
  const resolvedRuang = catalogItem?.defaultRuang || "Ruang Kuliah";

  // 4. If class template exists, check if there's scheduled day and time
  const classKey = detectedClass?.toUpperCase().replace(/\s+/g, "");
  if (classKey && CLASS_TEMPLATES[classKey]) {
    const templateItem = CLASS_TEMPLATES[classKey].find(
      (t) => t.kode === matchedCode || t.nama.toLowerCase() === resolvedNama?.toLowerCase()
    );
    if (templateItem) {
      return {
        kode: matchedCode || templateItem.kode,
        nama: templateItem.nama,
        sks: templateItem.sks,
        dosen: templateItem.dosen || resolvedDosen,
        ruang: templateItem.ruang,
        warna: templateItem.warna,
        hari: templateItem.hari,
        jam_mulai: templateItem.jam_mulai,
        jam_selesai: templateItem.jam_selesai,
      };
    }
  }

  return {
    kode: matchedCode || "CELOE",
    nama: resolvedNama,
    sks: resolvedSks,
    dosen: resolvedDosen,
    ruang: resolvedRuang,
    warna: resolvedWarna,
  };
}
