import { createFileRoute } from "@tanstack/react-router";
import { UMISProtectedRoute } from "../components/UMISProtectedRoute";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { useTokenStore } from "../store/tokenStore";

export const Route = createFileRoute("/umis-service")({
	component: UMISServicePage,
});

function UMISServicePage() {
	const { currentToken } = useTokenStore();

	return (
		<UMISProtectedRoute>
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900">UMIS Service</h1>
						<p className="text-gray-600">
							Protected route requiring valid UMIS token
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Current Token Information</CardTitle>
							<CardDescription>
								This page is protected by UMIS authentication
							</CardDescription>
						</CardHeader>
						<CardContent>
							{currentToken ? (
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm font-medium text-gray-500">
												Username
											</p>
											<p className="text-sm">{currentToken.username}</p>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-500">
												Token ID
											</p>
											<p className="text-sm font-mono text-xs">
												{currentToken.id}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-500">
												Created
											</p>
											<p className="text-sm">
												{new Date(currentToken.createdAt).toLocaleString()}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-500">
												Expires
											</p>
											<p className="text-sm">
												{new Date(currentToken.expiresAt).toLocaleString()}
											</p>
										</div>
									</div>

									<div className="pt-4 border-t">
										<p className="text-sm text-gray-600">
											This service is accessible because you have a valid UMIS
											token. The token is automatically refreshed when needed.
										</p>
									</div>
								</div>
							) : (
								<p className="text-gray-500">No active token found</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</UMISProtectedRoute>
	);
}
