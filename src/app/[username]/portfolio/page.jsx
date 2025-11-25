"use client";

import { useState, useEffect, use } from "react";
import Container from "../../components/Container";
import ProjectCard from "../../components/ProjectCard";
import { notFound } from "next/navigation";

export default function PortfolioPage({ params }) {
  // Next.js 15: params is a Promise, use React's use() hook to unwrap it
  const { username } = use(params);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(true);

  // 1. ตรวจสอบว่า user มีอยู่จริงก่อน
  useEffect(() => {
    const checkUserAndFetchProjects = async () => {
      try {
        // ตรวจสอบว่า user มีอยู่จริงก่อน - ใช้ Next.js API route
        const userUrl = `/api/users/username/${username}`;
        console.log(`[PortfolioPage] Checking user: ${userUrl}`);
        
        const userRes = await fetch(userUrl, {
          cache: "no-store",
        });
        
        if (!userRes.ok) {
          console.warn(`[PortfolioPage] User not found: ${username}, status: ${userRes.status}`);
          // Don't set userExists to false immediately - allow page to render with empty projects
          setUserExists(false);
        } else {
          const userData = await userRes.json();
          
          // Handle both success:false and success:true formats
          if (userData.success === false) {
            console.warn(`[PortfolioPage] User not found: ${username}`);
            setUserExists(false);
          } else if (userData.success && userData.user) {
            console.log(`[PortfolioPage] User found: ${username}`, userData.user.username);
            setUserExists(true);
          } else if (userData.username || userData.email) {
            // Fallback: if data has user properties directly
            setUserExists(true);
          } else {
            console.warn(`[PortfolioPage] Invalid user response for: ${username}`, userData);
            setUserExists(false);
          }
        }
        
        // ดึงข้อมูล projects - ใช้ Next.js API route
        const projectsUrl = `/api/projects?username=${username}`;
        console.log(`[PortfolioPage] Fetching projects: ${projectsUrl}`);
        
        const res = await fetch(projectsUrl, {
          cache: "no-store",
        });
        
        if (!res.ok) {
          console.warn(`[PortfolioPage] Failed to fetch projects for ${username}, status: ${res.status}`);
          // ไม่ set userExists เป็น false เพราะ user อาจมีอยู่แล้ว แค่ไม่มี projects
          setProjects([]);
        } else {
          const data = await res.json();
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(`[PortfolioPage] Error loading data for ${username}:`, error);
        // On error, still allow page to render with empty projects
        setProjects([]);
        // Don't set userExists to false on network errors - allow graceful degradation
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetchProjects();
  }, [username]);

  // Only show 404 if we're sure user doesn't exist and we're not loading
  // Allow page to render with empty projects if backend is unavailable
  if (!userExists && !loading) {
    // For now, still render the page with empty state instead of 404
    // This allows graceful degradation when backend is unavailable
    console.warn(`[PortfolioPage] User ${username} not found, but rendering page with empty state`);
  }

  return (
    <Container title="Portfolio">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4"></h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          รวมผลงานทั้งหมดที่ดึงมาจาก Database
        </p>
      </div>

      {loading ? (
        <div className="text-center text-white py-20 animate-pulse">
          กำลังโหลดข้อมูล...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center text-gray-500 py-20 border-2 border-dashed border-zinc-700 rounded-xl">
          <p className="text-xl">📭 ยังไม่มีผลงาน</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </Container>
  );
}

