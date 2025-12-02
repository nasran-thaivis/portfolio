import ReviewClient from "./ReviewClient";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function ReviewPage() {
  return <ReviewClient />;
}