import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../store/authStore";
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

interface LoginFormData {
	username: string;
	password: string;
}

export const LoginForm = () => {
	const navigate = useNavigate();
	const { login, isLoading, error, clearError } = useAuthStore();

	const form = useForm({
		defaultValues: {
			username: "",
			password: "",
		} as LoginFormData,
		onSubmit: async ({ value }) => {
			try {
				clearError();
				await login(value);
				// Redirect to dashboard on successful login
				navigate({ to: "/dashboard" });
			} catch (error) {
				// Error is already handled by the store
				console.error("Login failed:", error);
			}
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Sign in to UMIS
					</CardTitle>
					<CardDescription className="text-center">
						Enter your credentials to access your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<form.Field
							name="username"
							validators={{
								onChange: ({ value }) => {
									if (!value) return "Username is required";
									if (value.length < 3)
										return "Username must be at least 3 characters";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Username</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Enter your username"
										type="text"
										autoComplete="username"
										className={
											field.state.meta.errors.length > 0 ? "border-red-500" : ""
										}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-red-500">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field
							name="password"
							validators={{
								onChange: ({ value }) => {
									if (!value) return "Password is required";
									if (value.length < 6)
										return "Password must be at least 6 characters";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Password</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Enter your password"
										type="password"
										autoComplete="current-password"
										className={
											field.state.meta.errors.length > 0 ? "border-red-500" : ""
										}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-red-500">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>

						{error && (
							<div className="rounded-md bg-red-50 p-4">
								<p className="text-sm text-red-800">{error}</p>
							</div>
						)}

						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									className="w-full"
									disabled={!canSubmit || isSubmitting || isLoading}
								>
									{isSubmitting || isLoading ? "Signing in..." : "Sign in"}
								</Button>
							)}
						</form.Subscribe>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
