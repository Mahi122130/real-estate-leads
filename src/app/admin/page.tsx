import clientPromise from "../../components/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const client = await clientPromise;
  const db = client.db("luxury_leads");
  
  const leads = await db
    .collection("leads")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
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
  );
}