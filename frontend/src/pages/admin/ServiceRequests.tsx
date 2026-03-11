import { useEffect, useState } from "react";
import {
  getAllRequests,
  assignProvider,
  getProviders,
  rejectRequest,
} from "../../api/admin";

interface Request {
  id: number;
  farmerId: number;
  providerId?: number;
  farmId: number;
  serviceTypeId: number;
  status: string;
  details?: string;
  preferredSlot?: string;
  appliedAt: string;
}

interface Provider {
  id: number;
  name?: string;
  mobile?: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function ServiceRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [assigning, setAssigning] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const [reqRes, provRes] = await Promise.all([
        getAllRequests(),
        getProviders(),
      ]);
      setRequests(reqRes.data);
      setProviders(provRes.data);
    } catch {
      console.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAssign = async (requestId: number) => {
    if (!selectedProvider) return;
    setAssignLoading(true);
    try {
      await assignProvider(requestId, Number(selectedProvider));
      setAssigning(null);
      setSelectedProvider("");
      fetchAll();
      showToast("Provider assigned successfully!", "success");
    } catch {
      showToast("Failed to assign provider", "error");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    setRejectLoading(true);
    try {
      await rejectRequest(rejecting);
      setRejecting(null);
      fetchAll();
      showToast("Request rejected successfully", "success");
    } catch {
      showToast("Failed to reject request", "error");
    } finally {
      setRejectLoading(false);
    }
  };

  const statuses = [
    "ALL", "PENDING", "ASSIGNED", "APPROVED",
    "IN_PROGRESS", "COMPLETED", "REJECTED",
  ];

  const filtered =
    filterStatus === "ALL"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  return (
    <div className="space-y-6">

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-medium transition-all ${
          toast.type === "success" ? "bg-green-700" : "bg-red-600"
        }`}>
          <span className="text-lg">{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">✕</button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Service Requests</h1>
        <p className="text-gray-500 text-sm mt-1">
          View and assign providers to requests
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              filterStatus === s
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── ASSIGN MODAL ── */}
      {assigning !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Assign Provider</h2>
              <button onClick={() => setAssigning(null)}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700">
                Assigning provider to <span className="font-semibold">Request #{assigning}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">— Choose provider —</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || "Unnamed"} {p.mobile ? `(${p.mobile})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setAssigning(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => handleAssign(assigning)}
                disabled={!selectedProvider || assignLoading}
                className="flex-1 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50"
              >
                {assignLoading ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {rejecting !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Reject Request</h2>
              <button onClick={() => setRejecting(null)}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">
                Are you sure you want to reject{" "}
                <span className="font-semibold">Request #{rejecting}</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setRejecting(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectLoading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {rejectLoading ? "Rejecting..." : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading requests...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["#", "Farmer ID", "Farm ID", "Slot", "Status", "Applied", "Actions"].map((h) => (
                    <th key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{r.id}</td>
                      <td className="px-4 py-3 text-gray-700">#{r.farmerId}</td>
                      <td className="px-4 py-3 text-gray-700">#{r.farmId}</td>
                      <td className="px-4 py-3 text-gray-600">{r.preferredSlot || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[r.status] || "bg-gray-100 text-gray-600"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(r.appliedAt).toLocaleDateString("en-IN")}
                      </td>

                      {/* ── ACTION BUTTONS ── */}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {r.status === "PENDING" && (
                            <button
                              onClick={() => { setAssigning(r.id); setSelectedProvider(""); }}
                              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs hover:bg-green-100 font-medium whitespace-nowrap">
                              Assign
                            </button>
                          )}
                          {(r.status === "PENDING" || r.status === "ASSIGNED") && (
                            <button
                              onClick={() => setRejecting(r.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 font-medium whitespace-nowrap">
                              Reject
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}