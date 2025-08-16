import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StudentRegistrationWizard } from "../components/StudentRegistrationWizard";
import { UMISProtectedRoute } from "../components/UMISProtectedRoute";
import { Button } from "../components/ui/button";

const FormsPageContent = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gray-50 p-4">
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<div className="mb-8">
					<Button
						onClick={() => navigate({ to: "/dashboard" })}
						variant="ghost"
						className="mb-4 flex items-center gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Dashboard
					</Button>
					<h1 className="text-3xl font-bold text-gray-900">
						Student Registration
					</h1>
					<p className="text-gray-600">
						Complete your student registration for UMIS services
					</p>
				</div>

				{/* Student Registration Wizard */}
				<StudentRegistrationWizard />
			</div>
		</div>
	);
};

export const FormsPage = () => {
	return (
		<UMISProtectedRoute>
			<FormsPageContent />
		</UMISProtectedRoute>
	);
};

export const Route = createFileRoute("/forms")({
	component: FormsPage,
});
