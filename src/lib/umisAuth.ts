import forge from "node-forge";

export interface UMISCredentials {
	username: string;
	password: string;
}

export interface UMISUser {
	id: string;
	username: string;
	fullname: string;
}

export interface UMISTokenResponse {
	token: string;
	user: UMISUser;
	expiresAt: string;
}

export interface UMISAuthResponse {
	token: string;
	user: UMISUser;
}

export interface UMISError {
	error: string;
}

// Response interface for the UMIS API
interface UMISAPIResponse {
	token?: string;
	accessToken?: string;
	access_token?: string;
	userId?: string;
	id?: string;
	user_id?: string;
	fullname?: string;
	name?: string;
	full_name?: string;
	message?: string;
	error?: string;
}

// Public key for RSA encryption
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQB4vticl4+Wxvhi39+YL+Ui
vwPHnD+OnzjniUb+U1qeY8VnCvGXjZsZzSq6P3vNPIpnPtlP0xUTeIsOvFzDa8W5
OuV3YIwPChPSA71Ng4+j1BqR8tNTpXNljAyk4HFvhS8TOX/vJ3WletwidzY3SNG1
pYkh1S5rlWHlin42O+uO7k2HG8Sup5hSGz2om3beNVoFHYLchLt+E5YhUGmUj5u1
yB+tpboqGZkWSp+W394BwlJdq6Uoo9GGRUYRfSYgxoHKSjOaEvtmxaEsB7nehOP7
Hj5N7em8bHsLQrtdC4xfkGzJMnR3nCuU80qIH1dcDtK3IfqfSD8wbTUyYlgdKrld
AgMBAAE=
-----END PUBLIC KEY-----`;

function encryptPassword(password: string): string {
	try {
		// Parse the PEM public key
		const publicKey = forge.pki.publicKeyFromPem(PUBLIC_KEY_PEM);

		// Try PKCS1 padding first (most common)
		let encrypted: string;
		try {
			encrypted = publicKey.encrypt(password, "RSAES-PKCS1-V1_5");
		} catch (pkcs1Error) {
			console.log("PKCS1 failed, trying RSA-OAEP...");
			// If PKCS1 fails, try RSA-OAEP
			encrypted = publicKey.encrypt(password, "RSA-OAEP");
		}

		// Convert to base64
		const encryptedBase64 = forge.util.encode64(encrypted);
		return encryptedBase64;
	} catch (error) {
		console.error("Encryption error:", error);
		throw new Error("Failed to encrypt password");
	}
}

export const umisAuthService = {
	login: async (credentials: UMISCredentials): Promise<UMISAuthResponse> => {
		try {
			// Encrypt the password
			const encryptedPassword = encryptPassword(credentials.password);

			// Prepare request payload - exactly matching your working Node.js code
			const payload = {
				username: credentials.username,
				password: encryptedPassword,
				deviceInfo: "104.28.193.166",
				timeZone: "",
				appType: 0,
				isForceLogout: true,
			};

			console.log("Sending payload:", { ...payload, password: "[ENCRYPTED]" });

			// Make API call through Vite proxy
			const response = await fetch("/umis-api/api/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Content-Length": JSON.stringify(payload).length.toString(),
				},
				body: JSON.stringify(payload),
			});

			console.log("Response status:", response.status);
			console.log(
				"Response headers:",
				Object.fromEntries(response.headers.entries()),
			);

			if (!response.ok) {
				let errorMessage = "Authentication failed";
				let responseText = "";

				try {
					responseText = await response.text();
					console.log("Error response text:", responseText);

					// Try to parse as JSON
					const errorData = JSON.parse(responseText);
					errorMessage = errorData.message || errorData.error || errorMessage;
				} catch {
					errorMessage = `HTTP ${response.status}: ${response.statusText}`;
					if (responseText) {
						errorMessage += ` - ${responseText}`;
					}
				}

				throw new Error(errorMessage);
			}

			const responseText = await response.text();
			console.log("Success response text:", responseText);

			let data: UMISAPIResponse;
			try {
				data = JSON.parse(responseText);
			} catch (parseError) {
				console.error("Failed to parse response as JSON:", parseError);
				throw new Error("Invalid response format from server");
			}

			console.log("Parsed response data:", data);

			// Transform response to match our auth interface
			return {
				token: data.token || data.accessToken || data.access_token, // Handle different response formats
				user: {
					id: data.userId || data.id || data.user_id || credentials.username,
					username: credentials.username,
					fullname:
						data.fullname ||
						data.name ||
						data.full_name ||
						credentials.username,
				},
			};
		} catch (error) {
			console.error("UMIS login error:", error);
			throw error;
		}
	},

	// Store token in localStorage
	setToken: (token: string) => {
		localStorage.setItem("umis_auth_token", token);
	},

	getToken: (): string | null => {
		return localStorage.getItem("umis_auth_token");
	},

	removeToken: () => {
		localStorage.removeItem("umis_auth_token");
	},

	// Check if user is authenticated
	isAuthenticated: (): boolean => {
		const token = umisAuthService.getToken();
		return !!token;
	},

	// Logout from UMIS system
	logout: async (token: string): Promise<void> => {
		try {
			const response = await fetch("/umis-api/api/user/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({}), // Empty JSON body as specified
			});

			if (!response.ok) {
				console.warn(
					"Logout API call failed:",
					response.status,
					response.statusText,
				);
			} else {
				console.log("Successfully logged out from UMIS");
			}
		} catch (error) {
			console.error("Error during UMIS logout:", error);
		}
	},
};
