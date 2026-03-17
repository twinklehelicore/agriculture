import { useEffect, useState } from "react";
import {
  getAssignedRequests,
  approveRequest,
  startProgress,
  completeRequest,
  rejectRequest,
  addLog,
} from "../../api/provider";
interface Job {
  id: number;
  status: string;
  farmId: number;
  farmerId: number;
  preferredSlot?: string;
  details?: string;
  appliedAt: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const statusColor: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

// What action is available at each status
const nextAction: Record<string, { label: string; color: string }> = {
  ASSIGNED: {
    label: "Approve",
    color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
  },
  APPROVED: {
    label: "Start Work",
    color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
  },
  IN_PROGRESS: {
    label: "Mark Complete",
    color: "bg-green-50 text-green-700 hover:bg-green-100",
  },
};

export default function MyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [addingNote, setAddingNote] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchJobs = () => {
    setLoading(true);
    getAssignedRequests()
      .then((res) => setJobs(res.data))
      .catch(() => showToast("Failed to load jobs", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAction = async (job: Job) => {
    setActionLoading(job.id);
    try {
      if (job.status === "ASSIGNED") await approveRequest(job.id);
      else if (job.status === "APPROVED") await startProgress(job.id);
      else if (job.status === "IN_PROGRESS") await completeRequest(job.id);
      showToast("Job status updated!", "success");
      fetchJobs();
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    setRejectLoading(true);
    try {
      await rejectRequest(rejecting);
      setRejecting(null);
      showToast("Job rejected", "success");
      fetchJobs();
    } catch {
      showToast("Failed to reject job", "error");
    } finally {
      setRejectLoading(false);
    }
  };
  const handleAddNote = async () => {
    if (!addingNote || !note.trim()) return;
    setNoteLoading(true);
    try {
      await addLog(addingNote, note);
      setAddingNote(null);
      setNote("");
      showToast("Progress note added!", "success");
    } catch {
      showToast("Failed to add note", "error");
    } finally {
      setNoteLoading(false);
    }
  };

  const statuses = [
    "ALL",
    "ASSIGNED",
    "APPROVED",
    "IN_PROGRESS",
    "COMPLETED",
    "REJECTED",
  ];
  const filtered =
    filterStatus === "ALL"
      ? jobs
      : jobs.filter((j) => j.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-medium ${
            toast.type === "success" ? "bg-green-700" : "bg-red-600"
          }`}
        >
          <span className="text-lg">
            {toast.type === "success" ? "✅" : "❌"}
          </span>
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your assigned service requests
        </p>
      </div>

      {/* Filter */}
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
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Reject Confirm Modal */}
      {rejecting !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Reject Job</h2>
              <button
                onClick={() => setRejecting(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">
                Are you sure you want to reject{" "}
                <span className="font-semibold">Job #{rejecting}</span>? This
                cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRejecting(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
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

      {/* Add Note Modal */}
      {addingNote !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Add Progress Note
              </h2>
              <button
                onClick={() => {
                  setAddingNote(null);
                  setNote("");
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                Adding note for{" "}
                <span className="font-semibold">Job #{addingNote}</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Progress Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Reached farm, Started spraying, Equipment setup done..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setAddingNote(null);
                  setNote("");
                }}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={noteLoading || !note.trim()}
                className="flex-1 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50"
              >
                {noteLoading ? "Adding..." : "Add Note"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading jobs...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "#",
                    "Farmer ID",
                    "Farm ID",
                    "Slot",
                    "Details",
                    "Status",
                    "Applied",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">{job.id}</td>
                      <td className="px-4 py-3 text-gray-700">
                        #{job.farmerId}
                      </td>
                      <td className="px-4 py-3 text-gray-700">#{job.farmId}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {job.preferredSlot ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">
                        {job.details ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[job.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {job.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(job.appliedAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {nextAction[job.status] && (
                            <button
                              onClick={() => handleAction(job)}
                              disabled={actionLoading === job.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-50 ${nextAction[job.status].color}`}
                            >
                              {actionLoading === job.id
                                ? "..."
                                : nextAction[job.status].label}
                            </button>
                          )}
                          {job.status === "ASSIGNED" && (
                            <button
                              onClick={() => setRejecting(job.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 font-medium whitespace-nowrap"
                            >
                              Reject
                            </button>
                          )}
                          {["ASSIGNED", "APPROVED", "IN_PROGRESS"].includes(
                            job.status,
                          ) && (
                            <button
                              onClick={() => {
                                setAddingNote(job.id);
                                setNote("");
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 font-medium whitespace-nowrap"
                            >
                              📝 Note
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
