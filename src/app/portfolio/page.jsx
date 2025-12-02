import Container from "../components/Container";
import PortfolioClient from "./PortfolioClient";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function PortfolioPage() {
  return (
    <Container title="Portfolio">
      <PortfolioClient />
    </Container>
  );
}