import React from "react";

export default function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <main className="flex-1 sm:p-8 p-3 bg-(--secondary-bg) overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
