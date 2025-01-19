import React, { useEffect } from "react";
import { useRecordVoice } from "./useRecordVoice";

function App() {
  const { recording, processing, startRecording, stopRecording } =
    useRecordVoice();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !recording && !processing) {
        e.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && recording) {
        e.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [recording, processing, startRecording, stopRecording]);

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
      <div className="relative z-10 h-screen w-screen flex items-center justify-end flex-col pb-24">
        <button
          onMouseDown={!processing ? startRecording : undefined}
          onMouseUp={recording ? stopRecording : undefined}
          onMouseLeave={recording ? stopRecording : undefined}
          disabled={processing}
          className={`group relative w-48 h-48 ${
            processing
              ? "from-blue-500 to-blue-600 cursor-wait"
              : recording
              ? "from-red-500 to-red-600 hover:from-red-400 hover:to-red-700 shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:shadow-[0_0_50px_rgba(239,68,68,0.7)]"
              : "from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-700 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_50px_rgba(59,130,246,0.7)]"
          } bg-gradient-to-br text-white font-bold rounded-full text-xl transition-all duration-300 hover:scale-105 active:scale-95 active:shadow-[0_0_20px_rgba(59,130,246,0.3)] overflow-hidden backdrop-blur-sm`}
        >
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {processing ? (
              <div className="animate-ping w-24 h-24 bg-white rounded-full"></div>
            ) : recording ? (
              "Listening..."
            ) : (
              "Talk to Whalie"
            )}
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-white/20 group-hover:border-white/30 transition-all duration-300"></div>
        </button>
      </div>
    </div>
  );
}

export default App;
