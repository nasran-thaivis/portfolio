import Container from "../components/Container";
import AboutClient from "./AboutClient";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function AboutPage() {
  return (
    <Container title="About">
      <AboutClient />
    </Container>
  );
}