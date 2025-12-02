import Container from "../components/Container";
import ContactClient from "./ContactClient";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// === หน้า Contact ===
export default function ContactPage() {
  return (
    <Container title="Contact">
      <ContactClient />
    </Container>
  );
}