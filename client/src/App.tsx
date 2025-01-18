function App() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 min-h-screen min-w-screen w-auto h-auto object-cover brightness-50"
        style={{ minWidth: "100vw", minHeight: "100vh" }}
        src="/videos/whalie.mp4"
      />
      <div className="relative z-10 h-screen w-screen flex items-center justify-center">
        <button className="group relative w-48 h-48 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-700 text-white font-bold rounded-full text-xl shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(59,130,246,0.7)] active:scale-95 active:shadow-[0_0_20px_rgba(59,130,246,0.3)] overflow-hidden">
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            Talk to Whalie
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-white/20 group-hover:border-white/30 transition-all duration-300"></div>
        </button>
      </div>
    </div>
  );
}

export default App;
