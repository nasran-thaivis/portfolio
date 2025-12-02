"use client";

import Container from "../components/Container";
import AuthGuard from "../components/AuthGuard";

// Profile page intentionally left minimal — the profile UI has been moved to /about
// ต้อง Login ก่อนจึงจะเข้าถึงได้
// Note: Client Components cannot have runtime/dynamic exports
export default function Page() {
  return (
    <AuthGuard>
      <Container title="Portfolio">
        {/* Empty container — profile UI moved to About page */}
      </Container>
    </AuthGuard>
  );
}
