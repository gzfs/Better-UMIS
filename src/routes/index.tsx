import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import logo from "../logo.svg";
import { useAuthStore } from "../store/authStore";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuthStore();

	useEffect(() => {
		if (isAuthenticated) {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, navigate]);

	return (
		<div className="text-center">
			<header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
				<img
					src={logo}
					className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
					alt="logo"
				/>
				<p>
					Edit <code>src/routes/index.tsx</code> and save to reload.
				</p>
				<a
					className="text-[#61dafb] hover:underline"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn React
				</a>
				<a
					className="text-[#61dafb] hover:underline"
					href="https://tanstack.com"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn TanStack
				</a>
				<div className="mt-8">
					<Link to="/login">
						<Button className="bg-blue-600 hover:bg-blue-700">
							Go to Login
						</Button>
					</Link>
				</div>
			</header>
		</div>
	);
}
