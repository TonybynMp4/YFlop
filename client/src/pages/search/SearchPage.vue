<script setup lang="ts">
	import { ref, onBeforeMount } from "vue";
	import type { PostComponentProps } from "@/types/components";
	import baseURL from "@/baseUrl";
	import { handleDeletePost, handleEmitDislikePost, handleEmitEditPost, handleEmitLikePost } from "@/utils/postUtils";
	import LoadingComponent from "@/components/LoadingComponent.vue";
	import { useRoute } from 'vue-router';
	import PostComponent from "@/components/post/PostComponent.vue";
	import { watch } from "vue";
import SearchBarComponent from "@/components/SearchBarComponent.vue";
	const route = useRoute();
	let searchTerm = route.params.query as string;

	watch(() => route.params.query, (newSearch) => {
		searchTerm = newSearch as string;
		posts.value = [];
		fetchData();
	});


	const posts = ref<PostComponentProps[]>([]);
	const isFetching = ref(false);

	async function fetchAll() {
		const fetchedPosts: {
			error: string;
			posts: PostComponentProps[];
		} = await fetch(baseURL + '/api/post/getPosts/', {
			method: 'GET',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
		}).then((response) => response.json())

		if (fetchedPosts.error) {
			console.error('Error fetching posts:', fetchedPosts.error);
			isFetching.value = false;
			return;
		}
		return fetchedPosts;
	}

	async function fetchSearch() {
		const fetchedPosts: {
			error: string;
			posts: PostComponentProps[];
		} = await fetch(`${baseURL}/api/post/searchPosts/${searchTerm.trim()}`, {
			method: 'GET',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
		}).then((response) => response.json());

		if (fetchedPosts.error) {
			console.error('Error fetching posts:', fetchedPosts.error);
			isFetching.value = false;
			return;
		}
		return fetchedPosts;
	}

	async function fetchData() {
		isFetching.value = true;
		const fetchedPosts = searchTerm ? await fetchSearch() : await fetchAll();
		if (!fetchedPosts) {
			isFetching.value = false;
			return;
		}

		isFetching.value = false;
		posts.value = fetchedPosts.posts;
	}

	onBeforeMount(fetchData);

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
		<section>
			<SearchBarComponent
				@exitSearch="fetchData"
				:searchTerm="searchTerm"
				@search="fetchData"
			/>
			<PostComponent
			v-if="posts.length > 0"
			v-for="post in posts"
			:key="post.id"
			@likePost="(postId) => handleEmitLikePost(posts, postId)"
			@dislikePost="(postId) => handleEmitDislikePost(posts, postId)"
			@editPost="editPost"
			@deletePost="deletePost"
			:post="post"
			/>
			<p v-else-if="isFetching">
				<LoadingComponent>Chargement des posts...</LoadingComponent>
			</p>
			<p v-else>No result.</p>
		</section>
	</main>
</template>

<style scoped>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin: 2rem auto;
		width: 70%;
	}
	main > section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		width: 100%;
	}

	p {
		font-size: 1.5rem;
		color: var(--text-color);
	}

	h3 {
		width: 100%;
		text-align: start;
		font-size: 2rem;
		margin-block: 1rem;
	}
</style>