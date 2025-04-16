<script setup lang="ts">
	import { ref, onBeforeMount, useTemplateRef } from "vue";
	import useAuthStore from "@/stores/auth-store";
	import ProfilePicture from "@/components/profile/ProfilePictureComponent.vue";
	import { BookText, GalleryHorizontalEnd, Settings } from "lucide-vue-next";
	import type { UserProfile } from "@/types/types";
	import type { PostComponentProps } from "@/types/components";
	import { useRoute, useRouter } from "vue-router";
	import { fetchUserProfile, fetchUserPosts } from "@/utils/profileUtils";
	import PostGalleryComponent from "@/components/post/PostGalleryComponent.vue";
	import PostComponent from "@/components/post/PostComponent.vue";
	import { handleDeletePost, handleEmitDislikePost, handleEmitEditPost, handleEmitLikePost } from "@/utils/postUtils";
	import { watch } from "vue";
	import baseURL from "@/baseUrl";
	import LoadingComponent from "@/components/LoadingComponent.vue";
	const router = useRouter();
	const Route = useRoute();
	let profileId = Route.params.id as string | null;

	watch(() => Route.params.id, (newId) => {
		profileId = newId as string | null;
		fetchData();
	});

	const authStore = useAuthStore();
	const userData = ref<UserProfile>({} as UserProfile);
	const posts = ref<PostComponentProps[]>([]);
	const isFetching = ref(false);

	async function fetchData() {
		const username = profileId ?? authStore.getUser?.username ?? null;
		isFetching.value = true;
		if (!username) {
			isFetching.value = false;
			return router.push("/notfound");
		}

		userData.value = await fetchUserProfile(username);
		posts.value = await fetchUserPosts(username);
		isFetching.value = false;
	}

	onBeforeMount(fetchData);

	const dialogRef = useTemplateRef<HTMLDialogElement>("dialogRef");
	const openDialog = () => dialogRef.value?.showModal();
	const closeDialog = () => dialogRef.value?.close();

	const currentTab = ref("feed");
	const setTab = (tab: string) => {
		currentTab.value = tab;
	};

	async function editPost(postId: number, newContent: string) {
		const result = await handleEmitEditPost(posts.value, postId, newContent);
		if (result) {
			const postIndex = posts.value.findIndex((post) => post.id === postId);
			if (postIndex !== -1) {
				posts.value[postIndex].content = newContent;
			}
		} else {
			alert('Error editing post. Please try again later.');
		}
	}

	async function followUser() {
		if (!profileId) return;

		if (!authStore.getUser) {
			alert("You must be logged in to follow a user.");
			return;
		}

		if (userData.value.username === authStore.getUser?.username) {
			alert("You cannot follow yourself.");
			return;
		}

		if (userData.value.isFollowing) {
			if (!confirm("Are you sure you want to unfollow this user?")) return;
		}

		const result: {
			followed: boolean;
			unfollowed: boolean;
			error?: string;
		} = await fetch(baseURL+`/api/follower`, {
			method: userData.value.isFollowing ? "DELETE" : "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: userData.value.id,
			}),
		}).then((res) => res.json());
		if (result.error) {
			alert(result.error);
			return;
		}

		if (result.followed) {
			userData.value.isFollowing = true;
			userData.value.followers += 1;
		}
		if (result.unfollowed) {
			userData.value.isFollowing = false;
			userData.value.followers -= 1;
		}
	}

	async function deletePost(postId: number) {
		const result = await handleDeletePost(postId);
		if (result) {
			const postIndex = posts.value.findIndex((post) => post.id === postId);
			if (postIndex !== -1) {
				posts.value.splice(postIndex, 1);
			}

			alert('Post deleted successfully!');
		} else {
			alert('Error deleting post. Please try again later.');
		}
	}
</script>

