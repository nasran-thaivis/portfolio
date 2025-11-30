import { notFound } from "next/navigation";

export default async function ReviewPage() {
  // Block direct access - show 404
  notFound();
}