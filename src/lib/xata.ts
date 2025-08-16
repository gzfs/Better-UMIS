import type { UmisTokensRecord } from "./xata.codegen";
import { XataClient } from "./xata.codegen";

const xata = new XataClient({
	apiKey: import.meta.env.VITE_XATA_API_KEY,
	databaseURL:
		"https://Vishal-DBS-s-workspace-ojg109.us-east-1.xata.sh/db/UMIS",
	branch: "main", // Specify the branch
	enableBrowser: true, // Enable browser mode
});

export async function storeUMISToken(
	username: string,
	token: string,
): Promise<UmisTokensRecord> {
	try {
		console.log("Creating token record in Xata...");
		console.log("Data:", { username, token });

		// First, deactivate any existing active tokens for this user
		await deactivateToken(username);

		const record = await xata.db.umis_tokens.create({
			username,
			token,
			is_active: true,
		});

		console.log("Token record created:", record);
		return record;
	} catch (error) {
		console.error("Failed to store UMIS token:", error);
		if (error instanceof Error) {
			console.error("Error details:", error.message);
			console.error("Error stack:", error.stack);
		}
		throw error;
	}
}

export async function getAllActiveTokens(): Promise<UmisTokensRecord[]> {
	try {
		console.log("Getting all tokens...");
		const records = await xata.db.umis_tokens
			.sort("xata_createdat", "desc")
			.getMany();

		console.log("All tokens:", records);
		return records;
	} catch (error) {
		console.error("Failed to get tokens:", error);
		if (error instanceof Error) {
			console.error("Error details:", error.message);
			console.error("Error stack:", error.stack);
		}
		throw error;
	}
}

export async function getActiveToken(
	username: string,
): Promise<UmisTokensRecord | null> {
	try {
		console.log("Getting active token for:", username);
		const record = await xata.db.umis_tokens
			.filter({
				username,
				is_active: true,
			})
			.sort("xata_createdat", "desc")
			.getFirst();

		console.log("Active token record:", record);
		return record;
	} catch (error) {
		console.error("Failed to get active token:", error);
		if (error instanceof Error) {
			console.error("Error details:", error.message);
			console.error("Error stack:", error.stack);
		}
		throw error;
	}
}

export async function deactivateToken(username: string): Promise<void> {
	try {
		console.log("Deactivating tokens for:", username);
		const records = await xata.db.umis_tokens
			.filter({
				username,
				is_active: true,
			})
			.getMany();

		console.log("Found tokens to deactivate:", records);

		// Deactivate all active tokens for this user
		for (const record of records) {
			await record.update({
				is_active: false,
			});
		}

		console.log("Tokens deactivated successfully");
	} catch (error) {
		console.error("Failed to deactivate tokens:", error);
		if (error instanceof Error) {
			console.error("Error details:", error.message);
			console.error("Error stack:", error.stack);
		}
		throw error;
	}
}

export async function deleteToken(tokenId: string): Promise<void> {
	try {
		console.log("Deleting token:", tokenId);

		// First try to find the token to make sure it exists
		const records = await xata.db.umis_tokens
			.filter({ xata_id: tokenId })
			.getMany();

		if (records.length === 0) {
			throw new Error(`Token not found: ${tokenId}`);
		}

		// Delete the token directly
		await xata.db.umis_tokens.delete(tokenId);
		console.log("Token deleted successfully");
	} catch (error) {
		console.error("Failed to delete token:", error);
		if (error instanceof Error) {
			console.error("Error details:", error.message);
			console.error("Error stack:", error.stack);
		}
		throw error;
	}
}

// Helper function to check if a token is expired
export function isTokenExpired(token: UmisTokensRecord): boolean {
	const expiresAt = new Date(token.xata_createdat);
	expiresAt.setHours(expiresAt.getHours() + 24); // Token expires 24 hours after creation
	return new Date() > expiresAt;
}

// Helper function to get time remaining until token expiration
export function getTokenTimeRemaining(token: UmisTokensRecord): string {
	const expiresAt = new Date(token.xata_createdat);
	expiresAt.setHours(expiresAt.getHours() + 24); // Token expires 24 hours after creation
	const now = new Date();
	const diff = expiresAt.getTime() - now.getTime();

	if (diff <= 0) return "Expired";

	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

	return `${hours}h ${minutes}m`;
}
