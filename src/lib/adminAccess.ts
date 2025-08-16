const ADMIN_EMAILS = [
	"priyadharshini22110101@snuchennai.edu.in",
	"joshuabharathi22110022@snuchennai.edu.in",
	"aditya22110133@snuchennai.edu.in",
] as const;

export type AdminEmail = (typeof ADMIN_EMAILS)[number];

export function isAdminEmail(email: string): email is AdminEmail {
	console.log("Checking admin access for:", email);
	console.log("Admin emails:", ADMIN_EMAILS);
	const isAdmin = ADMIN_EMAILS.includes(email as AdminEmail);
	console.log("Is admin?", isAdmin);
	return isAdmin;
}

export function getAdminEmails() {
	return [...ADMIN_EMAILS];
}
