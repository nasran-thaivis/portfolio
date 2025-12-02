import { notFound } from "next/navigation";
import Image from "next/image";
import Container from "../../components/Container";
import Sanity from "../../../lib/sanity";
import { PROJECTS } from "../../data/projects";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// หน้ารายละเอียด project ตาม slug dynamic route
export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // พยายามดึงข้อมูลจาก Sanity ก่อน หากไม่พบให้ fallback ไปยัง data ใน repo
  let project = null;
  try {
    project = await Sanity.getProjectBySlug(slug);
  } catch (e) {
    console.error("Sanity project fetch failed", e);
  }

  if (!project) {
    project = PROJECTS.find((p) => p.slug === slug) || null;
  }

  if (!project) return notFound();

  return (
    <Container title={project.title}>
      {/* Cover image */}
      <div className="w-full h-64 relative rounded overflow-hidden">
        <Image src={project.cover} alt={project.title} fill className="object-cover" />
      </div>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(project.tags || []).map((t) => (
          <span key={t} className="text-[12px] px-2 py-1 bg-zinc-700 rounded">
            {t}
          </span>
        ))}
      </div>

      {/* รายละเอียด */}
      <div className="mt-6 text-zinc-200">
        <p className="whitespace-pre-line">{project.description}</p>
      </div>

      {/* Gallery (ถ้ามี) */}
      {project.images && project.images.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {project.images.map((img, idx) => (
            <div key={idx} className="w-full h-48 relative rounded overflow-hidden">
              <Image src={img} alt={`${project.title} ${idx + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* ลิงก์ GitHub / Live */}
      <div className="mt-6 flex gap-3">
        {project.github && (
          <a href={project.github} target="_blank" rel="noreferrer" className="px-4 py-2 bg-zinc-800 rounded">
            View on GitHub
          </a>
        )}

        {project.demo && project.demo.length > 0 && (
          <a href={project.demo} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-600 rounded">
            Live Demo
          </a>
        )}
      </div>
    </Container>
  );
}
