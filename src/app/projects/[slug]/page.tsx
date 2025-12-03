import { notFound } from "next/navigation";
import Image from "next/image";
import Container from "../../components/Container";
import { getBaseUrl } from "../../../lib/getBaseUrl";
import { getSignedImageUrl } from "../../../lib/imageUtils";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// หน้ารายละเอียด project ตาม dynamic route (ใช้ ID จาก Database ผ่าน Backend API)
export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let project: any = null;

  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/projects/${slug}`;
    console.log(`[ProjectDetail] Fetching project from: ${url}`);

    const res = await fetch(url, {
      cache: "no-store",
    });

    if (res.ok) {
      project = await res.json();
    } else {
      console.warn(`[ProjectDetail] Backend project fetch failed with status ${res.status}`);
    }
  } catch (e) {
    console.error("[ProjectDetail] Error loading project from backend", e);
  }

  if (!project) return notFound();

  const imageUrl = project.imageUrl
    ? getSignedImageUrl(project.imageUrl)
    : "https://placehold.co/1200x400?text=No+Image";

  return (
    <Container title={project.title}>
      {/* Cover image */}
      <div className="w-full h-64 relative rounded overflow-hidden">
        <Image src={imageUrl} alt={project.title} fill className="object-cover" />
      </div>

      {/* รายละเอียด */}
      <div className="mt-6 text-zinc-200">
        <p className="whitespace-pre-line">{project.description}</p>
      </div>

      {/* ลิงก์ Live / External */}
      {project.link && (
        <div className="mt-6 flex gap-3">
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700 transition"
          >
            View Project
          </a>
        </div>
      )}
    </Container>
  );
}
