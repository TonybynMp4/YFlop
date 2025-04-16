<script setup lang="ts">
    import { computed, ref } from 'vue';
    import useAuthStore from './stores/auth-store';
	import { HomeIcon, LogInIcon, LogOutIcon, SearchIcon, UserPlus2 } from 'lucide-vue-next';
	import ProfilePictureComponent from './components/profile/ProfilePictureComponent.vue';
	import SearchBarComponent from './components/SearchBarComponent.vue';
	const authStore = useAuthStore();
    const isLoggedIn = computed(() => authStore.getUser !== null);
    const onClickLogout = () => authStore.logout();
	const showSearchBar = ref(false);
	const toggleSearchBar = () => {
		showSearchBar.value = !showSearchBar.value;
	};
</script>

<template>
    <header>
        <h1>
			<router-link to="/" class="header__title">
				<img src="/images/logo.png" alt="Logo" class="logo" />
			</router-link>
        </h1>
        <ul>
            <li v-if="!isLoggedIn">
                <router-link class="action-btn" to="/register"><UserPlus2 /></router-link>
            </li>
            <li v-if="!isLoggedIn">
                <router-link class="action-btn" to="/login"><LogInIcon /></router-link>
            </li>
            <li v-if="isLoggedIn">
                <router-link class="action-btn" to="/home"><HomeIcon /></router-link>
            </li>
			<li v-if="isLoggedIn" class="search-bar_container">
                <SearchIcon class="action-btn" @click="toggleSearchBar" />
                <SearchBarComponent
					v-if="showSearchBar"
					@exitSearch="toggleSearchBar"
				/>
            </li>
            <li v-if="isLoggedIn">
				<router-link class="action-btn" to="/profile">
					<ProfilePictureComponent :src="authStore.getUser?.profilePicture" :fallback="authStore.getUser?.username ?? '?'" :key="authStore.getUser?.profilePicture" />
				</router-link>
			</li>
            <li v-if="isLoggedIn">
                <LogOutIcon class="action-btn" :id="'logout'" :label="'Logout'" @click="onClickLogout" />
            </li>
        </ul>
    </header>
    <router-view></router-view>
    <footer>
        <p>&copy; 2025 YFlop</p>
    </footer>
</template>

<style>
    header {
        width: 100%;
        display: flex;
        padding: 1rem;
        justify-content: space-between;
        align-items: center;
		border-bottom: 1px solid #a5a5a5;
    }

	header h1 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
	}

	header h1 img {
		width: 2rem;
		height: 2rem;
	}

	.header__title {
		text-decoration: none;
		color: inherit;
		font-size: 2rem;
		font-weight: bold;
	}

    header ul {
        display: flex;
		justify-content: center;
		align-items: center;
        gap: 1rem;
        margin: 0;
    }

    header ul li {
        list-style: none;
		height: fit-content;
    }

	.search-bar_container {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		max-width: 40ch;
	}

	footer {
		width: 100%;
		display: flex;
		padding: 1rem;
		justify-content: center;
		align-items: center;
		border-top: 1px solid #a5a5a5;
	}
</style>