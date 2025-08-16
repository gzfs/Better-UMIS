import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { AdminProtectedRoute } from "../components/AdminProtectedRoute";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { useAuthStore } from "../store/authStore";
import { useTokenStore } from "../store/tokenStore";

export const Route = createFileRoute("/admin")({
	component: AdminPage,
});

function AdminPage() {
	return (
		<AdminProtectedRoute>
			<AdminDashboard />
		</AdminProtectedRoute>
	);
}

function AdminDashboard() {
	const navigate = useNavigate();
	const { storeUMISTokenForUser, deactivateUMISToken } = useAuthStore();
	const { generateToken } = useTokenStore();
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGenerateToken = async (username: string) => {
		try {
			setIsGenerating(true);
			setError(null);

			// Generate new UMIS token
			const credentials = {
				username,
				password: "Snuc@2024",
			};

			const token = await generateToken(credentials);

			// Store in Xata database
			await storeUMISTokenForUser(username, token.token);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to generate token",
			);
			console.error("Token generation error:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleDeactivateToken = async (username: string) => {
		try {
			await deactivateUMISToken(username);
		} catch (error) {
			console.error("Failed to deactivate token:", error);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-4">
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<div className="mb-8">
					<Button
						onClick={() => navigate({ to: "/dashboard" })}
						variant="ghost"
						className="mb-4 flex items-center gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Dashboard
					</Button>
					<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
					<p className="text-gray-600">Manage UMIS tokens and user access</p>
				</div>

				{error && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
						{error}
					</div>
				)}

				{/* Token Management */}
				<Card>
					<CardHeader>
						<CardTitle>Token Management</CardTitle>
						<CardDescription>
							Generate and manage UMIS tokens for users
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[
								{ username: "madhansnu", label: "Madhan SNU" },
								{ username: "kalaimanisnu", label: "Kalaimani SNU" },
								{ username: "beulahsnu", label: "Beulah SNU" },
								{ username: "sharmiladevisnu", label: "Sharmila Devi SNU" },
							].map((user) => (
								<div
									key={user.username}
									className="flex items-center justify-between p-4 bg-white rounded-lg border"
								>
									<div>
										<h3 className="font-medium">{user.label}</h3>
										<p className="text-sm text-gray-500">{user.username}</p>
									</div>
									<div className="flex gap-2">
										<Button
											onClick={() => handleGenerateToken(user.username)}
											disabled={isGenerating}
										>
											{isGenerating ? "Generating..." : "Generate Token"}
										</Button>
										<Button
											variant="outline"
											onClick={() => handleDeactivateToken(user.username)}
										>
											Deactivate Token
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
