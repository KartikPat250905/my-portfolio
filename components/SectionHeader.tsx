import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  id?: string;
  className?: string;
};

export default function SectionHeader({ title, subtitle, id, className }: Props) {
  return (
    <div id={id} className={`w-full flex flex-col items-center my-6 ${className ?? ""}`}>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/90 cloud-border text-theme-secondary">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-white/60">{subtitle}</p>}
    </div>
  );
}
