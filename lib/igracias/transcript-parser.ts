/**
 * Parser for Telkom University iGracias Transcript & KHS Data
 * Parses raw copied table text, HTML tables, and generates 1-click bookmarklet.
 */

export interface ParsedKhsCourse {
  kode_matkul: string;
  nama_matkul: string;
  sks: number;
  nilai_huruf: string;
  nilai_indeks: number;
}

export interface ParsedSemesterGroup {
  nama_semester: string;
  tahun_ajaran: string;
  ips: number;
  total_sks: number;
  courses: ParsedKhsCourse[];
}

export interface ParseTranscriptResult {
  semesters: ParsedSemesterGroup[];
  ipk_kumulatif: number;
  total_sks_kumulatif: number;
  student_info?: {
    nama?: string;
    nim?: string;
    prodi?: string;
  };
}

const GRADE_INDEX_MAP: Record<string, number> = {
  A: 4.0,
  AB: 3.5,
  B: 3.0,
  BC: 2.5,
  C: 2.0,
  D: 1.0,
  E: 0.0,
  T: 0.0,
};

export function getGradeIndex(letter: string): number {
  const norm = letter.trim().toUpperCase();
  return GRADE_INDEX_MAP[norm] ?? 0.0;
}

/**
 * Parses raw text copied directly from iGracias KHS / Transkrip table
 */
