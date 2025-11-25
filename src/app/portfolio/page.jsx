"use client";

import { useState, useEffect } from "react";
import Container from "../components/Container";
import ProjectCard from "../components/ProjectCard";
import { getApiUrl } from "../../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function PortfolioPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. ดึงข้อมูลจาก Backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // สร้าง AbortController สำหรับ timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
        
        // ยิงไปขอข้อมูล
        const res = await fetch(getApiUrl("/api/projects"), {
          cache: "no-store",
          signal: controller.signal,
        }).catch((fetchError) => {
          // จัดการ network errors
          if (fetchError.name === 'AbortError') {
            console.warn("Projects fetch timeout");
          } else if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
            console.warn("Projects fetch failed - backend may not be running");
      } else {
        console.warn("Projects fetch error:", fetchError);
      }
      throw fetchError;
    }).finally(() => {
      clearTimeout(timeoutId);
    });

        // ตรวจสอบ response status ก่อน parse JSON
        if (!res.ok) {
          console.warn(`Failed to fetch projects: ${res.status} ${res.statusText}`);
          setProjects([]); // Set empty array instead of crashing
          return;
        }

        let data;
        try {
          data = await res.json();
        } catch (jsonError) {
          console.error("Failed to parse projects response:", jsonError);
          setProjects([]); // Set empty array instead of crashing
          return;
        }

        setProjects(data || []); // เก็บใส่ตัวแปร (ensure array)
      } catch (error) {
        // จัดการทุกประเภทของ errors
        if (error.name === 'AbortError') {
          console.warn("Projects fetch timeout");
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.warn("Projects fetch failed - backend may not be running");
        } else {
          console.error("Error fetching projects:", error);
        }
        setProjects([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // แสดง loading ขณะตรวจสอบ authentication
  if (authLoading) {
    return (
      <Container title="Portfolio">
        <div className="text-center text-white py-20 animate-pulse">
          กำลังโหลดข้อมูล...
        </div>
      </Container>
    );
  }

  // ถ้ายังไม่ login → แสดงหน้าว่าง
  if (!isAuthenticated) {
    return <Container title="Portfolio"></Container>;
  }

  // ถ้า login แล้ว → แสดงเนื้อหา Portfolio
  return (
    <Container title="Portfolio">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4"></h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          รวมผลงานทั้งหมดที่ดึงมาจาก Database ของฉัน
        </p>
      </div>

      {/* 2. แสดงผลตามสถานะ */}
      {loading ? (
        <div className="text-center text-white py-20 animate-pulse">
          กำลังโหลดข้อมูล...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center text-gray-500 py-20 border-2 border-dashed border-zinc-700 rounded-xl">
          <p className="text-xl">📭 ยังไม่มีผลงาน</p>
          <p className="text-sm mt-2">ไปเพิ่มในหน้า Admin ก่อนนะ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 3. วนลูปสร้างการ์ดจริง */}
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </Container>
  );
}