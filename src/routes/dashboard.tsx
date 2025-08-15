import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { TokenDashboard } from "../components/TokenDashboard";

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	return (
		<ProtectedRoute>
			<TokenDashboard />
		</ProtectedRoute>
	);
}
