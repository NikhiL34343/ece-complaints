'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@supabase/supabase-js";

// Supabase configuration remains the same
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Complaint {
    id: string;
    email: string;
    description: string;
    image_url: string | null;
    created_at: string;
}

export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [status, setStatus] = useState("");
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [showMine, setShowMine] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- Functional Logic (UNCHANGED) ---

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        if (user) fetchComplaints();
    }, [user, showMine]);

    const fetchComplaints = async () => {
        setLoading(true);
        let query = supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false }); // Changed to descending for newest first

        if (showMine) {
            query = query.eq('email', user.email);
        }

        const { data, error } = await query;
        if (error) console.error(error);
        else setComplaints(data || []);
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("Submitting...");

        try {
            let image_url = null;

            if (image) {
                // Ensure image is less than 5MB (example client-side check)
                if (image.size > 5 * 1024 * 1024) {
                    throw new Error("Image size must be less than 5MB.");
                }

                const { data, error } = await supabase.storage
                    .from("complaints-images")
                    .upload(`complaint_${Date.now()}_${image.name}`, image);

                if (error) throw error;

                image_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/complaints-images/${data.path}`;
            }

            const { error } = await supabase.from("complaints").insert([
                { email: user.email, description, image_url },
            ]);

            if (error) throw error;

            setStatus("✅ Complaint submitted successfully!");
            setDescription("");
            setImage(null);
            (document.getElementById('image-upload') as HTMLInputElement).value = ''; // Clear file input

            fetchComplaints();
        } catch (err: any) {
            console.error(err);
            setStatus(`❌ Failed to submit complaint: ${err.message || 'Unknown error'}`);
        }
    };

    if (!user) {
        return <div className="flex justify-center items-center h-screen text-lg text-slate-700">Loading user data...</div>;
    }

    // --- STYLING CHANGES APPLIED BELOW ---

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center py-4 px-6 bg-white shadow-md rounded-xl mb-8">
                <h1 className="text-3xl font-extrabold text-indigo-700">
                    Hello, {user.full_name.split(' ')[0]}!
                </h1>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V17a1 1 0 01-.485.876l-3 1.5A1 1 0 017 19.5v-6.086l-3.707-3.707A1 1 0 013 9V3z" clipRule="evenodd" />
                    </svg>
                    Logout
                </button>
            </header>

            {/* Main content: Responsive layout with Complaint Form panel on the right (desktop) or top (mobile) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Right/Top: Complaint Form Panel (Moved to the left in the grid for visual prominence) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl h-fit sticky top-8 border-t-4 border-indigo-500">
                    <h2 className="text-2xl font-bold mb-4 text-indigo-700">Register New Complaint</h2>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <textarea
                            placeholder="Briefly describe your complaint (e.g., 'Broken light near main gate')..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={4}
                            // --- FIX APPLIED HERE: Added text-slate-800 for dark text color ---
                            className="border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition resize-none text-slate-800"
                        />
                        <div className="p-3 bg-indigo-50 border-dashed border-2 border-indigo-200 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Attach Image (Optional)</label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition duration-200 shadow-md transform hover:scale-[1.01]"
                        >
                            Submit Complaint
                        </button>
                    </form>

                    <label className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showMine}
                            onChange={(e) => setShowMine(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="font-medium">Show only my complaints</span>
                    </label>

                    {status && (
                        <p className={`mt-3 text-sm font-medium p-2 rounded-lg ${
                            status.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {status}
                        </p>
                    )}
                </div>

                {/* Left/Bottom: Complaints List */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-extrabold mb-5 text-slate-800">
                        {showMine ? "My Submissions" : "Active Complaints"}
                    </h2>
                    
                    {loading ? (
                        <div className="p-6 bg-white rounded-xl shadow-lg flex items-center gap-4 text-lg text-slate-600">
                            <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading complaints...
                        </div>
                    ) : complaints.length === 0 ? (
                        <p className="p-6 bg-white rounded-xl shadow-lg text-lg text-slate-500 border-l-4 border-amber-500">
                            No complaints have been filed yet.
                        </p>
                    ) : (
                        <div className="grid gap-6">
                            {complaints.map((c) => (
                                <div key={c.id} className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 border-t-4 border-slate-300 flex flex-col md:flex-row gap-5">
                                    {c.image_url && (
                                        <div className="md:w-48 md:h-48 w-full h-auto flex-shrink-0">
                                            <img
                                                src={c.image_url}
                                                alt="Complaint evidence"
                                                className="w-full h-full object-cover rounded-lg shadow-md"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).onerror = null;
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/192x192?text=Image+Not+Found';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-lg font-semibold text-slate-700 mb-2">
                                            {c.description}
                                        </p>
                                        <p className="text-sm text-indigo-600 font-medium mb-1">
                                            <span className="text-gray-500 font-normal">Submitted by:</span> {c.email}
                                        </p>
                                        <p className="text-xs text-gray-500 italic mt-2 border-t pt-2">
                                            Submitted on: {new Date(c.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}