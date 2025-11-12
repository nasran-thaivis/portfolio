"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../auth/AuthProvider";

function SkillBar({ label, percent }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="text-zinc-500 text-xs">{percent}%</span>
      </div>
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded h-2 mt-1 overflow-hidden">
        <div className={`h-2 bg-emerald-600 dark:bg-emerald-500 transition-all`} style={{ width: mounted ? `${percent}%` : "0%" }} />
      </div>
    </div>
  );
}

function Accordion({ title, children, openDefault = false }) {
  const [open, setOpen] = useState(openDefault);
  return (
    <div className="border-b border-gray-100 dark:border-zinc-800 py-3">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left">
        <span className="font-medium text-zinc-900 dark:text-zinc-50">{title}</span>
        <span className="text-zinc-500">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{children}</div>}
    </div>
  );
}

export default function ProfileClient() {
  const { user } = useAuth();
  const email = "Nasransalaeh39@gmail.com";

  const skills = useMemo(() => [
    ["Next.js", 75],
    ["React", 80],
    ["Tailwind", 70],
    ["WordPress", 85],
    ["LAN / Hardware", 70]
  ], []);

  const defaultProjects = useMemo(() => ([
    {
      id: 'p1',
      title: 'Salamo Travel Website',
      desc: 'Company website and booking system for Salamo Travel (internship project).',
      tags: ['WordPress', 'Booking'],
      link: '#'
    },
    {
      id: 'p2',
      title: 'Internal Tools',
      desc: 'Small admin tools and automation scripts for support workflows.',
      tags: ['Node.js', 'Automation'],
      link: '#'
    },
    {
      id: 'p3',
      title: 'Video Content & Vlogs',
      desc: 'Vlogs and edited promotional videos for tour packages.',
      tags: ['Video Editing', 'Content'],
      link: '#'
    }
  ]), []);

  // Local storage keys for persistent editable data
  const LS_EDU = "profile_education_v1";
  const LS_PROJECTS = "profile_projects_v1";
  const LS_EXP = "profile_experience_v1";

  // Default education and experience entries
  const defaultEducation = useMemo(() => ([
    { id: 'e1', school: 'Phuket Rajabhat University', detail: 'B.Sc. in Computer Science (2022 - 2025 expected)' },
    { id: 'e2', school: 'Prateep Witthaya School', detail: 'High School, Arts Language Program (2019 - 2021)' },
    { id: 'e3', school: 'Thamvitya Mulniti School', detail: 'Secondary, Science-Math Program (2016 - 2018)' }
  ]), []);

  const defaultExperience = useMemo(() => ([
    { id: 'w1', company: 'Salamo Travel', role: 'Intern, IT Support (2024)', detail: 'Designed company website, maintained tour booking system, provided on-site customer service, handled documentation, created vlogs, and edited videos.' }
  ]), []);

  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Editable state for education, projects, and experience
  const [education, setEducation] = useState(defaultEducation);
  const [projects, setProjects] = useState(defaultProjects);
  const [experience, setExperience] = useState(defaultExperience);

  // Per-section edit mode flags
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingProjects, setEditingProjects] = useState(false);
  const [editingExperience, setEditingExperience] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  // Load persisted editable data on mount
  useEffect(() => {
    try {
      const sEdu = localStorage.getItem(LS_EDU);
      if (sEdu) setEducation(JSON.parse(sEdu));
      const sProj = localStorage.getItem(LS_PROJECTS);
      if (sProj) setProjects(JSON.parse(sProj));
      const sExp = localStorage.getItem(LS_EXP);
      if (sExp) setExperience(JSON.parse(sExp));
    } catch (e) {
      console.error('Failed to load profile editable data', e);
    }
  }, []);

  // Helpers to persist
  const persistEducation = (data) => { setEducation(data); try { localStorage.setItem(LS_EDU, JSON.stringify(data)); } catch(e){console.error(e);} };
  const persistProjects = (data) => { setProjects(data); try { localStorage.setItem(LS_PROJECTS, JSON.stringify(data)); } catch(e){console.error(e);} };
  const persistExperience = (data) => { setExperience(data); try { localStorage.setItem(LS_EXP, JSON.stringify(data)); } catch(e){console.error(e);} };

  if (!user) {
    return (
      <div className="min-h-[70vh] p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">You must be logged in to view this profile.</p>
          <Link href="/login" className="rounded bg-zinc-800 text-white px-4 py-2">Go to Login</Link>
        </div>
      </div>
    );
  }

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-[70vh] p-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#070707] rounded-lg shadow p-6 md:p-10">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 md:h-28 md:w-28 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-4xl font-bold text-zinc-700">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{user.name}</h1>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Nasran Salaeh — IT Support / Programmer</div>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={handleCopyEmail} className="text-sm rounded px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">{copied ? "Email copied" : "Copy email"}</button>
                <a href="/Nasran.vcf" className="text-sm rounded px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700" download>Download vCard</a>
                <button onClick={() => setContactOpen(true)} className="text-sm rounded px-3 py-1 bg-blue-600 text-white hover:bg-blue-700">Contact</button>
                <button onClick={() => window.print()} className="text-sm rounded px-3 py-1 bg-zinc-50 dark:bg-zinc-800">Print</button>
              </div>
            </div>
          </div>

          {/* Top-right section navigation: smooth scroll to anchors */}
          <div className="flex items-center gap-2">
            <nav className="text-sm">
              <button onClick={() => document.getElementById('education')?.scrollIntoView({behavior:'smooth', block:'start'})} className="px-3 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">Education</button>
              <button onClick={() => document.getElementById('portfolio')?.scrollIntoView({behavior:'smooth', block:'start'})} className="px-3 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">Portfolio</button>
              <button onClick={() => document.getElementById('experience')?.scrollIntoView({behavior:'smooth', block:'start'})} className="px-3 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">Experience</button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <aside className="md:col-span-1">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded p-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Contact</h3>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300"><strong>Phone:</strong> 062-209-5297</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300"><strong>Email:</strong> {email}</p>
              <p className="mt-2 text-xs text-zinc-500">61/16 Fah Mai Mansion, Soi Nawarak, Rassada, Mueang, Phuket 83000</p>
            </div>

            <div className="mt-4 bg-zinc-50 dark:bg-zinc-900 rounded p-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Quick Skills</h3>
              <div className="mt-3 space-y-3">
                {skills.map(([label, pct]) => (
                  <SkillBar key={label} label={label} percent={pct} />
                ))}
              </div>
            </div>
          </aside>

          <main className="md:col-span-2">
            <section>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Profile</h3>
              <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">I am highly motivated to develop my skills in IT and programming. I am eager to learn new things, grow with the organization, and continuously improve myself. I am cheerful, adaptable, and a quick learner.</p>
            </section>

            <div className="mt-6 space-y-4">
              <Accordion title="Information" openDefault>
                <ul className="space-y-1">
                  <li><strong>Name:</strong> Nasran Salaeh</li>
                  <li><strong>Nickname:</strong> Lan</li>
                  <li><strong>Age:</strong> 23</li>
                  <li><strong>Date of Birth:</strong> April 24, 2002</li>
                  <li><strong>Nationality:</strong> Thai</li>
                </ul>
              </Accordion>

              <div id="education">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Education</h3>
                  <div>
                    {!editingEducation ? (
                      <button onClick={() => setEditingEducation(true)} className="text-sm px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800">Edit</button>
                    ) : (
                      <>
                        <button onClick={() => { persistEducation(education); setEditingEducation(false); }} className="text-sm px-3 py-1 rounded bg-emerald-600 text-white mr-2">Save</button>
                        <button onClick={() => { setEducation(JSON.parse(localStorage.getItem(LS_EDU) || JSON.stringify(defaultEducation))); setEditingEducation(false); }} className="text-sm px-3 py-1 rounded">Cancel</button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  {education.map((e, idx) => (
                    <div key={e.id} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                      {!editingEducation ? (
                        <div>
                          <div className="font-semibold">{e.school}</div>
                          <div className="text-sm text-zinc-600">{e.detail}</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input value={e.school} onChange={(ev) => { const next = [...education]; next[idx] = { ...e, school: ev.target.value }; setEducation(next); }} className="w-full rounded border px-2 py-1 bg-white dark:bg-[#070707]" />
                          <input value={e.detail} onChange={(ev) => { const next = [...education]; next[idx] = { ...e, detail: ev.target.value }; setEducation(next); }} className="w-full rounded border px-2 py-1 bg-white dark:bg-[#070707]" />
                          <div className="flex gap-2">
                            <button onClick={() => { const next = education.filter(x => x.id !== e.id); setEducation(next); }} className="text-xs px-2 py-1 rounded bg-red-600 text-white">Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {editingEducation && (
                    <div>
                      <button onClick={() => { const n = { id: 'e' + Date.now(), school: 'New School', detail: '' }; const next = [...education, n]; setEducation(next); }} className="text-sm px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800">Add entry</button>
                    </div>
                  )}
                </div>
              </div>

              <div id="experience">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Work Experience</h3>
                  <div>
                    {!editingExperience ? (
                      <button onClick={() => setEditingExperience(true)} className="text-sm px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800">Edit</button>
                    ) : (
                      <>
                        <button onClick={() => { persistExperience(experience); setEditingExperience(false); }} className="text-sm px-3 py-1 rounded bg-emerald-600 text-white mr-2">Save</button>
                        <button onClick={() => { setExperience(JSON.parse(localStorage.getItem(LS_EXP) || JSON.stringify(defaultExperience))); setEditingExperience(false); }} className="text-sm px-3 py-1 rounded">Cancel</button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  {experience.map((w, idx) => (
                    <div key={w.id} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                      {!editingExperience ? (
                        <div>
                          <div className="font-semibold">{w.company} — {w.role}</div>
                          <div className="text-sm text-zinc-600">{w.detail}</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input value={w.company} onChange={(ev) => { const next = [...experience]; next[idx] = { ...w, company: ev.target.value }; setExperience(next); }} className="w-full rounded border px-2 py-1 bg-white dark:bg-[#070707]" />
                          <input value={w.role} onChange={(ev) => { const next = [...experience]; next[idx] = { ...w, role: ev.target.value }; setExperience(next); }} className="w-full rounded border px-2 py-1 bg-white dark:bg-[#070707]" />
                          <input value={w.detail} onChange={(ev) => { const next = [...experience]; next[idx] = { ...w, detail: ev.target.value }; setExperience(next); }} className="w-full rounded border px-2 py-1 bg-white dark:bg-[#070707]" />
                          <div className="flex gap-2">
                            <button onClick={() => { const next = experience.filter(x => x.id !== w.id); setExperience(next); }} className="text-xs px-2 py-1 rounded bg-red-600 text-white">Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {editingExperience && (
                    <div>
                      <button onClick={() => { const n = { id: 'w' + Date.now(), company: 'New Company', role: 'Role', detail: '' }; const next = [...experience, n]; setExperience(next); }} className="text-sm px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800">Add experience</button>
                    </div>
                  )}
                </div>
              </div>

              <Accordion title="Skills & Soft Skills">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">Microsoft Office</span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">LAN setup</span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">Software install</span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">WordPress</span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">AI tools (Gemini, ChatGPT)</span>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Hobbies">
                <p>Online selling, Watching movies, Listening to music, Gaming, Exercise</p>
              </Accordion>
              
              {/* Portfolio / Projects grid (editable) */}
              <div id="portfolio" className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Portfolio</h3>
                  <div>
                    {!editingProjects ? (
                      <button onClick={() => setEditingProjects(true)} className="text-sm px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800">Edit</button>
                    ) : (
                      <>
                        <button onClick={() => { persistProjects(projects); setEditingProjects(false); }} className="text-sm px-3 py-1 rounded bg-emerald-600 text-white mr-2">Save</button>
                        <button onClick={() => { setProjects(JSON.parse(localStorage.getItem(LS_PROJECTS) || JSON.stringify(defaultProjects))); setEditingProjects(false); }} className="text-sm px-3 py-1 rounded">Cancel</button>
                      </>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Selected projects and work samples. Click any card to view details.</p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {projects.map((p, idx) => (
                    <article key={p.id} className="group bg-white dark:bg-[#0b0b0b] rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden border border-gray-100 dark:border-zinc-800">
                      <div className="h-36 bg-gradient-to-br from-emerald-200 to-emerald-400 dark:from-emerald-700 dark:to-emerald-500 flex items-center justify-center text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
                        {p.title.split(' ').slice(0,2).map(w=>w.charAt(0)).join('')}
                      </div>
                      <div className="p-4">
                        {!editingProjects ? (
                          <>
                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{p.title}</h4>
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{p.desc}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {p.tags.map(t=> <span key={t} className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{t}</span>)}
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <a href={p.link} className="text-sm text-emerald-600 hover:underline">View</a>
                              <button className="text-xs px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-900 group-hover:scale-105 transition-transform">Demo</button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <input value={p.title} onChange={(ev) => { const next = [...projects]; next[idx] = { ...p, title: ev.target.value }; setProjects(next); }} className="w-full rounded border px-2 py-1 bg-white dark:bg-[#070707]" />
                            <input value={p.link} onChange={(ev) => { const next = [...projects]; next[idx] = { ...p, link: ev.target.value }; setProjects(next); }} className="w-full rounded border px-2 py-1 bg-white dark:bg-[#070707]" />
                            <textarea value={p.desc} onChange={(ev) => { const next = [...projects]; next[idx] = { ...p, desc: ev.target.value }; setProjects(next); }} className="w-full rounded border px-2 py-1 bg-white dark:bg-[#070707]" />
                            <input value={p.tags.join(', ')} onChange={(ev) => { const next = [...projects]; next[idx] = { ...p, tags: ev.target.value.split(',').map(t=>t.trim()).filter(Boolean) }; setProjects(next); }} className="w-full rounded border px-2 py-1 bg-white dark:bg-[#070707]" />
                            <div className="flex gap-2">
                              <button onClick={() => { const next = projects.filter(x => x.id !== p.id); setProjects(next); }} className="text-xs px-2 py-1 rounded bg-red-600 text-white">Delete</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>

                {editingProjects && (
                  <div className="mt-4">
                    <button onClick={() => { const n = { id: 'p' + Date.now(), title: 'New Project', desc: '', tags: [], link: '' }; persistProjects([...projects, n]); }} className="text-sm px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800">Add project</button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {contactOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#0b0b0b] rounded-lg p-6 w-full max-w-md">
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Contact Nasran</h4>
              <p className="text-sm text-zinc-500 mt-2">This is a demo contact modal. In production, you would wire this to an API or email service.</p>
              <form className="mt-4 space-y-3" onSubmit={(e)=>{e.preventDefault(); setContactOpen(false); alert('Message sent (demo)');}}>
                <input placeholder="Your name" className="w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-900" />
                <input placeholder="Your email" className="w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-900" />
                <textarea placeholder="Message" className="w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-900" rows={4} />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={()=>setContactOpen(false)} className="rounded px-3 py-1">Cancel</button>
                  <button type="submit" className="rounded bg-blue-600 text-white px-3 py-1">Send</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
