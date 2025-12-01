import Footer from "@/components/Footer/Footer";
import { ConsentModal } from "@/components/modals/ConsentModal";
import Navbar from "@/components/navbar/Navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <ConsentModal />
      <Footer />
    </>
  );
}

// "use client";
// import Footer from "@/components/footer/Footer";
// import Navbar from "@/components/navbar/Navbar";
// import { useEffect, useRef, useState } from "react";

// export default function MainLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isMuted, setIsMuted] = useState(true);

//   const playAndUnmute = () => {
//     if (!audioRef.current) return;

//     // Unmute
//     if (audioRef.current.muted) {
//       audioRef.current.muted = false;
//       setIsMuted(false);
//       alert("Audio unmuted ✅");
//     }

//     // Play
//     audioRef.current
//       .play()
//       .then(() => {
//         setIsPlaying(true);
//         alert("Audio playing ▶️");
//       })
//       .catch(() => {
//         setIsPlaying(false);
//         alert("Playback blocked ❌");
//       });
//   };

//   useEffect(() => {
//     // Try silent autoplay first
//     if (audioRef.current) {
//       audioRef.current
//         .play()
//         .then(() => {
//           setIsPlaying(true);
//           console.log("Muted autoplay started (no sound) ✅");
//         })
//         .catch(() => console.log("Muted autoplay blocked"));
//     }

//     // Listen for any user interaction to play & unmute
//     const handleInteraction = () => {
//       playAndUnmute();
//       window.removeEventListener("click", handleInteraction);
//       window.removeEventListener("keydown", handleInteraction);
//       window.removeEventListener("scroll", handleInteraction);
//     };

//     window.addEventListener("click", handleInteraction);
//     window.addEventListener("keydown", handleInteraction);
//     window.addEventListener("scroll", handleInteraction);

//     return () => {
//       window.removeEventListener("click", handleInteraction);
//       window.removeEventListener("keydown", handleInteraction);
//       window.removeEventListener("scroll", handleInteraction);
//     };
//   }, []);

//   return (
//     <>
//       <Navbar />

//       <audio ref={audioRef} src="/medmusic.mp3" loop />

//       {children}
//       <Footer />
//     </>
//   );
// }
