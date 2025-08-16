import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTokenStore } from "../store/tokenStore";

interface UMISProtectedRouteProps {
	children: React.ReactNode;
	requiredToken?: string; // Optional: specific token ID required
}

export const UMISProtectedRoute = ({
	children,
	requiredToken,
}: UMISProtectedRouteProps) => {
	const navigate = useNavigate();
	const { currentToken, tokens } = useTokenStore();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check if we have any active UMIS tokens
		const hasActiveTokens = tokens.length > 0;

		if (!hasActiveTokens) {
			// Redirect to dashboard if no UMIS tokens exist
			navigate({ to: "/dashboard" });
			return;
		}

		if (requiredToken) {
			// Check if the specific required token exists and is active
			const token = tokens.find((t) => t.xata_id === requiredToken);
			if (!token || !token.is_active) {
				navigate({ to: "/dashboard" });
				return;
			}
		} else if (!currentToken) {
			// If no specific token required, ensure we have a current token
			navigate({ to: "/dashboard" });
			return;
		}

		setIsLoading(false);
	}, [currentToken, tokens, requiredToken, navigate]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
					<p className="mt-4 text-gray-600">Verifying UMIS access...</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
};
