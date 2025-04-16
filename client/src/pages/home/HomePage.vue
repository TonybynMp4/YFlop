<script setup lang="ts">
	import PostComponent from '@/components/post/PostComponent.vue';
	import PostComposer from '@/components/post/PostComposer.vue';
	import type { PostComponentProps } from '@/types/components';
	import { onMounted, reactive } from 'vue';
	import baseURL from '@/baseUrl';
	import { handleEmitLikePost, handleEmitDislikePost, handleAddPost, handleEmitEditPost, handleDeletePost } from '@/utils/postUtils';
	import { ref } from 'vue';
	import LoadingComponent from '@/components/LoadingComponent.vue';

	const posts = reactive<PostComponentProps[]>([]);
	const isFetching = ref(false);
	type getFeedResponse = {error: string} | PostComponentProps[];
	onMounted(async () => {
		isFetching.value = true;
		await fetch(baseURL + '/api/post/getFeed', {
			method: 'GET',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
		}).then((response) => {
			return response.json();
		}).then((data: getFeedResponse) => {
			if ('error' in data) {
				console.error('Error fetching posts:', data.error);
				isFetching.value = false;
				return;
			}
			posts.push(...data);
		}).catch((error) => {
			console.error('Error fetching posts:', error);
		});
		isFetching.value = false;
	});

	async function editPost(postId: number, newContent: string) {
		const result = await handleEmitEditPost(posts, postId, newContent);
		if (result) {
			const postIndex = posts.findIndex((post) => post.id === postId);
			if (postIndex !== -1) {
				posts[postIndex].content = newContent;
			}
		} else {
			alert('Error editing post. Please try again later.');
		}
	}

	async function deletePost(postId: number) {
		const result = await handleDeletePost(postId);
		if (result) {
			const postIndex = posts.findIndex((post) => post.id === postId);
			if (postIndex !== -1) {
				posts.splice(postIndex, 1);
			}

			alert('Post deleted successfully!');
		} else {
			alert('Error deleting post. Please try again later.');
		}
	}
</script>

<template>
	<main class="flex flex-col gap-4 items-center">
		<section id="feed">
			<PostComposer @postPublished="(post) => handleAddPost(posts, post)" />
			<LoadingComponent v-if="isFetching" />
			<PostComponent
				v-for="post in posts"
				:key="post.id"
				@likePost="(postId) => handleEmitLikePost(posts, postId)"
				@dislikePost="(postId) => handleEmitDislikePost(posts, postId)"
				@editPost="editPost"
				@deletePost="deletePost"
				:post="post"
				/>
		</section>
	</main>
</template>

<style scoped>
	main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		margin: 2rem 0;
	}

	#feed {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		width: 80%;
	}

	@media (max-width: 1024px) {
		#feed {
			width: 95%;
		}
	}
</style>