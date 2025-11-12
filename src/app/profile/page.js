import ProfileClient from "./ProfileClient";
import Container from "../components/Container";

export const metadata = {
  title: "Profile",
  description: "Personal profile page",
};

export default function Page() {
  // Server component: render client profile inside a reusable container
  return (
    <Container title="Profile">
      <ProfileClient />
    </Container>
  );
}
