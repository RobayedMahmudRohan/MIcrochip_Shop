import Chat from "@/components/chat/chat";

export default function AIAssistantPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto h-[80vh] max-h-[700px] w-full max-w-3xl">
        <Chat />
      </div>
    </main>
  );
}