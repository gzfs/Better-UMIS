import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

interface AdminProtectedRouteProps {
	children: React.ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
	const navigate = useNavigate();
	const { isAuthenticated, isAdmin } = useAuthStore();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/login" });
			return;
		}

		if (!isAdmin) {
			navigate({ to: "/dashboard" });
			return;
		}
	}, [isAuthenticated, isAdmin, navigate]);

	return <>{children}</>;
};
