import { useState, useEffect, useRef, useCallback } from "react";

export const useHorizontalScroll = (scrollAmount: number = 200) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const startEl = startRef.current;
    const endEl = endRef.current;
    const scrollEl = scrollRef.current;

    if (!startEl || !endEl || !scrollEl) return;

    const observerOptions = {
      root: scrollEl,
      threshold: 0.5, // Trigger when 50% visible
    };

    const startObserver = new IntersectionObserver(([entry]) => {
      // If start is NOT intersecting, it means it's scrolled out of view to the left
      setCanScrollLeft(!entry.isIntersecting);
    }, observerOptions);

    const endObserver = new IntersectionObserver(([entry]) => {
      // If end is NOT intersecting, it means it's hidden to the right
      setCanScrollRight(!entry.isIntersecting);
    }, observerOptions);

    startObserver.observe(startEl);
    endObserver.observe(endEl);

    return () => {
      startObserver.disconnect();
      endObserver.disconnect();
    };
  }, []);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    },
    [scrollAmount]
  );

  return { scrollRef, startRef, endRef, canScrollLeft, canScrollRight, scroll };
};