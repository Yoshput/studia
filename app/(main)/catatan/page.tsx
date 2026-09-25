"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Star,
  Search,
  BookOpen,
  Eye,
  Edit3,
  Columns,
  Loader2,
  Calendar,
  Tag,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Matkul } from "@/types";

interface Catatan {
  id: string;
  user_id: string;
  matkul_id: string | null;
  matkul?: {
    id: string;
    nama: string;
    kode: string | null;
    warna: string | null;
  } | null;
  judul: string;
  konten: string;
  tags: string | null;
  is_favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CatatanPage() {
  const [notes, setNotes] = useState<Catatan[]>([]);
  const [activeNote, setActiveNote] = useState<Catatan | null>(null);
  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor states
  const [judul, setJudul] = useState("");
  const [konten, setKonten] = useState("");
  const [selectedMatkulId, setSelectedMatkulId] = useState<string>("");
  const [tags, setTags] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");

  // Interaction states
  const [isPolishing, setIsPolishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMatkul, setFilterMatkul] = useState("");

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const [notesRes, matkulRes] = await Promise.all([
        fetch("/api/catatan"),
        fetch("/api/matkul"),
      ]);

      const notesData = await notesRes.json();
      const matkulData = await matkulRes.json();

      if (matkulData.matkul) setMatkulList(matkulData.matkul);

      if (notesData.catatan && notesData.catatan.length > 0) {
        setNotes(notesData.catatan);
        // Select first note by default if none active
        if (!activeNote) {
          selectNote(notesData.catatan[0]);
        }
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error("Gagal memuat catatan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const selectNote = (note: Catatan) => {
    setActiveNote(note);
    setJudul(note.judul);
    setKonten(note.konten || "");
    setSelectedMatkulId(note.matkul_id || "");
    setTags(note.tags || "");
    setIsFavorite(note.is_favorite);
  };

  const handleCreateNew = async () => {
    try {
      const defaultMatkul = matkulList[0]?.id || null;
      const res = await fetch("/api/catatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: "Catatan Kuliah Baru",
          konten: "# Catatan Kuliah\n\nTulis poin-poin materi kuliah atau ringkasan materi di sini...",
          matkul_id: defaultMatkul,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.catatan) {
          setNotes([data.catatan, ...notes]);
          selectNote(data.catatan);
        }
      }
    } catch (err) {
      console.error("Gagal membuat catatan baru:", err);
    }
  };

  const handleSave = async () => {
    if (!activeNote) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/catatan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeNote.id,
          judul: judul.trim() || "Tanpa Judul",
          konten,
          matkul_id: selectedMatkulId || null,
          tags: tags.trim() || null,
          is_favorite: isFavorite,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.catatan) {
          setNotes((prev) =>
            prev.map((n) => (n.id === data.catatan.id ? data.catatan : n))
          );
          setActiveNote(data.catatan);
        }
      }
    } catch (err) {
      console.error("Gagal menyimpan catatan:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/catatan?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const remaining = notes.filter((n) => n.id !== id);
        setNotes(remaining);
        if (activeNote?.id === id) {
          if (remaining.length > 0) {
            selectNote(remaining[0]);
          } else {
            setActiveNote(null);
            setJudul("");
            setKonten("");
          }
        }
      }
    } catch (err) {
      console.error("Gagal menghapus catatan:", err);
    }
  };

  const handlePolishWithAI = async () => {
    if (!konten.trim()) return;
    try {
      setIsPolishing(true);
      const matkulObj = matkulList.find((m) => m.id === selectedMatkulId);
      const res = await fetch("/api/catatan/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: konten,
          judul: judul || "Catatan Kuliah",
          matkulNama: matkulObj?.nama || "Mata Kuliah",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.polishedMarkdown) {
          setKonten(data.polishedMarkdown);
          setViewMode("split");
        }
      }
    } catch (err) {
      console.error("Gagal merapikan catatan:", err);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(konten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const filename = `${(judul || "catatan").replace(/[^a-zA-Z0-9_-]/g, "_")}.md`;
    const blob = new Blob([konten], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      !searchQuery ||
      n.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.konten.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMatkul = !filterMatkul || n.matkul_id === filterMatkul;
    return matchesSearch && matchesMatkul;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-ios-accent/10 text-ios-accent mb-1 border border-ios-accent/20">
            <FileText className="w-3 h-3" />
            <span>Smart Notes &amp; Markdown Workspace</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ios-textPrimary">
            Catatan Kuliah
          </h1>
          <p className="text-[13px] text-ios-textSecondary">
            Tulis catatan kuliah bebas, rapikan otomatis dengan AI, dan ekspor ke format Markdown (.md).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateNew}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Catatan Baru</span>
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[680px]">
        {/* Left Column: Note List & Filters (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ios-textSecondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari catatan..."
                className="w-full pl-8 pr-3 py-2 text-[12px] bg-ios-surfaceSecondary border border-ios-border rounded-xl focus:outline-none focus:ring-1 focus:ring-ios-accent"
              />
            </div>
            {matkulList.length > 0 && (
              <select
                value={filterMatkul}
                onChange={(e) => setFilterMatkul(e.target.value)}
                className="text-[11.5px] bg-ios-surfaceSecondary border border-ios-border rounded-xl px-2 py-2 max-w-[120px] focus:outline-none text-ios-textPrimary font-medium truncate"
              >
                <option value="">Semua Matkul</option>
                {matkulList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.kode || m.nama}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Notes Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 max-h-[640px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-ios-textSecondary text-[13px] gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-ios-accent" />
                <span>Memuat catatan...</span>
              </div>
            ) : filteredNotes.length === 0 ? (
              <Card className="p-6 text-center border-dashed">
                <FileText className="w-8 h-8 text-ios-textSecondary/50 mx-auto mb-2" />
                <p className="text-[13px] font-semibold text-ios-textPrimary">
                  Belum ada catatan
                </p>
                <p className="text-[11.5px] text-ios-textSecondary mt-0.5">
                  Klik tombol Catatan Baru untuk mulai menulis materi kuliah.
                </p>
              </Card>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = activeNote?.id === note.id;
                return (
                  <button
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-2xl border transition-all select-none relative group",
                      isSelected
                        ? "bg-ios-accent/10 border-ios-accent/40 shadow-xs"
                        : "bg-ios-surface hover:bg-ios-surfaceSecondary/80 border-ios-border"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-ios-surfaceSecondary border border-ios-border text-ios-textSecondary truncate max-w-[160px]">
                        {note.matkul?.nama || "Umum"}
                      </span>
                      {note.is_favorite && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                    </div>

                    <h4
                      className={cn(
                        "text-[13.5px] font-bold line-clamp-1 leading-snug",
                        isSelected ? "text-ios-accent" : "text-ios-textPrimary"
                      )}
                    >
                      {note.judul}
                    </h4>

                    <p className="text-[11.5px] text-ios-textSecondary line-clamp-2 mt-1 leading-normal">
                      {note.konten ? note.konten.replace(/#|\*|`/g, "") : "Catatan kosong..."}
                    </p>

                    <div className="mt-2 pt-2 border-t border-ios-border/60 flex items-center justify-between text-[10px] text-ios-textSecondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(note.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {note.tags && (
                        <span className="truncate max-w-[120px] font-mono">
                          #{note.tags}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Note Editor & AI Assistant (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col">
          {activeNote ? (
            <Card className="flex-1 flex flex-col p-4 sm:p-5 border-ios-border shadow-sm">
              {/* Note Header & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-ios-border">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder="Judul Catatan..."
                    className="w-full text-lg sm:text-xl font-bold bg-transparent text-ios-textPrimary focus:outline-none placeholder:text-ios-textSecondary/50"
                  />
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Course selector */}
                    <div className="inline-flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-ios-accent" />
                      <select
                        value={selectedMatkulId}
                        onChange={(e) => setSelectedMatkulId(e.target.value)}
                        className="text-[11.5px] font-semibold bg-ios-surfaceSecondary border border-ios-border rounded-lg px-2 py-1 focus:outline-none text-ios-textPrimary"
                      >
                        <option value="">Pilih Mata Kuliah</option>
                        {matkulList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.kode ? `[${m.kode}] ` : ""}{m.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tag input */}
                    <div className="inline-flex items-center gap-1">
                      <Tag className="w-3 h-3 text-ios-textSecondary" />
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Tags (mis: uts, bab1)..."
                        className="text-[11px] bg-ios-surfaceSecondary border border-ios-border rounded-lg px-2 py-1 w-32 focus:outline-none"
                      />
                    </div>

                    {/* Favorite toggle */}
                    <button
                      type="button"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={cn(
                        "p-1.5 rounded-lg border transition-colors",
                        isFavorite
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                          : "bg-ios-surfaceSecondary border-ios-border text-ios-textSecondary hover:text-ios-textPrimary"
                      )}
                      title="Tandai Favorit"
                    >
                      <Star className={cn("w-3.5 h-3.5", isFavorite && "fill-amber-500")} />
                    </button>
                  </div>
                </div>

                {/* Editor Action Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
                  {/* View Mode Toggle */}
                  <div className="flex items-center p-0.5 bg-ios-surfaceSecondary rounded-xl border border-ios-border text-[11px]">
                    <button
                      onClick={() => setViewMode("edit")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1",
                        viewMode === "edit"
                          ? "bg-ios-surface text-ios-accent shadow-xs"
                          : "text-ios-textSecondary hover:text-ios-textPrimary"
                      )}
                      title="Mode Edit"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setViewMode("split")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-medium transition-colors hidden md:flex items-center gap-1",
                        viewMode === "split"
                          ? "bg-ios-surface text-ios-accent shadow-xs"
                          : "text-ios-textSecondary hover:text-ios-textPrimary"
                      )}
                      title="Split View"
                    >
                      <Columns className="w-3 h-3" />
                      <span>Split</span>
                    </button>
                    <button
                      onClick={() => setViewMode("preview")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1",
                        viewMode === "preview"
                          ? "bg-ios-surface text-ios-accent shadow-xs"
                          : "text-ios-textSecondary hover:text-ios-textPrimary"
                      )}
                      title="Mode Pratinjau"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Baca</span>
                    </button>
                  </div>

                  {/* AI Polish Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isPolishing || !konten.trim()}
                    onClick={handlePolishWithAI}
                    className="gap-1.5 text-ios-accent border-ios-accent/30 bg-ios-accent/10 hover:bg-ios-accent/20"
                    title="Rapikan struktur catatan menjadi format Markdown rapi via AI"
                  >
                    {isPolishing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-ios-accent" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-ios-accent" />
                    )}
                    <span>Rapikan via AI</span>
                  </Button>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyMarkdown}
                    className="p-2 rounded-xl border border-ios-border bg-ios-surfaceSecondary hover:bg-ios-surface text-ios-textSecondary hover:text-ios-textPrimary transition-colors"
                    title="Salin isi Markdown"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Export .md */}
                  <button
                    onClick={handleDownloadMarkdown}
                    className="p-2 rounded-xl border border-ios-border bg-ios-surfaceSecondary hover:bg-ios-surface text-ios-textSecondary hover:text-ios-textPrimary transition-colors"
                    title="Download format .md"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(activeNote.id)}
                    className="p-2 rounded-xl border border-ios-border bg-ios-surfaceSecondary hover:bg-red-500/10 text-ios-textSecondary hover:text-red-500 transition-colors"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[460px]">
                {/* Editor textarea */}
                {(viewMode === "edit" || viewMode === "split") && (
                  <div
                    className={cn(
                      "flex flex-col",
                      viewMode === "edit" ? "col-span-full" : "col-span-1"
                    )}
                  >
                    <textarea
                      value={konten}
                      onChange={(e) => setKonten(e.target.value)}
                      placeholder="Tulis materi kuliah di sini dalam teks bebas atau Markdown..."
                      className="w-full flex-1 p-3.5 text-[13px] font-mono leading-relaxed bg-ios-surfaceSecondary/50 border border-ios-border/80 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ios-accent resize-none min-h-[420px]"
                    />
                  </div>
                )}

                {/* Rendered Preview area */}
                {(viewMode === "preview" || viewMode === "split") && (
                  <div
                    className={cn(
                      "flex flex-col p-4 bg-ios-surfaceSecondary/30 border border-ios-border/70 rounded-2xl overflow-y-auto max-h-[520px] select-text prose prose-sm dark:prose-invert max-w-none",
                      viewMode === "preview" ? "col-span-full" : "col-span-1"
                    )}
                  >
                    {konten ? (
                      <div className="text-[13px] leading-relaxed text-ios-textPrimary whitespace-pre-wrap font-sans">
                        {konten}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-ios-textSecondary/60 text-[12px]">
                        <span>Pratinjau kosong</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Save Status */}
              <div className="pt-3 mt-3 border-t border-ios-border flex items-center justify-between">
                <span className="text-[11px] text-ios-textSecondary">
                  {isSaving ? "Menyimpan perubahan..." : "Semua draf tersimpan di cloud"}
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="gap-1.5 text-[12px] py-1.5"
                >
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Simpan Catatan</span>
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="flex-1 flex flex-col items-center justify-center p-8 text-center border-dashed">
              <FileText className="w-12 h-12 text-ios-textSecondary/30 mb-3" />
              <h3 className="text-base font-bold text-ios-textPrimary">
                Pilih atau Buat Catatan
              </h3>
              <p className="text-[12.5px] text-ios-textSecondary mt-1 max-w-sm">
                Pilih catatan di bilah kiri atau buat catatan baru untuk mencatat materi kuliah dan merapikannya menjadi Markdown via AI.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateNew}
                className="mt-4 gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Catatan Sekarang</span>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
