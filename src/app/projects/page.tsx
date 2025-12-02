import Container from "../components/Container";
import Sanity from "../../lib/sanity";
import ProjectCard from "../components/ProjectCard";
import { PROJECTS } from "../data/projects";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// หน้าแสดงรายการ Projects แบบ Card Grid
export default async function ProjectsPage() {
  // Server component: try fetching from Sanity first, otherwise fallback to local data
  let projects = null;
  try {
    projects = await Sanity.getProjectsFromSanity();
  } catch (e) {
    console.error("Sanity fetch failed", e);
  }
  const list = projects && projects.length ? projects : PROJECTS;

  return (
    <Container title="Projects">
      {/* Grid ของการ์ดผลงาน */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {list.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </Container>
  );
}
