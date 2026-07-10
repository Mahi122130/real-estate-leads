import clientPromise from "@/components/lib/mongodb";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const client = await clientPromise;
  const db = client.db("luxury_leads");
  
  // Fetch leads
  const leads = await db
    .collection("leads")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  // Fetch days configuration
  let days = await db.collection("days").find({}).sort({ day: 1 }).toArray();

  if (days.length === 0) {
    const initialDays = Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1} Masterclass`,
      videoUrl: "",
      documentUrl: "",
      isLocked: i !== 0,
    }));
    await db.collection("days").insertMany(initialDays);
    days = await db.collection("days").find({}).sort({ day: 1 }).toArray();
  }

  // Server Action to update day content
  async function handleDayUpdate(formData: FormData) {
    "use server";
    const dayNum = parseInt(formData.get("day") as string, 10);
    const videoUrl = formData.get("videoUrl") as string;
    const documentUrl = formData.get("documentUrl") as string;
    const isLocked = formData.get("isLocked") === "on";

    const client = await clientPromise;
    const db = client.db("luxury_leads");

    await db.collection("days").updateOne(
      { day: dayNum },
      { $set: { videoUrl, documentUrl, isLocked } },
      { upsert: true }
    );

    revalidatePath("/admin");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* SECTION 1: MANAGE DAYS CONFIGURATION */}
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-white">Admin Panel: Manage Day Files & Links</h1>
            <p className="text-slate-400 text-sm">Active Schedule Reference Date: July 10, 2026</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {days.map((d) => (
              <form key={d.day} action={handleDayUpdate} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-lg">
                <input type="hidden" name="day" value={d.day} />
                <h2 className="text-lg font-semibold text-white">Day {d.day}: {d.title}</h2>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Video URL (Portal)</label>
                  <input 
                    type="text" 
                    name="videoUrl" 
                    defaultValue={d.videoUrl || ""} 
                    placeholder="https://youtube.com/..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">PDF Document URL (Bot Delivery)</label>
                  <input 
                    type="text" 
                    name="documentUrl" 
                    defaultValue={d.documentUrl || ""} 
                    placeholder="https://yourdomain.com/file.pdf" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" name="isLocked" defaultChecked={d.isLocked} id={`lock_${d.day}`} className="accent-blue-600" />
                  <label htmlFor={`lock_${d.day}`} className="text-xs font-medium text-slate-300">Lock this day on user portal</label>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                  Save Day {d.day} Changes
                </button>
              </form>
            ))}
          </div>
        </div>

        {/* SECTION 2: LEADS MANAGEMENT TABLE */}
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
                  <tr key={lead._id.toString()} className="hover:bg-slate-850 transition-colors">
                    <td className="p-4 font-medium text-white">{lead.name}</td>
                    <td className="p-4 text-slate-300">{lead.email}</td>
                    <td className="p-4 text-slate-300">{lead.phone}</td>
                    <td className="p-4 text-slate-300">{lead.whatsapp || "-"}</td>
                    <td className="p-4 text-slate-300">{lead.telegram || "-"}</td>
                    <td className="p-4 text-blue-400 font-semibold">Day {lead.dayViewed}</td>
                    <td className="p-4 text-slate-400 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString()}
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