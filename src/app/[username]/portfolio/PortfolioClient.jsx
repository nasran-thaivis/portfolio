"use client";

import { useState, useEffect } from "react";
import ProjectCard from "../../components/ProjectCard";

export default function PortfolioClient({ username }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูล projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsUrl = `/api/projects?username=${username}`;
        console.log(`[PortfolioClient] Fetching projects: ${projectsUrl}`);
        
        const res = await fetch(projectsUrl, {
          cache: "no-store",
        });
        
        if (!res.ok) {
          console.warn(`[PortfolioClient] Failed to fetch projects for ${username}, status: ${res.status}`);
          setProjects([]);
        } else {
          const data = await res.json();
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(`[PortfolioClient] Error loading projects for ${username}:`, error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [username]);

  if (loading) {
    return (
      <div className="text-center text-white py-20 animate-pulse">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center text-gray-500 py-20 border-2 border-dashed border-zinc-700 rounded-xl">
        <p className="text-xl">📭 ยังไม่มีผลงาน</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project, index) => (
        <ProjectCard key={project.id || `project-${index}`} project={project} />
      ))}
    </div>
  );
}

