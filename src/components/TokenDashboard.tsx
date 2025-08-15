import { Link, useNavigate } from "@tanstack/react-router";
import {
	CheckCircle,
	Clock,
	LogOut,
	Plus,
	RotateCcw,
	Shield,
	Trash,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { setupTokenAutoRefresh, useTokenStore } from "../store/tokenStore";

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
	const { logout } = useAuthStore();
	const {
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
	const [generatingToken, setGeneratingToken] = useState<string | null>(null);

	// Set up auto-refresh on component mount
	useEffect(() => {
		setupTokenAutoRefresh();
	}, []);

	const handleLogout = () => {
		logout();
		navigate({ to: "/login" });
	};

	const handleGenerateToken = async (username: string) => {
		try {
			setGeneratingToken(username);
			// Use the predefined credentials based on username
			const credentials = {
				madhansnu: { username: "madhansnu", password: "Snuc@2024" },
				kalaimanisnu: { username: "kalaimanisnu", password: "Snuc@2024" },
				beulahsnu: { username: "beulahsnu", password: "Snuc@2024" },
				sharmiladevisnu: { username: "sharmiladevisnu", password: "Snuc@2024" },
			}[username] || { username, password: "Snuc@2024" };

			await generateToken(credentials);
		} catch (error) {
			console.error("Failed to generate token:", error);
		} finally {
			setGeneratingToken(null);
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
				{/* Header with Avatar and Dropdown */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							UMIS Token Manager
						</h1>
						<p className="text-gray-600">
							Manage UMIS tokens after Moodle authentication
						</p>
					</div>

					<div className="flex items-center gap-4">
						{/* Action Icons */}
						<div className="flex items-center gap-2">
							<Button
								onClick={() => handleGenerateToken("example")}
								disabled={isLoading}
								size="sm"
								variant="outline"
								className="h-10 w-10 p-0"
								title="Generate New Token"
							>
								<Plus className="h-4 w-4" />
							</Button>

							<Button
								onClick={() => window.location.reload()}
								size="sm"
								variant="outline"
								className="h-10 w-10 p-0"
								title="Refresh Page"
							>
								<RotateCcw className="h-4 w-4" />
							</Button>

							<Link to="/umis-service">
								<Button
									size="sm"
									variant="outline"
									className="h-10 w-10 p-0"
									title="Access Service"
								>
									<Shield className="h-4 w-4" />
								</Button>
							</Link>

							<Link to="/forms">
								<Button
									size="sm"
									variant="outline"
									className="h-10 w-10 p-0"
									title="Forms & Registration"
								>
									<User className="h-4 w-4" />
								</Button>
							</Link>
						</div>

						{/* Simple Logout Button */}
						<Button
							onClick={handleLogout}
							variant="outline"
							className="flex items-center gap-2"
						>
							<LogOut className="h-4 w-4" />
							Logout
						</Button>
					</div>
				</div>

				{/* Error Display */}
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

				{/* Main Token Management Card */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							UMIS Token Management
						</CardTitle>
						<CardDescription>
							Generate, manage, and monitor your UMIS authentication tokens
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Current Token Status */}
						{currentToken ? (
							<div className="mb-6 rounded-lg border p-4 bg-blue-50 border-blue-200">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<CheckCircle className="h-5 w-5 text-blue-600" />
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
							<div className="mb-6 text-center py-4 text-gray-500">
								<Shield className="h-8 w-8 mx-auto mb-2 text-gray-400" />
								<p>
									No token currently selected. Select a token from the list
									below.
								</p>
							</div>
						)}

						{/* Token Lists */}
						<div className="space-y-4">
							{/* Active Tokens */}
							<div>
								<h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-600" />
									Active Tokens ({activeTokens.length})
								</h3>
								<div className="space-y-2">
									{activeTokens.length === 0 ? (
										<p className="text-sm text-gray-500 pl-6">
											No active tokens
										</p>
									) : (
										activeTokens.map((token) => (
											<div
												key={token.id}
												className="rounded-lg border p-3 bg-green-50 border-green-200 flex items-center justify-between"
											>
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
														className="h-8 w-8 p-0"
														title="Use Token"
													>
														<CheckCircle className="h-3 w-3" />
													</Button>
													<Button
														onClick={() => refreshToken(token.id)}
														size="sm"
														variant="outline"
														className="h-8 w-8 p-0"
														title="Refresh Token"
													>
														<RotateCcw className="h-3 w-3" />
													</Button>
													<Button
														onClick={() => handleRemoveToken(token.id)}
														size="sm"
														variant="destructive"
														disabled={removingToken === token.id}
														className="h-8 w-8 p-0"
														title="Remove Token"
													>
														<Trash className="h-3 w-3" />
													</Button>
												</div>
											</div>
										))
									)}
								</div>
							</div>

							{/* Expired Tokens */}
							<div>
								<h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
									<Clock className="h-4 w-4 text-red-600" />
									Expired Tokens ({expiredTokens.length})
								</h3>
								<div className="space-y-2">
									{expiredTokens.length === 0 ? (
										<p className="text-sm text-gray-500 pl-6">
											No expired tokens
										</p>
									) : (
										expiredTokens.map((token) => (
											<div
												key={token.id}
												className="rounded-lg border p-3 bg-red-50 border-red-200 flex items-center justify-between"
											>
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
														variant="outline"
														className="h-8 w-8 p-0"
														title="Refresh Token"
													>
														<RotateCcw className="h-3 w-3" />
													</Button>
													<Button
														onClick={() => handleRemoveToken(token.id)}
														size="sm"
														variant="destructive"
														disabled={removingToken === token.id}
														className="h-8 w-8 p-0"
														title="Remove Token"
													>
														<Trash className="h-3 w-3" />
													</Button>
												</div>
											</div>
										))
									)}
								</div>
							</div>
						</div>

						{/* Credentials Management */}
						<div className="mt-6 pt-6 border-t">
							<h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
								<Plus className="h-4 w-4 text-blue-600" />
								Generate UMIS Tokens
							</h3>
							<p className="text-xs text-gray-600 mb-4">
								Generate authentication tokens using predefined credentials
							</p>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
								{[
									{ username: "madhansnu", label: "Madhan SNU" },
									{ username: "kalaimanisnu", label: "Kalaimani SNU" },
									{ username: "beulahsnu", label: "Beulah SNU" },
									{ username: "sharmiladevisnu", label: "Sharmila Devi SNU" },
								].map((cred) => (
									<Button
										key={cred.username}
										onClick={() => handleGenerateToken(cred.username)}
										disabled={generatingToken === cred.username || isLoading}
										variant="outline"
										size="sm"
										className="h-auto p-3 flex flex-col items-center gap-2"
									>
										<User className="h-4 w-4" />
										<div className="text-xs">
											<div className="font-medium">{cred.label}</div>
											<div className="text-gray-500">{cred.username}</div>
										</div>
										{generatingToken === cred.username && (
											<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
										)}
									</Button>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
