import { notFound } from "next/navigation";

export default function PortfolioPage() {
  // Block direct access - show 404
  notFound();
}