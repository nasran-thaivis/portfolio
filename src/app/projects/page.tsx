import Container from "../components/Container";
import ProjectCard from "../components/ProjectCard";
import { getBaseUrl } from "../../lib/getBaseUrl";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// หน้าแสดงรายการ Projects แบบ Card Grid (ดึงจาก Backend ผ่าน API เท่านั้น)
export default async function ProjectsPage() {
  let list: any[] = [];

  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/projects`;
    console.log(`[ProjectsPage] Fetching projects from: ${url}`);

    const res = await fetch(url, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      list = Array.isArray(data) ? data : [];
    } else {
      console.warn(`[ProjectsPage] Backend projects fetch failed with status ${res.status}`);
      list = [];
    }
  } catch (e) {
    console.error("[ProjectsPage] Error loading projects from backend", e);
    list = [];
  }

  return (
    <Container title="Projects">
      {/* Grid ของการ์ดผลงาน */}
      {list.length === 0 ? (
        <div className="text-center py-16 text-gray-500 border-2 border-dashed border-zinc-700 rounded-xl">
          ยังไม่มีข้อมูลโปรเจกต์ในระบบ
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </Container>
  );
}
