import "react-phone-input-2/lib/style.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "react-advanced-cropper/dist/style.css";
import "react-loading-skeleton/dist/skeleton.css";
import "react-datepicker/dist/react-datepicker.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./layout/DashboardLayout";
import AuthLayout from "./layout/AuthLayout";
import ProtectedRoutes from "./contexts/ProtectedRoute";
import { Toaster } from "react-hot-toast";

import {
	AuthNavigations,
	NonLayoutNavigations,
	NonSidebarNavigations,
	PublicNavigations,
	SidbarNavigations,
} from "./common/RouteData";

import { useCallback, useEffect, useState } from "react";
import { API } from "./contexts/API";
import { RoleProps, UserProps } from "./types/types";
import { getErrorResponse } from "./contexts/Callbacks";
import NotFoundPage from "./pages/error/NotFound";
import AccessDenied from "./pages/error/AccessDenied";
import ComingSoon from "./pages/error/CommingSoon";
import PermissionContext from "./contexts/PermissionContext";
import MainLoader from "./ui/loadings/pages/MainLoader";

function App() {
	const [authUser, setAuthUser] = useState<UserProps | null>(null);
	const [authLoading, setAuthLoading] = useState(true);
	const [loadingRoles, setLoadingRoles] = useState(true);
	const [loadingPermissions, setLoadingPermissions] = useState(true);

	const [allPermissions, setAllPermissions] = useState<any[]>([]);
	const [roles, setRoles] = useState<RoleProps[]>([]);

	const getRoles = useCallback(async () => {
		try {
			const response = await API.get(`/profile/role`);
			setRoles(response.data);
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoadingRoles(false);
		}
	}, []);

	const getPermissions = useCallback(async () => {
		try {
			const response = await API.get("/profile/permission");
			setAllPermissions(response.data || []);
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoadingPermissions(false);
		}
	}, []);

	const findPermissionInDocs = useCallback(
		(id: string) => {
			if (!Array.isArray(allPermissions)) return null;
			for (const doc of allPermissions) {
				const found = doc.permissions?.find(
					(perm: { _id: string }) => perm._id === id,
				);
				if (found) {
					return found.title;
				}
			}
			return null;
		},
		[allPermissions],
	);

	useEffect(() => {
		getPermissions();
	}, [getPermissions]);

	useEffect(() => {
		getRoles();
	}, [getRoles]);

	const getRoleById = useCallback(
		(id: string) => {
			const rol = roles?.find((item) => item._id === id);
			return rol?.role;
		},
		[roles],
	);

	const getAuthUser = useCallback(async () => {
		setAuthLoading(true);
		try {
			const response = await API.get(`/profile/detail`);
			const data = response.data;

			const rawPermissions = Array.isArray(data?.permissions)
				? data.permissions
				: [];

			const permissions = rawPermissions.map((item: string) =>
				findPermissionInDocs(item),
			);

			setAuthUser({
				...data,
				permissions,
				role: getRoleById(data?.role),
			});
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setAuthLoading(false);
		}
	}, [findPermissionInDocs, getRoleById]);

	useEffect(() => {
		if (!loadingRoles && !loadingPermissions) {
			getAuthUser();
		}
	}, [loadingRoles, loadingPermissions, getAuthUser]);

	if (authLoading) {
		return <MainLoader />; // or AppLoader
	}

	return (
		<ThemeProvider>
			<BrowserRouter>
				<Toaster position="top-right" />
				<Routes>
					{/* Dashboard Layout */}
					<Route
						path="/dashboard"
						element={
							<DashboardLayout
								authUser={authUser}
								authLoading={authLoading}
								getRoleById={getRoleById}
								roles={roles}
							/>
						}
					>
						{SidbarNavigations.map((page, index) => (
							<Route
								path={page.href}
								element={
									<ProtectedRoutes
										authUser={authUser}
										authLoading={authLoading}
									>
										<PermissionContext
											authUser={authUser}
											authLoading={authLoading}
											permission={page.Permission}
										>
											<page.component />
										</PermissionContext>
									</ProtectedRoutes>
								}
								key={index}
							/>
						))}
						{NonSidebarNavigations.map((page, index) => (
							<Route
								path={page.href}
								element={
									<ProtectedRoutes
										authUser={authUser}
										authLoading={authLoading}
									>
										<PermissionContext
											authUser={authUser}
											authLoading={authLoading}
											permission={page.Permission}
										>
											<page.component />
										</PermissionContext>
									</ProtectedRoutes>
								}
								key={index}
							/>
						))}
						<Route path="/dashboard/access-denied" element={<AccessDenied />} />
						<Route path="/dashboard/comming-soon" element={<ComingSoon />} />
					</Route>

					{/* Auth Layout */}
					<Route path="/" element={<AuthLayout authUser={authUser} />}>
						{AuthNavigations.map((page, index) => (
							<Route
								path={page.href}
								element={<page.component />}
								key={index}
							/>
						))}
						{PublicNavigations.map((page, index) => (
							<Route
								path={page.href}
								element={<page.component />}
								key={index}
							/>
						))}
					</Route>

					{/* Non Layout Routes */}
					{NonLayoutNavigations.map((page, index) => (
						<Route
							path={page.href}
							element={
								<ProtectedRoutes authUser={authUser} authLoading={authLoading}>
									<page.component />
								</ProtectedRoutes>
							}
							key={index}
						/>
					))}

					{/* 404 */}
					<Route path="/not-found" element={<NotFoundPage />} />
					<Route path="*" element={<Navigate to="/not-found" />} />
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
