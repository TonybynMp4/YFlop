<script setup lang="ts">
	import baseURL from '@/baseUrl';
	import { ref, watch } from 'vue';
	import ProfilePictureComponent from './profile/ProfilePictureComponent.vue';
	import LoadingComponent from './LoadingComponent.vue';
	import { useRouter } from 'vue-router';
	import { Search } from 'lucide-vue-next';

	type fetchedUser = {
		id: number;
		username: string;
		displayname: string;
		profile_picture: string;
	};

	const props = defineProps<{
		searchTerm?: string;
	}>()

	const fetchedUsers = ref<fetchedUser[] | null>(null);
	const isSearching = ref(false);
	const searchTerm = ref<string>(props.searchTerm ?? '');
	const router = useRouter();

	async function searchUsers(term: string) {
		if (!term || term.length < 3) {
			isSearching.value = false;
			return;
		}
		isSearching.value = true;
		fetchedUsers.value = null;

		try {
			const response = await fetch(`${baseURL}/api/user/searchUsers/${term}`, {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
			});

			const { error, users }: { error: string; users: fetchedUser[] } = await response.json();

			if (error) {
				console.error('Error fetching users:', error);
				return;
			}

			fetchedUsers.value = users;
		} finally {
			isSearching.value = false;
		}
	}

	watch(searchTerm, (newSearchTerm) => {
		searchUsers(newSearchTerm.toLowerCase());
	});

	const handleEnter = () => {
		emit('exitSearch');
		router.push(`/search/${searchTerm.value}`);
	};

	const emit = defineEmits(['exitSearch']);
	const handleBlur = () => {
		setTimeout(() => {
			isSearching.value = false;
			fetchedUsers.value = null;
		}, 200);
	};
</script>

<template>
	<div class="search-bar">
		<input
			type="text"
			placeholder="Cherchez.."
			v-model="searchTerm"
			@focus="searchUsers(searchTerm)"
			@blur="handleBlur"
			@keyup.enter="handleEnter"
			@keyup.esc="emit('exitSearch')"
		/>
		<ul v-if="fetchedUsers || isSearching" class="search-results">
			<li v-if="isSearching" class="search-result">
				<LoadingComponent />
			</li>
			<li v-else class="search-result" @click="() => {
				router.push(`/search/${searchTerm}`);
				isSearching = false;
				fetchedUsers = [];
				emit('exitSearch');
			}">
				<Search />Chercher "{{ searchTerm }}"
			</li>
			<li v-for="user in fetchedUsers" :key="user.id">
				<router-link class="search-result" :to="`/profile/${user.username}`">
					<ProfilePictureComponent :src="user.profile_picture" :fallback="user.username" />
					<p>{{ user.displayname }}</p>
				</router-link>
			</li>
		</ul>
	</div>
</template>

<style scoped>
.search-bar {
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
}

.search-results {
	position: absolute;
	display: flex;
	flex-direction: column;
	align-items: unset;
	justify-content: center;
	gap: 0;
	top: 125%;
	width: 90%;
	background-color: #242424;
	border: 1px solid #a5a5a5;
	max-height: 16rem;
	border-radius: 0.25rem;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	z-index: 1;
	overflow-y: auto;
}

.search-result {
	display: flex;
	align-items: center;
	gap: 1rem;
	font-size: 1rem;
	list-style-type: none;
	padding: 0.5rem 1rem;
	border-bottom: 1px solid #a5a5a5;
}

.search-result:hover {
	background-color: #404040;
	cursor: pointer;
}

.search-result img,
.search-result div {
	font-size: 0.75rem;
	width: 1.5rem;
	height: 1.5rem;
	border-radius: 50%;
}

.search-result p {
	margin: 0;
	font-size: 1rem;
}

.search-bar input {
	width: 100%;
	border: 1px solid #a5a5a5;
	border-radius: 0.25rem;
	padding: 0.25rem;
	font-size: small;
	max-height: 8em;
	min-height: 2em;
	resize: vertical;
}
</style>