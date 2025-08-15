import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { setupTokenAutoRefresh, useTokenStore } from "../store/tokenStore";
import { CredentialsManager } from "./CredentialsManager";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

export const TokenDashboard = () => {
	const navigate = useNavigate();
	const { user, logout } = useAuthStore();
	const {
		tokens,
		currentToken,
		isLoading,
		error,
		generateToken,
		removeToken,
		setActiveToken,
		refreshToken,
		clearError,
		getActiveTokens,
		getExpiredTokens,
	} = useTokenStore();
	const [removingToken, setRemovingToken] = useState<string | null>(null);

	// Set up auto-refresh on component mount
	useEffect(() => {
		setupTokenAutoRefresh();
	}, []);

	const handleLogout = () => {
		logout();
		navigate({ to: "/login" });
	};

	const handleGenerateToken = async (username: string) => {
		// This would need the actual credentials - for now using a placeholder
		const credentials = { username, password: "placeholder" };
		try {
			await generateToken(credentials);
		} catch (error) {
			console.error("Failed to generate token:", error);
		}
	};

	const handleRemoveToken = async (tokenId: string) => {
		try {
			setRemovingToken(tokenId);
			await removeToken(tokenId);
		} catch (error) {
			console.error("Failed to remove token:", error);
		} finally {
			setRemovingToken(null);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	const getTimeRemaining = (expiresAt: string) => {
		const now = new Date();
		const expires = new Date(expiresAt);
		const diff = expires.getTime() - now.getTime();

		if (diff <= 0) return "Expired";

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

		return `${hours}h ${minutes}m`;
	};

	const activeTokens = getActiveTokens();
	const expiredTokens = getExpiredTokens();

	return (
		<div className="min-h-screen bg-gray-50 p-4">
			<div className="mx-auto max-w-6xl">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							UMIS Token Manager
						</h1>
						<p className="text-gray-600">
							Manage UMIS tokens after Moodle authentication
						</p>
					</div>
					<Button onClick={handleLogout} variant="outline">
						Logout
					</Button>
				</div>

				{/* Info about the authentication flow */}
				<div className="mb-6 rounded-md bg-blue-50 p-4 border border-blue-200">
					<div className="flex items-start space-x-3">
						<div className="flex-shrink-0">
							<svg
								className="h-5 w-5 text-blue-400"
								fill="currentColor"
								viewBox="0 0 20 20"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div>
							<h3 className="text-sm font-medium text-blue-800">
								Authentication Flow
							</h3>
							<p className="text-sm text-blue-700 mt-1">
								You are logged in via Moodle. Use the credentials below to
								generate UMIS tokens for additional services.
							</p>
						</div>
					</div>
				</div>

				{error && (
					<div className="mb-6 rounded-md bg-red-50 p-4">
						<div className="flex items-center justify-between">
							<p className="text-sm text-red-800">{error}</p>
							<Button
								onClick={clearError}
								variant="ghost"
								size="sm"
								className="text-red-600 hover:text-red-800"
							>
								×
							</Button>
						</div>
					</div>
				)}

				{/* Current Token Status */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Current UMIS Token</CardTitle>
						<CardDescription>
							Currently selected token for UMIS operations
						</CardDescription>
					</CardHeader>
					<CardContent>
						{currentToken ? (
							<div className="rounded-lg border p-4 bg-blue-50 border-blue-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium text-sm">
											{currentToken.username}
											<span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												Active
											</span>
										</p>
										<p className="text-xs text-gray-600">
											Expires in: {getTimeRemaining(currentToken.expiresAt)}
										</p>
										<p className="text-xs text-gray-500">
											Token ID: {currentToken.id}
										</p>
									</div>
									<div className="flex gap-2">
										<Button
											onClick={() => setActiveToken(currentToken.id)}
											size="sm"
											variant="outline"
											disabled
										>
											Current
										</Button>
										<Link to="/umis-service">
											<Button size="sm" variant="secondary">
												Access Service
											</Button>
										</Link>
									</div>
								</div>
							</div>
						) : (
							<div className="text-center py-4 text-gray-500">
								No token currently selected. Select a token from the list below.
							</div>
						)}
					</CardContent>
				</Card>

				<div className="grid gap-6 lg:grid-cols-2">
					{/* Active Tokens */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								Active Tokens ({activeTokens.length})
								<Button
									onClick={() => handleGenerateToken("example")}
									disabled={isLoading}
									size="sm"
								>
									{isLoading ? "Generating..." : "Generate New"}
								</Button>
							</CardTitle>
							<CardDescription>
								Valid tokens that can be used for authentication
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{activeTokens.length === 0 ? (
									<p className="text-sm text-gray-500">No active tokens</p>
								) : (
									activeTokens.map((token) => (
										<div
											key={token.id}
											className="rounded-lg border p-3 bg-green-50 border-green-200"
										>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium text-sm">
														{token.username}
													</p>
													<p className="text-xs text-gray-600">
														Expires in: {getTimeRemaining(token.expiresAt)}
													</p>
													<p className="text-xs text-gray-500">
														Created: {formatDate(token.createdAt)}
													</p>
												</div>
												<div className="flex gap-2">
													<Button
														onClick={() => setActiveToken(token.id)}
														size="sm"
														variant="outline"
													>
														Use
													</Button>
													<Button
														onClick={() => refreshToken(token.id)}
														size="sm"
														variant="secondary"
													>
														Refresh
													</Button>
													<Button
														onClick={() => handleRemoveToken(token.id)}
														size="sm"
														variant="destructive"
														disabled={removingToken === token.id}
													>
														{removingToken === token.id
															? "Removing..."
															: "Remove"}
													</Button>
												</div>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>

					{/* Expired Tokens */}
					<Card>
						<CardHeader>
							<CardTitle>Expired Tokens ({expiredTokens.length})</CardTitle>
							<CardDescription>Tokens that are no longer valid</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{expiredTokens.length === 0 ? (
									<p className="text-sm text-gray-500">No expired tokens</p>
								) : (
									expiredTokens.map((token) => (
										<div
											key={token.id}
											className="rounded-lg border p-3 bg-red-50 border-red-200"
										>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium text-sm">
														{token.username}
													</p>
													<p className="text-xs text-gray-600">
														Expired: {formatDate(token.expiresAt)}
													</p>
												</div>
												<div className="flex gap-2">
													<Button
														onClick={() => refreshToken(token.id)}
														size="sm"
														variant="secondary"
													>
														Refresh
													</Button>
													<Button
														onClick={() => handleRemoveToken(token.id)}
														size="sm"
														variant="destructive"
														disabled={removingToken === token.id}
													>
														{removingToken === token.id
															? "Removing..."
															: "Remove"}
													</Button>
												</div>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Current User Info */}
				<Card className="mt-6">
					<CardHeader>
						<CardTitle>Current Session</CardTitle>
						<CardDescription>
							Your current authentication details
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm">
								<span className="font-medium">Name:</span>{" "}
								{user?.fullname || "N/A"}
							</p>
							<p className="text-sm">
								<span className="font-medium">Username:</span>{" "}
								{user?.username || "N/A"}
							</p>
							<p className="text-sm">
								<span className="font-medium">User ID:</span>{" "}
								{user?.id || "N/A"}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Credentials Manager */}
				<CredentialsManager />

				{/* Statistics */}
				<div className="mt-6 grid gap-4 md:grid-cols-3">
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold">{tokens.length}</div>
							<p className="text-xs text-muted-foreground">Total Tokens</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold text-green-600">
								{activeTokens.length}
							</div>
							<p className="text-xs text-muted-foreground">Active Tokens</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold text-red-600">
								{expiredTokens.length}
							</div>
							<p className="text-xs text-muted-foreground">Expired Tokens</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};
