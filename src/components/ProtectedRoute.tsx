import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuthStore();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/login" });
		}
	}, [isAuthenticated, navigate]);

	if (!isAuthenticated) {
		return null; // or a loading spinner
	}

	return <>{children}</>;
};
