export interface LoginCredentials {
	username: string;
	password: string;
}

export interface User {
	id: string;
	username: string;
	fullname: string;
}

export interface AuthResponse {
	token: string;
	user: User;
}

export interface AuthError {
	error: string;
}

const MOODLE_SERVICE = "moodle_mobile_app";

export const authService = {
	login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
		try {
			// Step 1: Get Moodle Token (using Vite proxy)
			const tokenUrl = new URL(
				"/moodle-api/login/token.php",
				window.location.origin,
			);
			tokenUrl.searchParams.append("username", credentials.username);
			tokenUrl.searchParams.append("password", credentials.password);
			tokenUrl.searchParams.append("service", MOODLE_SERVICE);

			const tokenResponse = await fetch(tokenUrl.toString());
			const tokenData = await tokenResponse.json();

			if ("error" in tokenData) {
				throw new Error("Invalid credentials");
			}

			const moodleToken = tokenData.token;

			// Step 2: Get Profile Info (using Vite proxy)
			const profileUrl = new URL(
				"/moodle-api/webservice/rest/server.php",
				window.location.origin,
			);
			profileUrl.searchParams.append("wstoken", moodleToken);
			profileUrl.searchParams.append(
				"wsfunction",
				"core_webservice_get_site_info",
			);
			profileUrl.searchParams.append("moodlewsrestformat", "json");

			const profileResponse = await fetch(profileUrl.toString());
			const profileData = await profileResponse.json();

			// Return the response in the expected format
			return {
				token: moodleToken, // Use the actual Moodle token
				user: {
					id: profileData.userid.toString(),
					username: profileData.username,
					fullname: profileData.fullname,
				},
			};
		} catch (error) {
			console.error("Login error:", error);
			throw new Error(
				error instanceof Error
					? error.message
					: "An error occurred during login",
			);
		}
	},

	// Store token in localStorage (you might want to use a more secure storage method)
	setToken: (token: string) => {
		localStorage.setItem("auth_token", token);
	},

	getToken: (): string | null => {
		return localStorage.getItem("auth_token");
	},

	removeToken: () => {
		localStorage.removeItem("auth_token");
	},

	// Check if user is authenticated
	isAuthenticated: (): boolean => {
		const token = authService.getToken();
		return !!token;
	},
};
