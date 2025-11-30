import { notFound } from "next/navigation";

export default async function AboutPage() {
  // Block direct access - show 404
  notFound();
}