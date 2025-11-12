import Link from "next/link";
import Container from "../components/Container";

export const metadata = {
  title: "About",
  description: "About Nasran Salaeh - IT Support / Programmer",
};

export default function AboutPage() {
  return (
    <Container title="About">
      <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        I am highly motivated to develop my skills in IT and programming. I am eager to
        learn new things, grow with the organization, and continuously improve myself.
        I am cheerful, adaptable, and a quick learner.
      </p>

      <section className="mt-6">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Contact</h2>
        <div className="mt-2 text-zinc-700 dark:text-zinc-300">
          <p>Phone: 062-209-5297</p>
          <p>Email: Nasransalaeh39@gmail.com</p>
          <p>Address: 61/16 Fah Mai Mansion, Soi Nawarak, Rassada, Mueang, Phuket 83000</p>
        </div>
      </section>

      <div className="mt-6">
        <Link href="/profile" className="rounded bg-zinc-800 text-white px-4 py-2">View Profile</Link>
      </div>
    </Container>
  );
}
