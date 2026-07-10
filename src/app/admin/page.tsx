"use client";

import { useState, useEffect } from "react";
import { getVideoEmbedInfo, isLikelyLargeDriveFile } from "../../components/lib/urlParser";

interface DayForm {
  videoUrl: string;
  documentUrl: string;
  isLocked: boolean;
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [forms, setForms] = useState<Record<number, DayForm>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ day: number; text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      const res = await fetch("/api/admin/data", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
        setDays(data.days || []);
        const initialForms: Record<number, DayForm> = {};
        (data.days || []).forEach((d: any) => {
          initialForms[d.day] = {
            videoUrl: d.videoUrl || "",
            documentUrl: d.documentUrl || "",
            isLocked: !!d.isLocked,
          };
        });
        setForms(initialForms);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function updateForm(dayNum: number, field: keyof DayForm, value: string | boolean) {
    setForms((prev) => ({
      ...prev,
      [dayNum]: { ...prev[dayNum], [field]: value },
    }));
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>, dayNum: number) {
    e.preventDefault();
    setSavingDay(dayNum);
    setStatusMessage(null);

    const form = forms[dayNum];

    try {
      const res = await fetch("/api/admin/update-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: dayNum, ...form }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ day: dayNum, text: "Saved successfully!", type: "success" });
        setDays((prev) => prev.map((d) => (d.day === dayNum ? { ...d, ...form } : d)));
      } else {
        setStatusMessage({ day: dayNum, text: data.error || "Save failed. Try again.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ day: dayNum, text: "Network error occurred.", type: "error" });
    } finally {
      setSavingDay(null);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400 animate-pulse">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-12">
      <div className="max-w-6xl mx-auto space-y-10">

        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-white">Admin Panel: Manage Day Files & Links</h1>
            <p className="text-slate-400 text-sm">Enter direct public links for video portal display and automated Telegram document dispatch.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {days.map((d) => {
              const form = forms[d.day] || { videoUrl: "", documentUrl: "", isLocked: false };
              const videoInfo = getVideoEmbedInfo(form.videoUrl);
              const largeDriveWarning = isLikelyLargeDriveFile(form.documentUrl);

              return (
                <form
                  key={d.day}
                  onSubmit={(e) => handleSave(e, d.day)}
                  className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-lg"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white">Day {d.day}: {d.title}</h2>
                    {statusMessage && statusMessage.day === d.day && (
                      <span className={`text-xs px-2 py-0.5 rounded ${statusMessage.type === "success" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}>
                        {statusMessage.text}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Video URL (Portal)</label>
                    <input
                      type="text"
                      value={form.videoUrl}
                      onChange={(e) => updateForm(d.day, "videoUrl", e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    {/* Live preview — lets you confirm the link actually embeds
                        before saving, instead of finding out on the live site. */}
                    {form.videoUrl && (
                      <div className="mt-2 aspect-video w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative">
                        {videoInfo.type === "iframe" && (
                          <iframe src={videoInfo.src} className="absolute inset-0 w-full h-full" allowFullScreen />
                        )}
                        {videoInfo.type === "direct" && (
                          <video src={videoInfo.src} controls className="absolute inset-0 w-full h-full" />
                        )}
                        {videoInfo.type === "unsupported" && (
                          <p className="text-[11px] text-amber-400 p-3">
                            ⚠️ This link doesn't look embeddable. Use a YouTube, Vimeo, Loom, Google Drive, or direct .mp4 link.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">PDF Document URL (Bot Delivery)</label>
                    <input
                      type="text"
                      value={form.documentUrl}
                      onChange={(e) => updateForm(d.day, "documentUrl", e.target.value)}
                      placeholder="https://yourdomain.com/file.pdf"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    {largeDriveWarning && (
                      <p className="text-[11px] text-amber-400 mt-1">
                        ⚠️ Google Drive links can fail to send correctly for larger files (Telegram
                        may deliver a "can't scan for viruses" page instead of your PDF). For
                        reliable delivery, host the file directly (S3, Vercel Blob, Cloudinary) and
                        paste that link instead.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      checked={form.isLocked}
                      onChange={(e) => updateForm(d.day, "isLocked", e.target.checked)}
                      id={`lock_${d.day}`}
                      className="accent-blue-600"
                    />
                    <label htmlFor={`lock_${d.day}`} className="text-xs font-medium text-slate-300">Lock this day on user portal</label>
                  </div>

                  <button
                    type="submit"
                    disabled={savingDay === d.day}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {savingDay === d.day ? "Saving Changes..." : `Save Day ${d.day} Changes`}
                  </button>
                </form>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-white">Admin Leads Management</h1>
            <span className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30">
              Total Leads: {leads.length}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">WhatsApp</th>
                  <th className="p-4 font-medium">Telegram</th>
                  <th className="p-4 font-medium">Day</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {leads.map((lead) => (
                  <tr key={lead._id?.toString() || Math.random().toString()} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-medium text-white">{lead.name}</td>
                    <td className="p-4 text-slate-300">{lead.email}</td>
                    <td className="p-4 text-slate-300">{lead.phone}</td>
                    <td className="p-4 text-slate-300">{lead.whatsapp || "-"}</td>
                    <td className="p-4 text-slate-300">{lead.telegram || "-"}</td>
                    <td className="p-4 text-blue-400 font-semibold">Day {lead.dayViewed}</td>
                    <td className="p-4 text-slate-400 text-xs">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No leads captured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}