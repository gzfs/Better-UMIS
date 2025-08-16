import type { UmisTokensRecord } from "@/lib/xata.codegen";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type UMISCredentials, umisAuthService } from "../lib/umisAuth";
import { deleteToken as deleteXataToken, storeUMISToken } from "../lib/xata";

interface JWTPayload {
	sub: string; // User ID
	jti: string; // JWT ID
	iat: number; // Issued at
	exp: number; // Expiry time
	nbf: number; // Not before
	"user.id": string;
	"user.username": string;
	"user.email": string;
	"user.fullname": string;
	"user.roleid": string;
	"user.rolename": string;
	"user.mobileno": string;
	"user.timezone": string;
	"user.instituteid": string;
	"user.universityname": string;
}

export function isTokenExpired(token: string): boolean {
	try {
		const decoded = jwtDecode<JWTPayload>(token);
		const expiresAt = new Date(decoded.exp * 1000);
		return expiresAt <= new Date();
	} catch (error) {
		console.warn("Failed to decode token:", error);
		// If we can't decode the token, consider it expired
		return true;
	}
}

function getTokenExpiry(token: string): Date {
	try {
		const decoded = jwtDecode<JWTPayload>(token);
		return new Date(decoded.exp * 1000);
	} catch (error) {
		console.warn("Failed to decode token:", error);
		// Fallback to 24h from now
		const fallback = new Date();
		fallback.setHours(fallback.getHours() + 24);
		return fallback;
	}
}

interface TokenState {
	// State
	tokens: UmisTokensRecord[];
	currentToken: UmisTokensRecord | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	generateToken: (credentials: UMISCredentials) => Promise<UmisTokensRecord>;
	removeToken: (tokenId: string) => Promise<void>;
	setActiveToken: (tokenId: string) => void;
	refreshToken: (tokenId: string) => Promise<void>;
	clearError: () => void;
	cleanup: () => Promise<void>;
	setTokens: (tokens: UmisTokensRecord[]) => void;

	// Computed
	getActiveTokens: () => UmisTokensRecord[];
	getExpiredTokens: () => UmisTokensRecord[];
}

// Predefined credentials (you can modify these)
const PREDEFINED_CREDENTIALS: UMISCredentials[] = [
	{ username: "madhansnu", password: "Snuc@2024" },
	{ username: "kalaimanisnu", password: "Snuc@2024" },
	{ username: "beulahsnu", password: "Snuc@2024" },
	{ username: "sharmiladevisnu", password: "Snuc@2024" },
];

