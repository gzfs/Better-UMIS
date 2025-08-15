import { useState } from "react";
import { useTokenStore } from "../store/tokenStore";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// Predefined credentials for SNU users
const PREDEFINED_CREDENTIALS = [
	{
		id: "1",
		username: "madhansnu",
		password: "Snuc@2024",
		label: "Madhan SNU",
	},
	{
		id: "2",
		username: "kalaimanisnu",
		password: "Snuc@2024",
		label: "Kalaimani SNU",
	},
	{
		id: "3",
		username: "beulahsnu",
		password: "Snuc@2024",
		label: "Beulah SNU",
	},
	{
		id: "4",
		username: "sharmiladevisnu",
		password: "Snuc@2024",
		label: "Sharmila Devi SNU",
	},
];

export const CredentialsManager = () => {
	const { generateToken, isLoading, error } = useTokenStore();
	const [generatingFor, setGeneratingFor] = useState<string | null>(null);

	const handleGenerateToken = async (credentials: {
		username: string;
		password: string;
	}) => {
		try {
			setGeneratingFor(credentials.username);
			await generateToken(credentials);
		} catch (error) {
			console.error("Failed to generate token:", error);
		} finally {
			setGeneratingFor(null);
		}
	};

	const handleGenerateAllTokens = async () => {
		for (const cred of PREDEFINED_CREDENTIALS) {
			try {
				await handleGenerateToken({
					username: cred.username,
					password: cred.password,
				});
				// Add a small delay between requests to avoid overwhelming the server
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch (error) {
				console.error(`Failed to generate token for ${cred.username}:`, error);
			}
		}
	};

	return (
		<Card className="mt-6">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Generate UMIS Tokens</CardTitle>
						<CardDescription>
							Generate UMIS authentication tokens using your Moodle credentials
						</CardDescription>
					</div>
					<Button
						onClick={handleGenerateAllTokens}
						disabled={isLoading || generatingFor !== null}
						variant="outline"
					>
						{isLoading ? "Generating..." : "Generate All"}
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					{PREDEFINED_CREDENTIALS.map((cred) => (
						<div key={cred.id} className="rounded-lg border p-4 space-y-3">
							<div>
								<h4 className="font-medium">{cred.label}</h4>
								<p className="text-sm text-gray-600">{cred.username}</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor={`username-${cred.id}`}>Username</Label>
								<Input
									id={`username-${cred.id}`}
									value={cred.username}
									disabled
									className="bg-gray-50"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor={`password-${cred.id}`}>Password</Label>
								<Input
									id={`password-${cred.id}`}
									type="password"
									value={cred.password}
									disabled
									className="bg-gray-50"
								/>
							</div>

							<Button
								onClick={() =>
									handleGenerateToken({
										username: cred.username,
										password: cred.password,
									})
								}
								disabled={isLoading || generatingFor === cred.username}
								className="w-full"
								size="sm"
							>
								{generatingFor === cred.username
									? "Generating..."
									: "Generate Token"}
							</Button>
						</div>
					))}
				</div>

				{error && (
					<div className="mt-4 rounded-md bg-red-50 p-4">
						<p className="text-sm text-red-800">{error}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
