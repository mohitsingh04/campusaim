import { Outlet, useLocation, useNavigate } from "react-router";
import GoogleLoginButton from "../pages/auth/GoogleLoginButton";
import MainLoader from "../ui/loadings/pages/MainLoader";
import { UserProps } from "../types/types";
import { useEffect } from "react";
import { PublicNavigations } from "../common/RouteData";

export default function AuthLayout({
	authUser,
	authLoading,
}: {
	authLoading: boolean;
	authUser: UserProps | null;
}) {
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const isPublicRoute = PublicNavigations.some(
			(route) =>
				route.href === location.pathname ||
				location.pathname.startsWith(route.href.split("/:")[0])
		);

		if (!authLoading && authUser && !isPublicRoute) {
			navigate("/dashboard");
		}
	}, [authLoading, authUser, navigate, location]);

	// if (authLoading) return <MainLoader />;

	return (
		<>
			<div className="h-screen flex overflow-hidden">
				<div className="hidden md:flex w-[60%] bg-gradient-to-br from-slate-50 to-blue-50 flex-col items-center justify-center px-8 py-6 relative overflow-hidden">
					<div className="absolute top-16 left-16 w-4 h-4 bg-blue-200 rounded-full opacity-60"></div>
					<div className="absolute top-32 right-24 w-6 h-6 bg-blue-200 rounded-full opacity-40"></div>
					<div className="absolute bottom-24 left-12 w-3 h-3 bg-blue-300 rounded-full opacity-50"></div>
					{/* <div className="relative mb-8 w-72 h-72 flex-shrink-0">
						<img
							src="/img/auth-hero.png"
							alt="Yoga Illustration"
							className="object-cover w-full h-full rounded-lg"
						/>
					</div> */}
					<div className="text-center max-w-xl px-4 flex-shrink-0">
						<h1 className="text-4xl font-bold text-slate-800 mb-4 leading-tight">
							Welcome to Campusaim
						</h1>
						<p className="text-slate-600 text-lg mb-8 leading-relaxed">
							Discover verified colleges and universities, explore accredited
							courses, and make informed academic decisions with trusted
							admission insights—tailored to your goals.
						</p>
						<button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl">
							Learn More
						</button>
					</div>

					<div className="absolute bottom-6 flex space-x-3">
						<div className="w-10 h-1.5 bg-blue-500 rounded-full"></div>
						<div className="w-10 h-1.5 bg-blue-500 rounded-full"></div>
						<div className="w-10 h-1.5 bg-blue-500 rounded-full"></div>
					</div>
				</div>

				<div className="w-full md:w-[40%] h-screen bg-slate-900 flex flex-col items-center justify-center px-6 py-8 relative overflow-y-auto scrollbar-hide">
					<div>
						<img
							src="/img/logo/campusaim-logo.png"
							alt="Campusaim Logo"
							className="h-10 w-auto object-contain"
						/>
					</div>

					<div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-auto w-full mt-10">
						<Outlet />
						<div className="text-center text-xs text-gray-400 mt-4">
							Or continue with
						</div>

						<div className="flex justify-center space-x-3 mt-3">
							<GoogleLoginButton />
						</div>
					</div>

					<div className="mt-6 text-center mb-6">
						<p className="text-blue-300 text-xs mb-4">
							New to Campusaim?{" "}
							<button className="text-blue-400 hover:text-blue-300 font-medium underline">
								Join Us Today
							</button>
						</p>
						<div className="text-blue-300 text-xs space-x-2">
							<button className="hover:text-blue-200">Privacy Policy</button>
							<span>|</span>
							<button className="hover:text-blue-200">Terms of Use</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
