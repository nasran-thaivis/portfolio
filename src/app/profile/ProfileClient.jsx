"use client";

import { useEffect, useMemo , useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

function SkillBar({ label, percent }) {
  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between text-sm text-zinc-300">
        <span>{label}</span>
        <span className="text-xs text-zinc-400">{percent}%</span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden mt-1">
        <div className="h-2 bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </li>
  );
}

export default function ProfileClient({ skills: serverSkills = null, pageInfo = null }) {
  const { data: session } = useSession();
  const user = session?.user;
  const email = "Nasransalaeh39@gmail.com";

  // Logo uploader state
  const [logoUrl, setLogoUrl] = useState(null);
  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
  };

  const removeLogo = () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(null);
  };

  // Editable profile text
  const [profileText, setProfileText] = useState(
    "I am highly motivated to develop my skills in IT and programming. I am eager to learn new things, grow with the organization, and continuously improve myself. I am cheerful, adaptable, and a quick learner."
  );
  const [editingProfile, setEditingProfile] = useState(false);

  // Portfolio / posts state (client-only). Persist to localStorage for simple persistence.
  const [posts, setPosts] = useState(() => {
    try {
      const raw = localStorage.getItem("profilePosts");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostImage, setNewPostImage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("profilePosts", JSON.stringify(posts));
    } catch (e) {
      // ignore
    }
  }, [posts]);

  const addPost = (e) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;
    const p = { id: Date.now(), title: newPostTitle.trim(), image: newPostImage.trim() };
    setPosts((s) => [p, ...s]);
    setNewPostTitle("");
    setNewPostImage("");
    setShowAddPost(false);
  };

  const removePost = (id) => {
    setPosts((s) => s.filter((p) => p.id !== id));
  };

  // derive skills array: accept serverSkills shape or fallback
  const skills = useMemo(() => {
    if (Array.isArray(serverSkills) && serverSkills.length > 0) {
      return serverSkills
        .map((s) => [s.name, Number(s?.percentage ?? 0)])
        .map(([n, p]) => [n, Math.max(0, Math.min(100, Number(p || 0)))]);
    }
    return [
      ["Next.js", 40],
      ["React", 40],
      ["Tailwind", 50],
      ["WordPress", 85],
      ["LAN/Hardware", 60],
    ];
  }, [serverSkills]);

  if (!user) {
    return (
      <div className="min-h-[70vh] p-8 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <p>You must be logged in to view this profile.</p>
          <Link href="/login" className="inline-block rounded bg-zinc-800 hover:bg-zinc-700 px-4 py-2">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const nameInitial = (user.name || user.email || "U").charAt(0).toUpperCase();


  return (
    <div className="min-h-[70vh] px-4 sm:px-6 py-8 text-white">
      <div className="w-full max-w-5xl mx-auto bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 sm:p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="h-20 w-20 md:h-28 md:w-28 rounded-full bg-zinc-800 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  nameInitial
                )}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Nasran Salaeh</h1>
              <div className="text-sm text-zinc-400">IT Support / Programmer</div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-white cursor-pointer">
                    Upload Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                  </label>
                  {logoUrl ? (
                    <button onClick={removeLogo} className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-white">
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <aside className="md:col-span-1 space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg shadow-sm border border-zinc-800 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-semibold">Contact</h3>
              <p className="mt-2 text-sm text-zinc-300">
                <strong>Phone:</strong> 062-209-5297
              </p>
              <p className="text-sm text-zinc-300">
                <strong>Email:</strong> {email}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                61/16 Fah Mai Mansion, Soi Nawarak, Rassada, Mueang, Phuket 83000
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-sm border border-zinc-800 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Quick Skills</h3>
                <button
                  className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded transition-transform transform hover:-translate-y-0.5"
                  onClick={() => alert('Skills are editable in the Profile editor (coming soon)')}
                >
                  Edit
                </button>
              </div>
              <ul className="mt-3 space-y-3">
                {skills.map(([label, pct]) => (
                  <SkillBar key={label} label={label} percent={pct} />
                ))}
              </ul>
            </div>
          </aside>

          <main className="md:col-span-2 space-y-6">
            <section>
              <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-zinc-800 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold">Profile</h3>
                  <div className="flex items-center gap-2">
                    {!editingProfile ? (
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-md shadow-sm transform transition-transform hover:-translate-y-0.5"
                      >
                        Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingProfile(false)}
                          className="text-sm bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setEditingProfile(false)}
                          className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-md"
                        >
                          Save
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  {!editingProfile ? (
                    <p className="text-zinc-300 leading-relaxed">{profileText}</p>
                  ) : (
                    <textarea
                      value={profileText}
                      onChange={(e) => setProfileText(e.target.value)}
                      className="w-full bg-black text-white p-3 rounded-md border border-zinc-700 h-36"
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Portfolio Section: 3-column grid, each column contains containers of 2 boxes stacked */}
            <section>
              <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-zinc-800 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold">Portfolio</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddPost((s) => !s)}
                      className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-md"
                    >
                      {showAddPost ? "Close" : "Add Work"}
                    </button>
                  </div>
                </div>

                {showAddPost && (
                  <form onSubmit={addPost} className="mt-4 grid grid-cols-1 gap-3">
                    <input
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Title"
                      className="w-full rounded border border-zinc-700 px-3 py-2 bg-black text-white"
                    />
                    <input
                      value={newPostImage}
                      onChange={(e) => setNewPostImage(e.target.value)}
                      placeholder="Image URL (optional)"
                      className="w-full rounded border border-zinc-700 px-3 py-2 bg-black text-white"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="rounded bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1">
                        Add
                      </button>
                      <button type="button" onClick={() => setShowAddPost(false)} className="rounded bg-zinc-700 px-3 py-1">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/** Build three columns, distribute posts by index % 3, then chunk into groups of 2 per container */}
                    {Array.from({ length: 3 }).map((_, colIdx) => {
                      const colPosts = posts.filter((_, i) => i % 3 === colIdx);
                      // chunk into groups of 2
                      const chunks = [];
                      for (let i = 0; i < colPosts.length; i += 2) chunks.push(colPosts.slice(i, i + 2));
                      return (
                        <div key={colIdx} className="space-y-4">
                          {chunks.length === 0 && <div className="text-sm text-zinc-500">No works in this column</div>}
                          {chunks.map((group, gi) => (
                            <div key={gi} className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 space-y-3">
                              {group.map((post) => (
                                <div key={post.id} className="flex gap-3 items-center">
                                  <div className="w-24 h-16 bg-zinc-900 rounded overflow-hidden flex-shrink-0">
                                    {post.image ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-sm text-zinc-500">No Image</div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{post.title}</div>
                                    <div className="text-xs text-zinc-400">ID: {post.id}</div>
                                  </div>
                                  <div>
                                    <button onClick={() => removePost(post.id)} className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded">
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-zinc-800 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold mb-3">Information</h3>
                <ul className="space-y-2 text-gray-200">
                  <li className="flex">
                    <span className="w-1/3 text-gray-400 font-semibold">Name:</span>
                    <span className="w-2/3">Nasran Salaeh</span>
                  </li>
                  <li className="flex">
                    <span className="w-1/3 text-gray-400 font-semibold">Nickname:</span>
                    <span className="w-2/3">Lan</span>
                  </li>
                  <li className="flex">
                    <span className="w-1/3 text-gray-400 font-semibold">Age:</span>
                    <span className="w-2/3">23</span>
                  </li>
                  <li className="flex">
                    <span className="w-1/3 text-gray-400 font-semibold">Date of Birth:</span>
                    <span className="w-2/3">April 24, 2002</span>
                  </li>
                  <li className="flex">
                    <span className="w-1/3 text-gray-400 font-semibold">Nationality:</span>
                    <span className="w-2/3">Thai</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-zinc-800 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold mb-3">Skills & Soft Skills</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Microsoft Office</li>
                  <li>LAN setup</li>
                  <li>Software install</li>
                  <li>WordPress</li>
                  <li>AI tools (Gemini, ChatGPT)</li>
                </ul>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-zinc-800 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold mb-3">Hobbies</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Online selling</li>
                  <li>Watching movies</li>
                  <li>Listening to music</li>
                  <li>Gaming</li>
                  <li>Exercise</li>
                </ul>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

