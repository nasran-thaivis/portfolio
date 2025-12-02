import Container from "../components/Container";
import ContactForm from "./ContactForm";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// === หน้า Contact ===
export default function ContactPage() {
  return (
    <Container title="Contact">
      <ContactForm />
    </Container>
  );
}