<template>
	<main>
		<section class="profile-header">
			<ProfilePicture class="profile-picture" :src="userData.profilePicture" :fallback="userData.username" :key="userData.username"/>
			<div class="profile-info">
				<div class="profile-info-top">
					<h2 style="font-size: larger; font-weight: bold;">{{ userData.displayname }}</h2>
					<div class="buttons">
						<button class="follow-btn" :class="{ 'followed': authStore.getUser && userData.isFollowing }"
							v-if="profileId && authStore.getUser?.username !== profileId"
							@click="followUser"
						>
							{{ authStore.getUser && userData.isFollowing ? 'Unfollow' : 'Follow' }}
						</button>
						<button @click="openDialog" v-else>
							<Settings />
						</button>
					</div>
				</div>
				<div class="profile-info-bottom">
					<h2>@{{ userData.username }}</h2>
					<div class="stats">
						<span><strong>{{ posts.length }}</strong> posts</span>
						<span><strong>{{ userData.followers }}</strong> followers</span>
						<span><strong>{{ userData.following }}</strong> following</span>
					</div>
				</div>
				<p class="bio">{{ userData.bio }}</p>
			</div>
		</section>

		<section class="tabs">
			<div class="tab" @click="setTab('feed')" :class="{ active: currentTab === 'feed' }">
				<BookText /> Feed
			</div>
			<div class="tab" @click="setTab('gallery')" :class="{ active: currentTab === 'gallery' }">
				<GalleryHorizontalEnd /> Galerie
			</div>
		</section>
		<PostGalleryComponent
			v-if="currentTab === 'gallery' && posts.length > 0" :posts="posts.filter(post => post.images.length > 0)"
			@likePost="(postId) => handleEmitLikePost(posts, postId)"
			@dislikePost="(postId) => handleEmitDislikePost(posts, postId)"
			@editPost="editPost"
			@deletePost="deletePost"
		/>
		<section v-else-if="currentTab === 'feed' && posts.length > 0" class="feed">
			<PostComponent
				v-for="post in posts"
				:key="post.id"
				@likePost="(postId) => handleEmitLikePost(posts, postId)"
				@dislikePost="(postId) => handleEmitDislikePost(posts, postId)"
				@editPost="(postId, newContent) => handleEmitEditPost(posts, postId, newContent)"
				@deletePost="deletePost"
				:post="post"
			/>
		</section>
		<section v-else-if="isFetching">
			<LoadingComponent>
				Chargement du feed...
			</LoadingComponent>
		</section>
		<section v-else>
			<p>No posts available.</p>
		</section>
	</main>

	<dialog ref="dialogRef" class="settings-dialog">
		<h2>Profile Settings</h2>
		<!--
			settings:
				displayname
				pfp
				bio
		-->
		<button @click="closeDialog">Annuler</button>
		<button @click="">Enregistrer</button>
	</dialog>
</template>

<style scoped>
.feed {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 100%;
}

.tabs {
	display: flex;
	justify-content: center;
	gap: 1rem;
	margin-top: 1rem;
	width: 100%;
	padding: 0.25rem;
	background-color: #202020;
	border-radius: 5px;
}

.tab {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	cursor: pointer;
	padding: 0.5rem;
	width: 50%;
	border-radius: 5px;
}

.tabs .active {
	border: 1px solid #a5a5a5;
}

.profile-info-top {
	display: flex;
	gap: 1rem;
	align-items: center;
	margin-bottom: 0.5rem;
}

main {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	width: 50%;
	margin: 2rem auto;
}

@media (max-width: 1024px) {
	main {
		width: 90%;
	}
}

.profile-header {
	display: flex;
	align-items: center;
	justify-content: center;
	margin: auto;
	gap: 1rem;
}

.profile-picture {
	width: 120px;
	height: 120px;
	border-radius: 50%;
	cursor: pointer;
}

.profile-info {
	text-align: left;
}

.buttons {
	display: flex;
	justify-content: space-between;
	align-items: center;
	justify-content: flex-start;
	gap: 1rem;
}

.follow-btn {
	background-color: #e1306c;
	color: white;
}

.followed {
	background-color: white!important;
	color: black!important;
}

.followed:hover {
	background-color: #e0e0e0!important;
}

.follow-btn:hover {
	background-color: #c6286b;
}

.stats {
	display: flex;
	gap: 1rem;
}

.settings-dialog {
	padding: 20px;
	border-radius: 10px;
	text-align: center;
}
</style>