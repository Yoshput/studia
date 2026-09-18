/**
 * Utilitas ekspor data resmi mahasiswa Semestr (Standar Telkom University)
 */

export function exportKhsToCsv(
  semesterName: string,
  khsItems: {
    kode_matkul: string;
    nama_matkul: string;
    sks: number;
    nilai_huruf: string;
    nilai_indeks: number;
  }[],
  studentInfo?: { nama: string; nim?: string }
) {
  const headers = ["Kode Matkul", "Nama Mata Kuliah", "SKS", "Nilai Huruf", "Bobot Indeks", "Total Poin"];
  const rows = khsItems.map((item) => [
    `"${item.kode_matkul}"`,
    `"${item.nama_matkul}"`,
    item.sks,
    `"${item.nilai_huruf}"`,
    item.nilai_indeks,
    (item.sks * item.nilai_indeks).toFixed(1),
  ]);

  const totalSks = khsItems.reduce((acc, it) => acc + it.sks, 0);
  const totalPoin = khsItems.reduce((acc, it) => acc + it.sks * it.nilai_indeks, 0);
  const ipk = totalSks > 0 ? (totalPoin / totalSks).toFixed(2) : "0.00";

  const summary = [
    [],
    ["Mahasiswa", `"${studentInfo?.nama || "-"}"`],
    ["NIM", `"${studentInfo?.nim || "-"}"`],
    ["Semester", `"${semesterName}"`],
    ["Total SKS", totalSks],
    ["Indeks Prestasi (IP)", ipk],
    ["Institusi", "Telkom University Purwokerto"],
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((r) => r.join(",")), ...summary.map((s) => s.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `KHS_${semesterName.replace(/\s+/g, "_")}_${studentInfo?.nim || "Mahasiswa"}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportJadwalToCsv(
  matkulList: {
    nama: string;
    kode?: string | null;
    dosen: string;
    sks: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruang: string;
  }[],
  semesterName: string = "Semester 5"
) {
  const headers = ["Hari", "Jam Mulai", "Jam Selesai", "Mata Kuliah", "Kode", "SKS", "Dosen Pengampu", "Ruangan"];
  const rows = matkulList.map((m) => [
    `"${m.hari}"`,
    `"${m.jam_mulai}"`,
    `"${m.jam_selesai}"`,
    `"${m.nama}"`,
    `"${m.kode || "-"}"`,
    m.sks,
    `"${m.dosen}"`,
    `"${m.ruang}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Jadwal_Kuliah_${semesterName.replace(/\s+/g, "_")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
