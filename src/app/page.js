import GreetingHeader from "@/components/GreetingHeader";
import BottomNav from "@/components/BottomNav";
import CheckinFlow from "@/components/CheckinFlow";

export default function Home() {
  return (
    <>
      <main className="flex-1 px-4 pt-8 pb-28">
        <div className="max-w-md mx-auto">
          <GreetingHeader />
        </div>
        <CheckinFlow />
      </main>
      <BottomNav />
    </>
  );
}
