

import Chat from "@/components/Chat";
import Header from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="p-5 max-w-2xl mx-auto">
        <Chat />
      </main>
    </>
  );
}
