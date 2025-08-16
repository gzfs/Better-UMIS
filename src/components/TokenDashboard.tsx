import { Link, useNavigate } from "@tanstack/react-router";
import { jwtDecode } from "jwt-decode";
import {
	CheckCircle,
	Clock,
	LogOut,
	Plus,
	RotateCcw,
	Settings,
	Shield,
	Trash,
	User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getAllActiveTokens } from "../lib/xata";
import type { UmisTokensRecord } from "../lib/xata.codegen";
import { useAuthStore } from "../store/authStore";
import { isTokenExpired } from "../store/tokenStore";
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
	const { logout, isAdmin } = useAuthStore();
	const {
		currentToken,
		isLoading,
		error,
		generateToken,
		removeToken,
		setActiveToken,
		refreshToken,
		clearError,
	} = useTokenStore();
	const [removingToken, setRemovingToken] = useState<string | null>(null);
	const [generatingToken, setGeneratingToken] = useState<string | null>(null);
	const [activeTokens, setActiveTokens] = useState<UmisTokensRecord[]>([]);
	const [expiredTokens, setExpiredTokens] = useState<UmisTokensRecord[]>([]);
	const [isLoadingTokens, setIsLoadingTokens] = useState(false);

	// Set up auto-refresh on component mount
	useEffect(() => {
		setupTokenAutoRefresh();
	}, []);

	// Fetch tokens on mount and after operations
	const fetchTokens = useCallback(async () => {
		try {
			setIsLoadingTokens(true);
			const tokens = await getAllActiveTokens();
			console.log("Fetched tokens from DB:", tokens);

			// Update token store with latest data from DB
			const { setTokens } = useTokenStore.getState();
			setTokens(tokens);
			console.log("Updated token store with DB data");

			// Split tokens into active and expired
			const active = tokens.filter(
				(token) => !isTokenExpired(token.token) && token.is_active,
			);
			const expired = tokens.filter(
				(token) => isTokenExpired(token.token) || !token.is_active,
			);

			console.log("Active tokens:", active);
			console.log("Expired tokens:", expired);

			setActiveTokens(active);
			setExpiredTokens(expired);
		} catch (error) {
			console.error("Failed to fetch tokens:", error);
		} finally {
			setIsLoadingTokens(false);
		}
	}, []);

	useEffect(() => {
		fetchTokens();
	}, [fetchTokens]);

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
			await fetchTokens(); // Refresh token list
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
			await fetchTokens(); // Refresh token list
		} catch (error) {
			console.error("Failed to remove token:", error);
		} finally {
			setRemovingToken(null);
		}
	};

	const formatDate = (date: Date | string | null | undefined) => {
		try {
			if (!date) return "N/A";
			const dateObj = typeof date === "string" ? new Date(date) : date;
			return dateObj.toLocaleString();
		} catch (error) {
			console.error("Invalid date:", date);
			return "Invalid date";
		}
	};

	const getTimeRemaining = (token: string | null | undefined) => {
		try {
			if (!token) return "N/A";

			// Try to decode JWT token
			const decoded = jwtDecode(token);
			if (typeof decoded !== "object" || !("exp" in decoded)) {
				return "Invalid token";
			}

			const now = new Date();
			const expires = new Date((decoded as { exp: number }).exp * 1000); // Convert Unix timestamp to milliseconds
			const diff = expires.getTime() - now.getTime();

			if (diff <= 0) return "Expired";

			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

			return `${hours}h ${minutes}m`;
		} catch (error) {
			console.error("Error decoding token:", error);
			return "Invalid token";
		}
	};

	console.log(activeTokens);

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
							{isAdmin && (
								<Link to="/admin">
									<Button
										size="sm"
										variant="outline"
										className="h-10 w-10 p-0"
										title="Admin Dashboard"
									>
										<Settings className="h-4 w-4" />
									</Button>
								</Link>
							)}

							<Button
								onClick={() => fetchTokens()}
								size="sm"
								variant="outline"
								className="h-10 w-10 p-0"
								title="Refresh Tokens"
								disabled={isLoadingTokens}
							>
								<RotateCcw
									className={`h-4 w-4 ${isLoadingTokens ? "animate-spin" : ""}`}
								/>
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
												Expires in: {getTimeRemaining(currentToken.token)}
											</p>
											<p className="text-xs text-gray-500">
												Token ID: {currentToken.xata_id}
											</p>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											onClick={() => setActiveToken(currentToken.xata_id)}
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
									{isLoadingTokens ? (
										<div
											key="loading-spinner-active"
											className="text-center py-4"
										>
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
											<p className="mt-2 text-sm text-gray-600">
												Loading tokens...
											</p>
										</div>
									) : activeTokens.length === 0 ? (
										<p
											key="no-active-tokens"
											className="text-sm text-gray-500 pl-6"
										>
											No active tokens
										</p>
									) : (
										activeTokens.map((token) => (
											<div
												key={token.xata_id}
												className="rounded-lg border p-3 bg-green-50 border-green-200 flex items-center justify-between"
											>
												<div>
													<p className="font-medium text-sm">
														{token.username}
													</p>
													<p className="text-xs text-gray-600">
														Expires in: {getTimeRemaining(token.token)}
													</p>
													<p className="text-xs text-gray-500">
														Created: {formatDate(token.xata_createdat)}
													</p>
												</div>
												<div className="flex gap-2">
													<Button
														onClick={() => {
															if (token.xata_id) {
																setActiveToken(token.xata_id);
															} else {
																console.error("Token has no id:", token);
															}
														}}
														size="sm"
														variant="outline"
														className="h-8 w-8 p-0"
														title="Use Token"
													>
														<CheckCircle className="h-3 w-3" />
													</Button>
													{isAdmin && (
														<>
															<Button
																onClick={() => refreshToken(token.xata_id)}
																size="sm"
																variant="outline"
																className="h-8 w-8 p-0"
																title="Refresh Token"
															>
																<RotateCcw className="h-3 w-3" />
															</Button>
															<Button
																onClick={() => handleRemoveToken(token.xata_id)}
																size="sm"
																variant="destructive"
																disabled={removingToken === token.xata_id}
																className="h-8 w-8 p-0"
																title="Remove Token"
															>
																<Trash className="h-3 w-3" />
															</Button>
														</>
													)}
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
									{isLoadingTokens ? (
										<div
											key="loading-spinner-expired"
											className="text-center py-4"
										>
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
											<p className="mt-2 text-sm text-gray-600">
												Loading tokens...
											</p>
										</div>
									) : expiredTokens.length === 0 ? (
										<p
											key="no-expired-tokens"
											className="text-sm text-gray-500 pl-6"
										>
											No expired tokens
										</p>
									) : (
										expiredTokens.map((token) => (
											<div
												key={token.xata_id}
												className="rounded-lg border p-3 bg-red-50 border-red-200 flex items-center justify-between"
											>
												<div>
													<p className="font-medium text-sm">
														{token.username}
													</p>
													<p className="text-xs text-gray-600">
														Expired: {formatDate(token.xata_createdat)}
													</p>
												</div>
												<div className="flex gap-2">
													{isAdmin && (
														<>
															<Button
																onClick={() => refreshToken(token.xata_id)}
																size="sm"
																variant="outline"
																className="h-8 w-8 p-0"
																title="Refresh Token"
															>
																<RotateCcw className="h-3 w-3" />
															</Button>
															<Button
																onClick={() => handleRemoveToken(token.xata_id)}
																size="sm"
																variant="destructive"
																disabled={removingToken === token.xata_id}
																className="h-8 w-8 p-0"
																title="Remove Token"
															>
																<Trash className="h-3 w-3" />
															</Button>
														</>
													)}
												</div>
											</div>
										))
									)}
								</div>
							</div>
						</div>

						{/* Credentials Management - Only visible to admins */}
						{isAdmin && (
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
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
