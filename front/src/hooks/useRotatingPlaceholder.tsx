"use client";
import { useEffect, useState } from "react";

export function useRotatingPlaceholder(list: string[]) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!list || list.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [list]);

  return {
    value: list[index],
    index,
  };
}
