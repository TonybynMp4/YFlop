import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import baseURL from '@/baseUrl';
import { useRouter } from 'vue-router';
import type { User } from '@/types/types';

const useAuthStore = defineStore('auth', () => {
	const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
	const router = useRouter();

	function setUser(newUser: User | null) {
		user.value = newUser === null ? null : {
			id: newUser.id,
			username: newUser.username,
			displayname: newUser.displayname,
			email: newUser.email,
			role: newUser.role,
			profilePicture: newUser.profilePicture
		};

		localStorage.setItem('user', JSON.stringify(user.value));
		return user;
	}
	const getUser = computed(() => user.value);

	async function readUser() {
		const user = await fetch(baseURL + '/api/user', {
			credentials: 'include'
		})
		.then((res) => res.json())
		.then((data) => {
			if (data.error) {
				throw new Error(data.error);
			}
			return data
		})
		.catch((error) => {
			console.error(error);
			return null;
		});

		return user;
	}

	async function login(credentials: { email: string, password: string }) {
		try {
			const response = await fetch(baseURL + '/api/user/login', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credentials),
			}).then((res) => res.json());
			const { user: newUser } = response;

			if (!newUser) {
				console.error('Login failed:', response);
				return [false, response.error];
			}

			const user = await readUser();
			if (!user) {
				console.error('User not found after login');
				return [false, "User not found after login"];
			}

			setUser(user);
			router.push('/home');
			return [true, null];
		} catch (error) {
			console.error('Login error:', error);
			return [false, error];
		}
	}

	function logout() {
		setUser(null);
		localStorage.removeItem('user');

		if (getUser.value === null) {
			router.push('/login');
			return true;
		}

		return false;
	}

	return {
		setUser,
		getUser,
		login,
		logout
	};
});

export default useAuthStore;