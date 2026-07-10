"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingDay, setUploadingDay] = useState<{ day: number; type: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ day: number; text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      const res = await fetch("/api/admin/data");
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
        setDays(data.days || []);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle uploading files and saving day configurations
  async function handleFileUploadAndSave(e: React.FormEvent<HTMLFormElement>, dayNum: number) {
    e.preventDefault();
    setStatusMessage(null);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const videoFile = formData.get("videoFile") as File;
    const docFile = formData.get("docFile") as File;
    const isLocked = formData.get("isLocked") === "on";

    let videoUrl = formData.get("existingVideoUrl") as string;
    let documentUrl = formData.get("existingDocUrl") as string;

    try {
      if (videoFile && videoFile.size > 0) {
        setUploadingDay({ day: dayNum, type: "video" });
        const vData = new FormData();
        vData.append("file", videoFile);
        vData.append("type", "video");
        vData.append("day", dayNum.toString());

        const vRes = await fetch("/api/admin/upload", { method: "POST", body: vData });
        const vJson = await vRes.json();
        if (vJson.success) videoUrl = vJson.url;
      }

      if (docFile && docFile.size > 0) {
        setUploadingDay({ day: dayNum, type: "document" });
        const dData = new FormData();
        dData.append("file", docFile);
        dData.append("type", "document");
        dData.append("day", dayNum.toString());

        const dRes = await fetch("/api/admin/upload", { method: "POST", body: dData });
        const dJson = await dRes.json();
        if (dJson.success) documentUrl = dJson.url;
      }

      const saveRes = await fetch("/api/admin/update-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: dayNum, videoUrl, documentUrl, isLocked }),
      });

      const saveData = await saveRes.json();
      if (saveData.success) {
        setStatusMessage({ day: dayNum, text: "Files and changes saved successfully!", type: "success" });
        setDays((prev) =>
          prev.map((d) => (d.day === dayNum ? { ...d, videoUrl, documentUrl, isLocked } : d))
        );
      } else {
        setStatusMessage({ day: dayNum, text: "Failed to persist day updates.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ day: dayNum, text: "Error uploading files.", type: "error" });
    } finally {
      setUploadingDay(null);
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
        
        {/* SECTION 1: MANAGE DAYS CONFIGURATION & FILE UPLOADS */}
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-white">Admin Panel: Upload Day Files & Masterclass Links</h1>
            <p className="text-slate-400 text-sm">Upload local documents and videos to immediately sync with the frontend portal and bot delivery systems.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {days.map((d) => (
              <form 
                key={d.day} 
                onSubmit={(e) => handleFileUploadAndSave(e, d.day)} 
                className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-lg"
              >
                <input type="hidden" name="existingVideoUrl" value={d.videoUrl || ""} />
                <input type="hidden" name="existingDocUrl" value={d.documentUrl || ""} />

                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Day {d.day}: {d.title}</h2>
                  {statusMessage && statusMessage.day === d.day && (
                    <span className={`text-xs px-2 py-0.5 rounded ${statusMessage.type === "success" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}>
                      {statusMessage.text}
                    </span>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Upload Video File</label>
                  <input 
                    type="file" 
                    name="videoFile" 
                    accept="video/*"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 file:bg-blue-600 file:border-0 file:rounded file:text-white file:px-2 file:py-1 file:cursor-pointer"
                  />
                  {d.videoUrl && <p className="text-[10px] text-blue-400 mt-1 truncate">Current: {d.videoUrl}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Upload PDF Document File</label>
                  <input 
                    type="file" 
                    name="docFile" 
                    accept=".pdf,.doc,.docx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 file:bg-blue-600 file:border-0 file:rounded file:text-white file:px-2 file:py-1 file:cursor-pointer"
                  />
                  {d.documentUrl && <p className="text-[10px] text-blue-400 mt-1 truncate">Current: {d.documentUrl}</p>}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" name="isLocked" defaultChecked={d.isLocked} id={`lock_${d.day}`} className="accent-blue-600" />
                  <label htmlFor={`lock_${d.day}`} className="text-xs font-medium text-slate-300">Lock this day on user portal</label>
                </div>

                <button 
                  type="submit" 
                  disabled={uploadingDay?.day === d.day} 
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  {uploadingDay?.day === d.day ? `Uploading ${uploadingDay?.type ?? "file"}...` : `Save Day ${d.day} Changes`}
                </button>
              </form>
            ))}
          </div>
        </div>

        {/* SECTION 2: FILLED FORM LEADS MANAGEMENT TABLE */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-white">Users Who Filled Out The Form (Leads)</h1>
            <span className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30">
              Total Submissions: {leads.length}
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
                  <th className="p-4 font-medium">Requested Day</th>
                  <th className="p-4 font-medium">Date Submitted</th>
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
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "Just now"}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No user submissions or leads captured yet.
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