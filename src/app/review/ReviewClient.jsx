"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "reviews_v1";

function Stars({ value }) {
  return (
    <div className="flex items-center text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < value ? "" : "opacity-30"}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.42 8.281L12 19.771 4.58 23.876 6 15.595 0 9.748l8.332-1.73z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewClient() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setReviews(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.error(e);
    }
  }, [reviews]);

  const addReview = (e) => {
    e.preventDefault();
    const r = { id: Date.now(), name: name || "Anonymous", text, rating, createdAt: new Date().toISOString() };
    setReviews([r, ...reviews]);
    setName("");
    setText("");
    setRating(5);
  };

  const clearAll = () => {
    setReviews([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-[70vh] p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#070707] rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Reviews</h1>
          <button onClick={clearAll} className="text-xs text-red-600 hover:underline">Clear all</button>
        </div>

        <form onSubmit={addReview} className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-900" />
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-900">
              {[5,4,3,2,1].map((v)=> <option key={v} value={v}>{v} ★</option>)}
            </select>
          </div>
          <textarea placeholder="Write a short review..." value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-900" rows={3} />
          <div className="flex items-center gap-3">
            <button className="rounded bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 transition-transform transform hover:-translate-y-0.5">Add review</button>
            <div className="text-sm text-zinc-500">Your review will be stored locally in your browser.</div>
          </div>
        </form>

        <div className="mt-6 space-y-4">
          {reviews.length === 0 && <div className="text-sm text-zinc-500">No reviews yet — be the first to add one!</div>}
          {reviews.map(r => (
            <article key={r.id} className="p-4 rounded border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-semibold text-zinc-700">{r.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{r.name}</div>
                    <div className="text-xs text-zinc-500">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <Stars value={r.rating} />
              </div>
              <p className="mt-2 text-zinc-700 dark:text-zinc-300">{r.text}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
