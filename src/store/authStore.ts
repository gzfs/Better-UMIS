import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type LoginCredentials, type User, authService } from "../lib/auth";

interface AuthState {
	// State
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;

	// Actions
	login: (credentials: LoginCredentials) => Promise<void>;
	logout: () => void;
	clearError: () => void;
	setLoading: (loading: boolean) => void;
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

			// Actions
			login: async (credentials: LoginCredentials) => {
				try {
					set({ isLoading: true, error: null });

					const response = await authService.login(credentials);

					// Store token in localStorage via authService
					authService.setToken(response.token);

					// Update Zustand state
					set({
						user: response.user,
						token: response.token,
						isAuthenticated: true,
						isLoading: false,
						error: null,
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
					});
					throw error; // Re-throw for component handling
				}
			},

			logout: () => {
				// Remove token from localStorage
				authService.removeToken();

				// Reset Zustand state
				set({
					user: null,
					token: null,
					isAuthenticated: false,
					isLoading: false,
					error: null,
				});
			},

			clearError: () => {
				set({ error: null });
			},

			setLoading: (loading: boolean) => {
				set({ isLoading: loading });
			},
		}),
		{
			name: "auth-storage", // localStorage key
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);
