import React, { useMemo } from "react";
import { matchPath, Navigate, useLocation } from "react-router-dom";
import {
	SidbarNavigations,
	AuthNavigations,
	PublicNavigations,
	NonSidebarNavigations,
} from "../common/RouteData";
import { UserProps } from "../types/types";
import MainLoader from "../ui/loadings/pages/MainLoader";

interface ProtectedRoutesProps {
	children: React.ReactNode;
	authUser: UserProps | null;
	authLoading: boolean;
}

export default function ProtectedRoutes({
	children,
	authUser,
	authLoading,
}: ProtectedRoutesProps) {
	const location = useLocation();
	const path = location.pathname;

	const memoizedUser = useMemo(() => authUser, [authUser]);

	const isPathMatching = (paths: string[]) =>
		paths.some((route) => matchPath(route, path));

	if (authLoading) return <MainLoader />;

	if (isPathMatching(PublicNavigations.map((r) => r.href))) {
		return children;
	}
	if (!authLoading && authUser?.role === "User") {
		window.location.href = import.meta.env.VITE_MAIN_URL;
		return null;
	}

	const guestRoutes = AuthNavigations.filter((r) => r.guestOnly).map(
		(r) => r.href
	);
	if (memoizedUser && isPathMatching(guestRoutes)) {
		return <Navigate to="/dashboard" />;
	}

	const protectedRoutes = [
		...SidbarNavigations.map((r) => r.href),
		...NonSidebarNavigations.map((r) => r.href),
	];
	if (!memoizedUser && isPathMatching(protectedRoutes)) {
		return <Navigate to="/" />;
	}

	if (memoizedUser?.role) {
		const allowedRoutes = [
			...SidbarNavigations.filter((r) =>
				r.roles.includes(memoizedUser.role)
			).map((r) => r.href),
			...NonSidebarNavigations.filter((r) =>
				r.roles.includes(memoizedUser.role)
			).map((r) => r.href),
		];
		if (!isPathMatching(allowedRoutes) && isPathMatching(protectedRoutes)) {
			return <Navigate to="/dashboard" />;
		}
	}

	return children;
}