export function parseIgraciasRawText(text: string): ParseTranscriptResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let currentSemesterName = "Semester 1";
  let currentTahunAjaran = "2024/2025 - Ganjil";
  const semesterMap: Map<string, { tahun: string; courses: ParsedKhsCourse[]; explicitIps?: number }> = new Map();

  let studentInfo: { nama?: string; nim?: string; prodi?: string } = {};

  // Regex patterns
  const nimRegex = /(?:NIM|Nomor Induk Mahasiswa)[\s:]*([0-9]{8,12})/i;
  const namaRegex = /(?:Nama|Nama Mahasiswa)[\s:]*([A-Za-z\s',.]+)/i;
  const prodiRegex = /(?:Program Studi|Prodi)[\s:]*([A-Za-z0-9\s-]+)/i;

  const semHeaderRegex = /(?:SEMESTER|SEM\.?)\s*([0-9IVX]+)(?:\s*[-–]\s*([0-9]{4}\/[0-9]{4}(?:\s*-\s*[A-Za-z]+)?))?/i;
  const ipsRegex = /(?:IPS|Indeks Prestasi Semester)[\s:]*([0-9]+(?:\.[0-9]+)?)/i;
  const ipkRegex = /(?:IPK|Indeks Prestasi Kumulatif)[\s:]*([0-9]+(?:\.[0-9]+)?)/i;

  let explicitIpk: number | null = null;

  for (const line of lines) {
    // 1. Detect student info
    const nimMatch = line.match(nimRegex);
    if (nimMatch) studentInfo.nim = nimMatch[1].trim();

    const namaMatch = line.match(namaRegex);
    if (namaMatch && !studentInfo.nama) studentInfo.nama = namaMatch[1].trim();

    const prodiMatch = line.match(prodiRegex);
    if (prodiMatch && !studentInfo.prodi) studentInfo.prodi = prodiMatch[1].trim();

    // 2. Detect Semester Header
    const semMatch = line.match(semHeaderRegex);
    if (semMatch) {
      let semNum = semMatch[1];
      // Convert Roman numeral if present
      const romanMap: Record<string, string> = {
        I: "1", II: "2", III: "3", IV: "4", V: "5", VI: "6", VII: "7", VIII: "8",
      };
      if (romanMap[semNum.toUpperCase()]) {
        semNum = romanMap[semNum.toUpperCase()];
      }
      currentSemesterName = `Semester ${semNum}`;
      if (semMatch[2]) {
        currentTahunAjaran = semMatch[2].trim();
      } else {
        // Approximate academic year based on semester number
        const semInt = parseInt(semNum, 10) || 1;
        const startYear = 2024 + Math.floor((semInt - 1) / 2);
        const term = semInt % 2 === 1 ? "Ganjil" : "Genap";
        currentTahunAjaran = `${startYear}/${startYear + 1} - ${term}`;
      }

      if (!semesterMap.has(currentSemesterName)) {
        semesterMap.set(currentSemesterName, { tahun: currentTahunAjaran, courses: [] });
      }
      continue;
    }

    // 3. Detect IPS / IPK in line
    const ipsMatch = line.match(ipsRegex);
    if (ipsMatch) {
      const ipsVal = parseFloat(ipsMatch[1]);
      if (!isNaN(ipsVal) && semesterMap.has(currentSemesterName)) {
        semesterMap.get(currentSemesterName)!.explicitIps = ipsVal;
      }
    }

    const ipkMatch = line.match(ipkRegex);
    if (ipkMatch) {
      const ipkVal = parseFloat(ipkMatch[1]);
      if (!isNaN(ipkVal)) explicitIpk = ipkVal;
    }

    // 4. Try parsing a Course Row
    // iGracias course row patterns:
    // Ex: "1	CAK1BAB3	Algoritma dan Pemrograman 1	3	AB	3.50"
    // Or: "CAK1BAB3 Algoritma dan Pemrograman 1 3 AB 3.5"
    // Tab or multi-space separated:
    const parts = line.split(/\t+|\s{2,}/);

    let foundCode = "";
    let foundName = "";
    let foundSks = 0;
    let foundGrade = "";
    let foundIndex = 0;

    // Search for course code pattern (e.g. CAK1BAB3, UBKXCCB2, IF101)
    const codeMatch = line.match(/\b([A-Z]{3,4}[0-9][A-Z0-9]{3,4}|[A-Z]{2,4}[0-9]{3})\b/);
    if (codeMatch) {
      foundCode = codeMatch[1].toUpperCase();

      // Look for grade letter (A, AB, B, BC, C, D, E)
      const gradeMatch = line.match(/\b(A|AB|B|BC|C|D|E)\b/);
      if (gradeMatch) {
        foundGrade = gradeMatch[1].toUpperCase();
        foundIndex = GRADE_INDEX_MAP[foundGrade] ?? 0.0;

        // Find SKS digit (usually 1, 2, 3, 4, or 6) right before or near grade
        const sksMatches = Array.from(line.matchAll(/\b([1-6])\b/g)).map((m) => parseInt(m[1], 10));
        // Take SKS that is NOT the table index row number if possible
        if (sksMatches.length > 0) {
          foundSks = sksMatches[sksMatches.length - 1]; // Often the last integer before grade
        } else {
          foundSks = 3;
        }

        // Extract Course Name between Code and SKS/Grade
        const codeIdx = line.indexOf(foundCode);
        const afterCode = line.substring(codeIdx + foundCode.length).trim();
        // Remove row numbers, SKS, Grade, Indeks from afterCode
        const cleanedName = afterCode
          .replace(new RegExp(`\\b${foundGrade}\\b.*$`), "")
          .replace(/\b\d+(\.\d+)?\b/g, "")
          .replace(/[|\t]/g, " ")
          .trim();

        if (cleanedName.length > 2) {
          foundName = cleanedName;
        } else {
          foundName = `Mata Kuliah ${foundCode}`;
        }

        if (!semesterMap.has(currentSemesterName)) {
          semesterMap.set(currentSemesterName, { tahun: currentTahunAjaran, courses: [] });
        }

        const semEntry = semesterMap.get(currentSemesterName)!;
        // Avoid duplicate courses in the same semester
        if (!semEntry.courses.some((c) => c.kode_matkul === foundCode)) {
          semEntry.courses.push({
            kode_matkul: foundCode,
            nama_matkul: foundName,
            sks: foundSks || 3,
            nilai_huruf: foundGrade,
            nilai_indeks: foundIndex,
          });
        }
      }
    }
  }

  // If no semester was detected but courses were found, group into Semester 1
  if (semesterMap.size === 0) {
    semesterMap.set("Semester 1", { tahun: "2024/2025 - Ganjil", courses: [] });
  }

  // Calculate IPS per semester & overall IPK
  const semesters: ParsedSemesterGroup[] = [];
  let grandTotalPoints = 0;
  let grandTotalSks = 0;

  for (const [namaSem, data] of semesterMap.entries()) {
    let semPoints = 0;
    let semSks = 0;

    for (const c of data.courses) {
      semPoints += c.sks * c.nilai_indeks;
      semSks += c.sks;
    }

    const calculatedIps = semSks > 0 ? Math.round((semPoints / semSks) * 100) / 100 : 0;
    const finalIps = data.explicitIps !== undefined ? data.explicitIps : calculatedIps;

    grandTotalPoints += semPoints;
    grandTotalSks += semSks;

    semesters.push({
      nama_semester: namaSem,
      tahun_ajaran: data.tahun,
      ips: finalIps,
      total_sks: semSks,
      courses: data.courses,
    });
  }

  const calculatedIpk = grandTotalSks > 0 ? Math.round((grandTotalPoints / grandTotalSks) * 100) / 100 : 0;
  const finalIpk = explicitIpk !== null ? explicitIpk : calculatedIpk;

  return {
    semesters,
    ipk_kumulatif: finalIpk,
    total_sks_kumulatif: grandTotalSks,
    student_info: studentInfo.nim ? studentInfo : undefined,
  };
}

/**
 * Generates bookmarklet javascript code that user can run directly on https://igracias.telkomuniversity.ac.id/
 * to automatically scrape KHS/Transcript and send it to Studia.
 */
export function generateIgraciasBookmarkletScript(targetHost: string): string {
  const code = `
javascript:(function(){
  try {
    if (!window.location.hostname.includes("telkomuniversity.ac.id")) {
      alert("Harap buka halaman iGracias Telkom University (https://igracias.telkomuniversity.ac.id/) terlebih dahulu!");
      return;
    }

    var tables = Array.from(document.querySelectorAll("table"));
    if (tables.length === 0) {
      alert("Tidak ditemukan tabel KHS atau Transkrip pada halaman ini. Pastikan Anda membuka menu Akademik -> Kartu Hasil Studi (KHS) atau Transkrip!");
      return;
    }

    var extractedText = document.body.innerText;
    
    // Create floating modal on iGracias
    var modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "20px";
    modal.style.right = "20px";
    modal.style.zIndex = "9999999";
    modal.style.background = "#ffffff";
    modal.style.color = "#111827";
    modal.style.padding = "20px";
    modal.style.borderRadius = "16px";
    modal.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.3)";
    modal.style.maxWidth = "420px";
    modal.style.fontFamily = "sans-serif";
    modal.style.border = "2px solid #B6252A";

    modal.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;font-weight:bold;color:#B6252A;">⚡ Sinkronisasi Studia Tel-U</h3>' +
      '<p style="margin:0 0 12px;font-size:12px;color:#4B5563;">Data transkrip & nilai KHS berhasil dibaca dari halaman iGracias ini. Kirim ke akun Studia Anda?</p>' +
      '<div style="display:flex;gap:8px;">' +
      '<button id="btnStudiaSync" style="flex:1;background:#B6252A;color:#fff;border:none;padding:10px 14px;border-radius:10px;font-weight:bold;cursor:pointer;">Kirim ke Studia</button>' +
      '<button id="btnStudiaCancel" style="background:#E5E7EB;color:#374151;border:none;padding:10px 14px;border-radius:10px;font-weight:bold;cursor:pointer;">Batal</button>' +
      '</div>';

    document.body.appendChild(modal);

    document.getElementById("btnStudiaCancel").onclick = function(){ modal.remove(); };

    document.getElementById("btnStudiaSync").onclick = function(){
      var btn = document.getElementById("btnStudiaSync");
      btn.innerText = "Mengirim...";
      btn.disabled = true;

      fetch("${targetHost}/api/igracias/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rawText: extractedText })
      })
      .then(function(res){ return res.json(); })
      .then(function(data){
        if (data.success) {
          modal.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;font-weight:bold;color:#10B981;">✅ Berhasil Disinkronkan!</h3>' +
            '<p style="margin:0 0 12px;font-size:12px;color:#4B5563;">' + data.message + '</p>' +
            '<a href="${targetHost}/nilai" target="_blank" style="display:block;text-align:center;background:#10B981;color:#fff;padding:10px;border-radius:10px;text-decoration:none;font-weight:bold;">Lihat Transkrip di Studia &rarr;</a>';
        } else {
          modal.innerHTML = '<h3 style="margin:0 0 8px;font-size:15px;font-weight:bold;color:#EF4444;">⚠️ Perhatian</h3>' +
            '<p style="margin:0 0 12px;font-size:12px;color:#4B5563;">' + (data.error || "Gagal mengirim data. Pastikan Anda sudah login di Studia pada browser yang sama.") + '</p>' +
            '<button onclick="this.parentElement.remove()" style="width:100%;padding:8px;border-radius:8px;border:none;background:#E5E7EB;cursor:pointer;">Tutup</button>';
        }
      })
      .catch(function(err){
        modal.innerHTML = '<h3 style="margin:0 0 8px;font-size:15px;font-weight:bold;color:#EF4444;">Salin Data Manual</h3>' +
          '<p style="margin:0 0 8px;font-size:11px;color:#4B5563;">Karena proteksi CORS antar-tab, silakan salin teks tabel iGracias ini lalu tempel langsung di menu Transkrip & Nilai Studia.</p>' +
          '<button id="btnCopyText" style="width:100%;background:#B6252A;color:#fff;padding:8px;border-radius:8px;border:none;font-weight:bold;cursor:pointer;">Salin Teks Tabel KHS</button>';
        document.getElementById("btnCopyText").onclick = function(){
          navigator.clipboard.writeText(extractedText);
          alert("Teks tabel KHS berhasil disalin! Sekarang buka tab Studia -> Transkrip & Nilai -> klik 'Sinkron iGracias' dan Paste (Ctrl+V).");
          modal.remove();
        };
      });
    };
  } catch(e) {
    alert("Error: " + e.message);
  }
})();
  `.trim().replace(/\n\s*/g, " ");

  return code;
}
