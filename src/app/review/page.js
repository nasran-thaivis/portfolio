import ReviewClient from "./ReviewClient";
import Container from "../components/Container";

export const metadata = {
  title: "Review",
  description: "User reviews and feedback",
};

export default function Page() {
  // Server component - renders the client review UI inside a container
  return (
    <Container title="Review">
      <ReviewClient />
    </Container>
  );
}
