export default function App() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 min-h-screen min-w-screen w-auto h-auto object-cover blur-sm brightness-50"
        style={{ minWidth: "100vw", minHeight: "100vh" }}
        src="/videos/whalie.mp4"
      />
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative z-10 min-h-screen">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-8">
            Welcome to Your TypeScript + Tailwind App
          </h1>
          <p className="text-lg text-white">
            Start editing this page to build your application!
          </p>
        </main>
      </div>
    </div>
  );
}
