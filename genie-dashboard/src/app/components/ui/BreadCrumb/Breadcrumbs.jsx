import { Link } from "react-router-dom";

export default function Breadcrumbs({
    items = [],
    actions = [], // [{ label, to?, onClick?, Icon, variant }]
}) {
    const variantStyles = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        success: "bg-green-600 hover:bg-green-700 text-white",
        danger: "bg-red-600 hover:bg-red-700 text-white",
        neutral: "bg-gray-600 hover:bg-gray-700 text-white",
    };

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: Title + Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                    Campusaim
                </h1>

                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {items.map((item, index) => {
                        const isActive =
                            item.active === true || index === items.length - 1;

                        return (
                            <li key={index} className="flex items-center gap-2">
                                {!isActive && item.to ? (
                                    <Link
                                        to={item.to}
                                        className="hover:text-blue-600 font-medium whitespace-nowrap"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className="text-gray-700 font-semibold whitespace-nowrap">
                                        {item.label}
                                    </span>
                                )}

                                {!isActive && (
                                    <span className="text-gray-400 select-none">/</span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>

            {/* Right: Actions */}
            {Array.isArray(actions) && actions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions.map((action, idx) => {
                        const Icon = action.Icon;
                        const style =
                            variantStyles[action.variant] || variantStyles.primary;

                        if (action.to) {
                            return (
                                <Link
                                    key={idx}
                                    to={action.to}
                                    className={`inline-flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md w-full sm:w-auto ${style}`}
                                >
                                    {Icon && <Icon className="h-5 w-5 mr-1 shrink-0" />}
                                    <span className="truncate">{action.label}</span>
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={action.onClick}
                                className={`inline-flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md w-full sm:w-auto ${style}`}
                            >
                                {Icon && <Icon className="h-5 w-5 mr-1 shrink-0" />}
                                <span className="truncate">{action.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}