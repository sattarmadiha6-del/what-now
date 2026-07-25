import Header from "@/components/Header";
import CheckinFlow from "@/components/CheckinFlow";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-10">
        <CheckinFlow />
      </main>
    </>
  );
}
