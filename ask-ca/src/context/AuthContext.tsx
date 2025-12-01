"use client";

import { API } from "@/services/api";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";

type User = {
	_id: string;
	name: string;
	username: string;
	email: string;
	followedCategories: string[];
	followedQuestions: string[];
	isGoogleLogin?: string[];
	avatar: string[];
} | null;

type AuthContextType = {
	authUser: User;
	setAuthUser: (user: User) => void;
	authLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [authUser, setAuthUser] = useState<User>(null);
	const [authLoading, setAuthLoading] = useState(true);

	useEffect(() => {
		const fetchAuthUser = async () => {
			try {
				const res = await API.get("/profile");
				setAuthUser(res.data?.data || null);
			} catch (err) {
				console.error("Error fetching user:", err);
				setAuthUser(null);
			} finally {
				setAuthLoading(false);
			}
		};

		fetchAuthUser();
	}, []);

	return (
		<AuthContext.Provider value={{ authUser, setAuthUser, authLoading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
