export default function HeadingLine({
    title,
    className = "text-md font-medium text-(--yp-text-primary)",
}) {
    return (
        <div>
            <div className={`flex items-center gap-2 mb-4 ${className}`}>
                <div className={`w-1 h-4 rounded-full bg-(--yp-main)`} />
                <h3 className="">{title}</h3>
            </div>
        </div>
    );
}
