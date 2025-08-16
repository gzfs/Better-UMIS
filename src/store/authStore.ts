import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isAdminEmail } from "../lib/adminAccess";
import { type LoginCredentials, type User, authService } from "../lib/auth";
import { useTokenStore } from "./tokenStore";

interface AuthState {
	// State
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	isAdmin: boolean;

	// Actions
	login: (credentials: LoginCredentials) => Promise<void>;
	logout: () => Promise<void>;
	clearError: () => void;
	setLoading: (loading: boolean) => void;
	checkAdminStatus: () => boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			// Initial state
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			isAdmin: false,

			// Actions
			login: async (credentials: LoginCredentials) => {
				try {
					set({ isLoading: true, error: null });

					const response = await authService.login(credentials);

					// Store token in localStorage via authService
					authService.setToken(response.token);

					// Check if user is admin
					const isAdmin = isAdminEmail(response.user.email);

					// Update Zustand state
					set({
						user: response.user,
						token: response.token,
						isAuthenticated: true,
						isLoading: false,
						error: null,
						isAdmin,
					});
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : "Login failed";
					set({
						user: null,
						token: null,
						isAuthenticated: false,
						isLoading: false,
						error: errorMessage,
						isAdmin: false,
					});
					throw error; // Re-throw for component handling
				}
			},

			logout: async () => {
				try {
					// Clean up tokens
					const tokenStore = useTokenStore.getState();
					await tokenStore.cleanup();

					// Remove token from localStorage
					authService.removeToken();

					// Reset Zustand state
					set({
						user: null,
						token: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
						isAdmin: false,
					});
				} catch (error) {
					console.error("Error during logout:", error);
					// Still reset state even if cleanup fails
					set({
						user: null,
						token: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
						isAdmin: false,
					});
				}
			},

			clearError: () => {
				set({ error: null });
			},

			setLoading: (loading: boolean) => {
				set({ isLoading: loading });
			},

			checkAdminStatus: () => {
				const { user } = get();
				return user ? isAdminEmail(user.email) : false;
			},
		}),
		{
			name: "auth-storage", // localStorage key
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				isAuthenticated: state.isAuthenticated,
				isAdmin: state.isAdmin,
			}),
		},
	),
);
