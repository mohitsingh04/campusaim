import { useTheme } from "@/hooks/useTheme";
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

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
          <SunIcon className="h-5 w-5" />
        ) : (
          <MoonIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
