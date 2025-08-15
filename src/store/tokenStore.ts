import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
	type UMISCredentials,
	type UMISUser,
	umisAuthService,
} from "../lib/umisAuth";

export interface TokenInfo {
	id: string;
	username: string;
	token: string;
	user: UMISUser;
	createdAt: string;
	expiresAt: string;
	isActive: boolean;
}

interface TokenState {
	// State
	tokens: TokenInfo[];
	currentToken: TokenInfo | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	generateToken: (credentials: UMISCredentials) => Promise<void>;
	removeToken: (tokenId: string) => void;
	setActiveToken: (tokenId: string) => void;
	refreshToken: (tokenId: string) => Promise<void>;
	clearError: () => void;

	// Computed
	getActiveTokens: () => TokenInfo[];
	getExpiredTokens: () => TokenInfo[];
}

// Predefined credentials (you can modify these)
const PREDEFINED_CREDENTIALS: UMISCredentials[] = [
	{ username: "sharmiladevisnu", password: "Snuc@2024" },
	// Add your other 3 credentials here
	// { username: 'user2', password: 'password2' },
	// { username: 'user3', password: 'password3' },
	// { username: 'user4', password: 'password4' },
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

					console.log("response", response);

					const newToken: TokenInfo = {
						id: `${credentials.username}-${Date.now()}`,
						username: credentials.username,
						token: response.token,
						user: response.user,
						createdAt: new Date().toISOString(),
						expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
						isActive: true,
					};

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
				const token = get().tokens.find((t) => t.id === tokenId);
				if (!token) return;

				try {
					// Call UMIS logout API before removing the token
					const { umisAuthService } = await import("../lib/umisAuth");
					await umisAuthService.logout(token.token);
				} catch (error) {
					console.error("Failed to logout from UMIS:", error);
				}

				set((state) => {
					const newTokens = state.tokens.filter((t) => t.id !== tokenId);
					const newCurrentToken =
						state.currentToken?.id === tokenId ? null : state.currentToken;

					// If removing current token, clear localStorage
					if (state.currentToken?.id === tokenId) {
						// Import UMIS service dynamically to avoid circular dependencies
						import("../lib/umisAuth").then(({ umisAuthService }) => {
							umisAuthService.removeToken();
						});
					}

					return {
						tokens: newTokens,
						currentToken: newCurrentToken,
					};
				});
			},

			setActiveToken: (tokenId: string) => {
				const token = get().tokens.find((t) => t.id === tokenId);
				if (token) {
					umisAuthService.setToken(token.token);
					set({ currentToken: token });
				}
			},

			refreshToken: async (tokenId: string) => {
				const token = get().tokens.find((t) => t.id === tokenId);
				if (!token) return;

				const credentials = PREDEFINED_CREDENTIALS.find(
					(c) => c.username === token.username,
				);
				if (!credentials) {
					throw new Error("Credentials not found for refresh");
				}

				// Import UMIS service dynamically to avoid circular dependencies
				const { umisAuthService } = await import("../lib/umisAuth");
				await get().generateToken(credentials);
			},

			clearError: () => {
				set({ error: null });
			},

			// Computed getters
			getActiveTokens: () => {
				const now = new Date();
				return get().tokens.filter((token) => {
					const expiresAt = new Date(token.expiresAt);
					return expiresAt > now && token.isActive;
				});
			},

			getExpiredTokens: () => {
				const now = new Date();
				return get().tokens.filter((token) => {
					const expiresAt = new Date(token.expiresAt);
					return expiresAt <= now;
				});
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
				const expiresAt = new Date(token.expiresAt);
				if (expiresAt <= oneHourFromNow && expiresAt > now) {
					console.log(`Auto-refreshing token for ${token.username}`);
					store.refreshToken(token.id).catch(console.error);
				}
			}
		},
		30 * 60 * 1000,
	); // Check every 30 minutes
};
