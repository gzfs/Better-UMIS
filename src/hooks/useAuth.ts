import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
	const { user, token, isAuthenticated, isLoading, error } = useAuthStore();

	return {
		user,
		token,
		isAuthenticated,
		isLoading,
		error,
	};
};

export const useLogin = () => {
	const { login, isLoading } = useAuthStore();

	return {
		mutateAsync: login,
		isPending: isLoading,
	};
};

export const useLogout = () => {
	const { logout } = useAuthStore();

	return {
		mutate: logout,
	};
};
