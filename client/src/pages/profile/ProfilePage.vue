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
	import { UploadButton } from "@/uploadthing";
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

	const savedChanges = ref(false);
	const isUploading = ref(false);
	const newProfilePictureURL = ref<string | null>(null);

	const dialogRef = useTemplateRef<HTMLDialogElement>("dialogRef");
	const openDialog = () => dialogRef.value?.showModal();
	const closeDialog = () => {
		dialogRef.value?.close();
		newProfilePictureURL.value = null;
	};

	const submitSettings = (e: Event) => {
		if (!authStore.getUser) return;
		const newDisplayName = (e.target as HTMLFormElement).displayname.value;
		const newBio = (e.target as HTMLFormElement).bio.value;
		const newProfilePicture = newProfilePictureURL.value;
		const newPassword = (e.target as HTMLFormElement).newPassword.value;
		const confirmPassword = (e.target as HTMLFormElement).confirmPassword.value;

		if (isUploading.value) {
			alert("Veuillez attendre que le téléchargement de la photo de profil soit terminé.");
			return;
		}

		if (!confirm("Etes-vous sûr de vouloir enregistrer ces modifications ?")) return;

		if (!newDisplayName) {
			alert("Le nom d'utilisateur ne peut pas être vide.");
			return;
		}

		if (newDisplayName === authStore.getUser.displayname && newBio === userData.value.bio && !newProfilePicture && !newPassword) {
			alert("Aucune modification n'a été apportée.");
			return;
		}

		if (newPassword && newPassword.length > 0 && newPassword !== confirmPassword) {
			alert("Les mots de passe ne correspondent pas.");
			return;
		}

		const requestBody = JSON.stringify({
			displayname: newDisplayName === authStore.getUser.displayname ? null : newDisplayName,
			bio: newBio === userData.value.bio ? null : newBio,
			password: newPassword && newPassword.length > 0 ? newPassword : null,
			profile_picture: newProfilePicture,
		})

		fetch(`${baseURL}/api/user`, {
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: requestBody,
		})
		.then((res) => res.json())
		.then((APIResult: {
				error?: string;
				user: {
					displayname?: string;
					bio?: string;
					profile_picture?: string;
				}
			}) => {
			const { error, user } = APIResult;

			if (error) {
				alert(error);
				return;
			}
			(e.target as HTMLFormElement).reset();
			newProfilePictureURL.value = null;

			const authUser = authStore.getUser;
			if (!authUser) return;
			authStore.setUser({
				...authUser,
				displayname: user.displayname ?? authUser.displayname,
				profilePicture: user.profile_picture ?? authUser.profilePicture,
			});

			userData.value = {
				...userData.value,
				displayname: user.displayname ?? authUser.displayname,
				bio: user.bio ?? userData.value.bio,
				profilePicture: user.profile_picture ?? authUser.profilePicture,
			};

			posts.value = posts.value.map((post) => {
				return {
					...post,
					user: {
						...post.user,
						displayname: user.displayname ?? authUser.displayname,
						profilePicture: user.profile_picture ?? authUser.profilePicture,
					},
				};
			});

			savedChanges.value = true;
			setTimeout(() => {
				savedChanges.value = false;
				closeDialog();
			}, 2000);
		})
	}

	const alert = (message: string) => window.alert(message);
</script>

<template>
	<main>
		<section class="profile-header">
			<ProfilePicture class="profile-picture" :src="userData.profilePicture" :fallback="userData.username?? '?'" :key="userData.profilePicture"/>
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
		<h2 class="settings-dialog_title">
			Modifier le profil
		</h2>
		<form class="settings-form" @submit.prevent="submitSettings">
			<label for="displayname">
				Nom d'utilisateur:
			</label>
			<input type="text" id="displayname" name="displayname" placeholder="Comment vous appelez vous?" :value="userData.displayname" />

			<label for="newPassword">
				Nouveau mot de passe:
			</label>
			<input type="password" id="newPassword" name="newPassword" placeholder="Nouveau mot de passe" />

			<label for="confirmPassword">
				Confirmer le mot de passe:
			</label>
			<input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirmer le mot de passe" />

			<label for="bio">Bio:</label>
			<textarea id="bio" name="bio" placeholder="Décrivez vous..">{{ userData.bio }}</textarea>

			<label>Photo de profil:</label>
			<div class="settings-form_profile-pictures">
				<div>
					<p>Actuelle:</p>
					<ProfilePicture :src="userData.profilePicture" :fallback="userData.username ?? '?'" :key="userData.username" />
				</div>
				<div v-if="newProfilePictureURL">
					<p>Nouvelle:</p>
					<ProfilePicture :src="newProfilePictureURL" :fallback="userData.username ?? '?'" v-if="newProfilePictureURL" :key="newProfilePictureURL" />
				</div>
			</div>

			<label for="profile-picture">
				Modifier la photo de profil:
			</label>
			<UploadButton :config="{
				headers: {
					credentials: 'include',
				},
				endpoint: 'ProfilePicture',
				onClientUploadComplete: (files) => {
					files.forEach(file => {
						newProfilePictureURL = file.ufsUrl;
					});
					isUploading = false;
				},
				onBeforeUploadBegin: (file) => {
					isUploading = true;
					return file
				},
				onUploadAborted: () => {
					alert('Upload Aborted');
				},
				onUploadError: (error) => {
					console.error(error, error.cause);
					alert('Upload failed');
				},
			}" />
			<p v-if="savedChanges" class="saved-changes">Modifications enregistrées !</p>

			<div class="settings-actions">
				<button type="reset" class="destructive" @click="closeDialog" :disabled="isUploading">Annuler</button>
				<button type="submit" :disabled="isUploading">
					<LoadingComponent v-if="isUploading" />
					<span v-else>
						Enregistrer
					</span>
				</button>
			</div>
		</form>
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
	width: 50%;
	border: 1px solid #ccc;
}

.saved-changes {
	color: green;
	font-weight: bold;
	margin-block: 1rem;
}

.settings-dialog_title {
	font-size: 1.5rem;
	font-weight: bold;
	margin-bottom: 1rem;
}

.settings-form {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	margin-bottom: 1rem;
}

.settings-form label {
	text-align: left;
}
.settings-form input,
.settings-form textarea {
	width: 100%;
	padding: 0.5rem;
	border-radius: 5px;
	border: 1px solid #ccc;
}

.settings-form textarea {
	resize: none;
	height: 100px;
}
.settings-actions {
	display: flex;
	justify-content: center;
	gap: 1rem;
}

.settings-form_profile-pictures {
	display: flex;
	gap: 30%;
	justify-content: center;
	width: 80%;
}

.settings-form_profile-pictures div {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
}
</style>