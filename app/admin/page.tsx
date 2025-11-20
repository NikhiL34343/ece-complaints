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
    return (
        // STYLED LOADING MESSAGE
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <p className="text-xl text-indigo-500 font-semibold animate-pulse">Loading complaints...</p>
        </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto"> 
        
        {/* Header & Logout Button */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-300">
            <h1 className="text-4xl font-extrabold text-indigo-600">
                Admin Dashboard 
            </h1>
            <button
                onClick={handleLogout}
                className="bg-red-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-red-700 transition duration-150 shadow-md"
            >
                Logout
            </button>
        </div>
        
        {/* Subtitle */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Unresolved Complaints ({complaints.length})
        </h2>

        {complaints.length === 0 ? (
          <p className="text-center text-xl text-gray-500 bg-white p-6 rounded-lg shadow">
             Great job! No unresolved complaints found.
          </p>
        ) : (
          <div className="grid gap-6">
            {complaints.map((c) => (
              // STYLED COMPLAINT CARD
              <div
                key={c.id}
                className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-indigo-500 flex flex-col sm:flex-row items-start gap-6"
              >
                {c.image_url && (
                  <a href={c.image_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                    <img
                      src={c.image_url}
                      alt="Complaint Evidence"
                      className="w-32 h-32 object-cover rounded-md shadow-md hover:opacity-90 transition duration-150 cursor-pointer"
                    />
                  </a>
                )}
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    <span className="font-semibold text-gray-700">From:</span> {c.email}
                  </p>
                  <p className="text-lg text-gray-800 leading-relaxed font-medium">
                    <strong className="text-indigo-600">Description:</strong> {c.description}
                  </p>
                  <p className="text-xs text-gray-400 pt-1">
                    Submitted: {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
                
                {/* Resolve Button */}
                <button
                  onClick={() => handleResolve(c.id)}
                  className="mt-4 sm:mt-0 bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-150 flex-shrink-0 shadow-md"
                >
                  Mark as Resolved
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Status message */}
        {statusMsg && (
          <p 
            className={`mt-8 text-center font-medium p-3 rounded-lg ${
              statusMsg.startsWith("❌") 
                ? "bg-red-100 text-red-700 border border-red-300" 
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {statusMsg}
          </p>
        )}
      </div>
    </div>
  );
}