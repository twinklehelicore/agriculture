import { useEffect, useState } from "react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getCategories,
} from "../../api/admin";

interface Service {
  id: number;
  name: string;
  price?: number;
  unit?: string;
  description?: string;
  image?: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const emptyForm = {
  name: "",
  price: "",
  unit: "",
  description: "",
  image: "",
  categoryId: "",
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Service | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchServices = async () => {
    try {
      const res = await getServices();
      setServices(res.data);
    } catch {
      console.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    getCategories().then((res) => setCategories(res.data));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name,
      price: s.price?.toString() || "",
      unit: s.unit || "",
      description: s.description || "",
      image: s.image || "",
      categoryId: (s as any).categoryId?.toString() || "",
    });
    setError("");
    setShowForm(true);
  };

  // Convert image file to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((p) => ({ ...p, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError("");
    setFormLoading(true);
    try {
      const payload = {
        name: form.name,
        price: form.price ? Number(form.price) : undefined,
        unit: form.unit || undefined,
        description: form.description || undefined,
        image: form.image || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      };
      if (editing) await updateService(editing.id, payload);
      else await createService(payload);
      setShowForm(false);
      fetchServices();
      showToast(editing ? "Service updated!" : "Service created!", "success");
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to save service");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await deleteService(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchServices();
      showToast("Service deleted", "success");
    } catch {
      showToast("Failed to delete service", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── TOAST ── */}
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
            className="ml-2 opacity-70 hover:opacity-100 text-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Services</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage agricultural services
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors"
        >
          + Add Service
        </button>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editing ? "Edit Service" : "Add Service"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Image
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-green-400 transition-colors">
                {form.image ? (
                  <div className="space-y-2">
                    <img
                      src={form.image}
                      alt="preview"
                      className="w-full h-36 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setForm((p) => ({ ...p, image: "" }))}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="text-3xl mb-2">🖼️</div>
                    <p className="text-sm text-gray-500">
                      Click to upload image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Text Fields */}
            {[
              {
                key: "name",
                label: "Service Name *",
                placeholder: "e.g. Soil Testing",
                type: "text",
              },
              {
                key: "price",
                label: "Price (₹)",
                placeholder: "500",
                type: "number",
              },
              {
                key: "unit",
                label: "Unit",
                placeholder: "e.g. per acre",
                type: "text",
              },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Service description..."
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, categoryId: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">— No Category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={formLoading || !form.name}
                className="flex-1 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50"
              >
                {formLoading ? "Saving..." : editing ? "Update" : "Add Service"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Delete Service
              </h2>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{deleteConfirm.name}"</span>?
                This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SERVICE CARDS ── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          Loading services...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-400">
              No services yet. Add one!
            </div>
          ) : (
            services.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Image or placeholder */}
                {s.image ? (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-green-50 flex items-center justify-center text-5xl">
                    🛠️
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800">{s.name}</h3>
                    <div className="flex gap-2 flex-shrink-0 ml-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(s)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {s.description && (
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {s.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {s.price && (
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                        ₹{s.price}
                      </span>
                    )}
                    {s.unit && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {s.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
