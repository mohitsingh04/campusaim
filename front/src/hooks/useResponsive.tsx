import { useEffect, useState } from "react";

export const useResponsive = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < breakpoint);

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [breakpoint]);

  return isMobile;
};
