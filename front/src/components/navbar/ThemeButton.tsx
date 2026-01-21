import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

export default function ThemeButton() {
  const { theme, setTheme } = useTheme();
  const [icon, setIcon] = useState("light");

  useEffect(() => {
    if (theme === "dark") {
      setIcon("dark");
    } else {
      setIcon("light");
    }
  }, [theme]);
  return (
    <div>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="text-(--text-color-emphasis) h-10 w-10 flex items-center justify-center rounded-md cursor-pointer transition"
        title={theme === "dark" ? "Light Theme" : "Dark Theme"}
      >
        {icon === "dark" ? (
          <FiSun className="h-5 w-5" />
        ) : (
          <FiMoon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
