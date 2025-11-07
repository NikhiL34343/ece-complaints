"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Complaint {
  id: string;
  email: string;
  description: string;
  image_url: string | null;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const router = useRouter();

  // ✅ Step 1: Check admin access
  const checkAdminAccess = async () => {
    const storedUser = localStorage.getItem("user");
    const adminId = process.env.NEXT_PUBLIC_ADMIN_ID!;

    if (!storedUser) {
      router.push("/login");
      return false;
    }

    const user = JSON.parse(storedUser);
    if (user.id !== adminId) {
      router.push("/login");
      return false;
    }

    return true;
  };

  // 🔹 Fetch complaints (sorted oldest first)
  const fetchComplaints = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error(error);
    else setComplaints(data || []);
    setLoading(false);
  };
  const handleLogout = () => {
      localStorage.removeItem('user');
      router.push('/login');
  };
  // 🔹 Delete complaint (mark as resolved)
  const handleResolve = async (id: string) => {
    const { error } = await supabase.from("complaints").delete().eq("id", id);
    if (error) {
      console.error(error);
      setStatusMsg("❌ Failed to mark as resolved.");
    } else {
      setStatusMsg("✅ Complaint marked as resolved!");
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    }
  };

  useEffect(() => {
    (async () => {
      const allowed = await checkAdminAccess();
      if (allowed) fetchComplaints();
    })();
  }, []);

  if (loading)
    return <p className="text-center text-gray-600 p-6">Loading complaints...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
          <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
              Logout
          </button>
      </div>
      <h1 className="text-3xl font-bold mb-6 text-center">
        Admin Dashboard — Complaints
      </h1>

      {complaints.length === 0 ? (
        <p className="text-center text-gray-600">No complaints found.</p>
      ) : (
        <div className="grid gap-6">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row items-start gap-4"
            >
              {c.image_url && (
                <img
                  src={c.image_url}
                  alt="Complaint"
                  className="w-40 h-40 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p>
                  <strong>Email:</strong> {c.email}
                </p>
                <p>
                  <strong>Description:</strong> {c.description}
                </p>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(c.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleResolve(c.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Mark as Resolved
              </button>
            </div>
          ))}
        </div>
      )}

      {statusMsg && <p className="mt-6 text-center">{statusMsg}</p>}
    </div>
  );
}