export const useTokenStore = create<TokenState>()(
	persist(
		(set, get) => ({
			// Initial state
			tokens: [],
			currentToken: null,
			isLoading: false,
			error: null,

			// Actions
			generateToken: async (credentials: UMISCredentials) => {
				try {
					set({ isLoading: true, error: null });

					// Import UMIS service dynamically to avoid circular dependencies
					const { umisAuthService } = await import("../lib/umisAuth");
					const response = await umisAuthService.login(credentials);

					console.log("UMIS response:", response);

					// Store token in Xata first
					console.log("Storing token in Xata...");
					const xataToken = await storeUMISToken(
						credentials.username,
						response.token,
					);
					console.log("Xata token stored:", xataToken);

					const newToken = xataToken;
					console.log(newToken, "newToken");

					// Store token in localStorage
					umisAuthService.setToken(response.token);

					// Update state
					set((state) => ({
						tokens: [
							...state.tokens.filter(
								(t) => t.username !== credentials.username,
							),
							newToken,
						],
						currentToken: newToken,
						isLoading: false,
					}));
					return newToken;
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : "Token generation failed";
					set({
						isLoading: false,
						error: errorMessage,
					});
					throw error;
				}
			},

			removeToken: async (tokenId: string) => {
				try {
					set({ isLoading: true, error: null });
					console.log("Removing token from local state:", tokenId);

					const token = get().tokens.find((t) => t.xata_id === tokenId);
					console.log("Found token:", token);

					if (!token) {
						throw new Error(`Token not found in state: ${tokenId}`);
					}

					// Only clear localStorage and update current token if it's the current token
					if (get().currentToken?.xata_id === tokenId) {
						console.log("Removing current token from localStorage");
						const { umisAuthService } = await import("../lib/umisAuth");
						umisAuthService.removeToken();
						set({ currentToken: null });
					}

					// Note: We don't call UMIS logout API or delete from Xata
					// The token stays active for other users

					set({ isLoading: false });
					console.log("Token removed from local state only");
				} catch (error) {
					console.error("Failed to remove token from state:", error);
					const errorMessage =
						error instanceof Error
							? error.message
							: "Failed to remove token from state";
					set({
						isLoading: false,
						error: errorMessage,
					});
					throw error;
				}
			},

			setActiveToken: (tokenId: string) => {
				try {
					console.log(tokenId, "tokenId");
					set({ isLoading: true, error: null });
					const token = get().tokens.find((t) => t.xata_id === tokenId);
					console.log("Current tokens:", get().tokens);
					console.log("Looking for token:", tokenId);
					console.log("Found token:", token);

					if (!token) {
						throw new Error(`Token not found: ${tokenId}`);
					}
					if (isTokenExpired(token.token)) {
						throw new Error("Token has expired. Please refresh the token.");
					}

					// Set token in localStorage and update state
					umisAuthService.setToken(token.token);
					set({ currentToken: token, error: null, isLoading: false });
					console.log("Token activated:", token.username);
				} catch (error) {
					console.error("Failed to set active token:", error);
					const errorMessage =
						error instanceof Error
							? error.message
							: "Failed to set active token";
					set({
						isLoading: false,
						error: errorMessage,
						currentToken: null,
					});
					throw error;
				}
			},

			refreshToken: async (tokenId: string) => {
				try {
					set({ isLoading: true, error: null });
					const token = get().tokens.find((t) => t.xata_id === tokenId);
					if (!token) {
						throw new Error(`Token not found: ${tokenId}`);
					}

					const credentials = PREDEFINED_CREDENTIALS.find(
						(c) => c.username === token.username,
					);
					if (!credentials) {
						throw new Error("Credentials not found for refresh");
					}

					// First mark the token as inactive
					set((state) => ({
						tokens: state.tokens.map((t) =>
							t.xata_id === tokenId ? { ...t, is_active: false } : t,
						),
						currentToken:
							state.currentToken?.xata_id === tokenId
								? null
								: state.currentToken,
					}));

					// Delete old token from Xata
					await deleteXataToken(tokenId);

					// Generate new token
					await get().generateToken(credentials);
					set({ isLoading: false });
				} catch (error) {
					console.error("Failed to refresh token:", error);
					const errorMessage =
						error instanceof Error ? error.message : "Failed to refresh token";
					set({
						isLoading: false,
						error: errorMessage,
					});
					throw error;
				}
			},

			clearError: () => {
				set({ error: null });
			},

			cleanup: async () => {
				try {
					set({ isLoading: true, error: null });
					console.log("Cleaning up local token state");

					// Clear localStorage
					const { umisAuthService } = await import("../lib/umisAuth");
					umisAuthService.removeToken();

					// Only clear current token, keep tokens list for future use
					set({ currentToken: null, isLoading: false });
					console.log("Local token state cleaned up");
				} catch (error) {
					console.error("Failed to cleanup token state:", error);
					const errorMessage =
						error instanceof Error
							? error.message
							: "Failed to cleanup token state";
					set({
						isLoading: false,
						error: errorMessage,
					});
					throw error;
				}
			},

			// Computed getters
			getActiveTokens: () => {
				return get().tokens.filter(
					(token) => !isTokenExpired(token.token) && token.is_active,
				);
			},

			getExpiredTokens: () => {
				return get().tokens.filter(
					(token) => isTokenExpired(token.token) || !token.is_active,
				);
			},

			setTokens: (tokens: UmisTokensRecord[]) => {
				console.log("Setting tokens in store:", tokens);
				set({ tokens });
			},
		}),
		{
			name: "token-storage",
			partialize: (state) => ({
				tokens: state.tokens,
				currentToken: state.currentToken,
			}),
		},
	),
);

// Auto-refresh tokens that are about to expire (within 1 hour)
export const setupTokenAutoRefresh = () => {
	setInterval(
		() => {
			const store = useTokenStore.getState();
			const now = new Date();
			const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

			for (const token of store.tokens) {
				if (!token.is_active) continue;

				const expiresAt = getTokenExpiry(token.token);
				if (expiresAt <= oneHourFromNow && expiresAt > now) {
					console.log(
						`Auto-refreshing token for ${token.username} (expires at ${expiresAt.toLocaleString()})`,
					);
					store.refreshToken(token.xata_id).catch(console.error);
				}
			}
		},
		30 * 60 * 1000,
	); // Check every 30 minutes
};
