import { notFound } from "next/navigation";

// === หน้า Contact ===
export default function ContactPage() {
  // Block direct access - show 404
  notFound();
}