export default function HeadingLine({
  title,
  className = "text-md font-medium text-(--text-color-emphasis)",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div>
      <div className={`flex items-center gap-2 mb-4 ${className}`}>
        <div className={`w-1 h-4 rounded-full bg-(--main)`} />
        <h3 className="">{title}</h3>
      </div>
    </div>
  );
}
