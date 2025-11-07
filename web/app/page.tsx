'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // No user? redirect to login
            router.push('/login');
        }
    }, [router]);

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
                const { data, error } = await supabase.storage
                    .from("complaints-images")
                    .upload(`complaint_${Date.now()}.jpg`, image);

                if (error) throw error;
                image_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/complaints-images/${data.path}`;
            }

            const { error } = await supabase.from("complaints").insert([
                { email, description, image_url },
            ]);

            if (error) throw error;

            setStatus("✅ Complaint submitted successfully!");
            setEmail("");
            setDescription("");
            setImage(null);
        } catch (err: any) {
            console.error(err);
            setStatus("❌ Failed to submit complaint.");
        }
    };

    if (!user) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Welcome, {user.full_name}</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>

            {/* 👇 Keep your complaint submission form and other existing stuff below */}
            <div>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
                    <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
                        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
                            >
                                {/* <input
                                    type="email"
                                    placeholder="Your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full mb-3 p-2 border rounded"
                                /> */}
                                <textarea
                                    placeholder="Describe your complaint..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    className="w-full mb-3 p-2 border rounded"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                                    className="mb-3"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Submit Complaint
                                </button>
                            </form>

                            {status && <p className="mt-4 text-gray-700">{status}</p>}
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
}
