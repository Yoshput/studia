export interface User {
  id: string;
  nama: string;
  email: string;
}

export interface Semester {
  id: string;
  nama_semester: string;
  tahun_ajaran: string;
  ipk: number | null;
  is_active: boolean;
  matkul?: Matkul[];
}

export interface NilaiBobot {
  id: string;
  matkul_id: string;
  kategori: string;
  bobot_persen: number;
}

export interface Nilai {
  id: string;
  matkul_id: string;
  kategori: string;
  nama_item: string;
  nilai: number;
  tanggal: string | Date;
  matkul?: {
    id: string;
    nama: string;
    kode?: string | null;
    warna?: string | null;
    bobot_nilai?: NilaiBobot[];
  };
}

export interface ProgressHarian {
  id: string;
  matkul_id: string;
  tanggal: string | Date;
  materi_dipelajari: string;
  catatan?: string | null;
  tingkat_pemahaman: number;
  lampiran_url?: string | null;
  matkul?: {
    id: string;
    nama: string;
    kode?: string | null;
    warna?: string | null;
  };
}

export interface TugasDeadline {
  id: string;
  matkul_id: string;
  judul: string;
  deskripsi?: string | null;
  deadline: string | Date;
  status: "belum" | "proses" | "selesai";
  prioritas: "rendah" | "sedang" | "tinggi";
  matkul?: {
    id: string;
    nama: string;
    kode?: string | null;
    warna?: string | null;
  };
}

export interface Matkul {
  id: string;
  semester_id: string;
  nama: string;
  kode?: string | null;
  dosen: string;
  sks: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  ruang: string;
  warna?: string | null;
  bobot_nilai?: NilaiBobot[];
  nilai?: Nilai[];
  progress?: ProgressHarian[];
  tugas?: TugasDeadline[];
}
