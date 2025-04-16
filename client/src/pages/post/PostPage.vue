<script setup lang="ts">
	import PostComponent from '@/components/post/PostComponent.vue';
	import type { PostComponentProps } from '@/types/components';

	import { onBeforeMount, ref } from 'vue';
	import { useRoute } from 'vue-router';
	import baseURL from '@/baseUrl';

	import { handleAddComment, handleDeletePost, handleEmitDeleteComment, handleEmitDislikePost, handleEmitEditPost, handleEmitLikePost } from '@/utils/postUtils';
	import router from '@/router';
	import LoadingComponent from '@/components/LoadingComponent.vue';
	import CommentSectionComponent from '@/components/post/CommentSectionComponent.vue';
	const post = ref<PostComponentProps>({} as PostComponentProps);
	type getFeedResponse = {error: string} | PostComponentProps;
	const postId = useRoute().params.id as string;
	const isFetching = ref(true);

	onBeforeMount(async () => {
		if (!postId) {
			return router.push('/home');
		}
		await fetch(baseURL + '/api/post/getPost/' + postId, {
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
			isFetching.value = false;
			post.value = data;
		}).catch((error) => {
			console.error('Error fetching posts:', error);
		});
	});

	async function editPost(postId: number, newContent: string) {
		const result = await handleEmitEditPost([post.value], postId, newContent);
		if (result) {
			post.value.content = newContent;
		} else {
			alert('Error editing post. Please try again later.');
		}
	}

	async function deletePost(postId: number) {
		const result = await handleDeletePost(postId);
		if (result) {
			router.push('/home');

			alert('Post deleted successfully!');
		} else {
			alert('Error deleting post. Please try again later.');
		}
	}
</script>

<template>
	<main class="flex flex-col gap-4 items-center">
		<LoadingComponent v-if="isFetching">
			Chargement du post...
		</LoadingComponent>
		<PostComponent v-else
			:post="post"
			@likePost="( postId ) => handleEmitLikePost([post], postId)"
			@dislikePost="( postId ) => handleEmitDislikePost([post], postId)"
			@editPost="( postId, newContent ) => editPost(postId, newContent)"
			@deletePost="( postId ) => deletePost(postId)"
		/>
		<CommentSectionComponent
			:comments="post.comments"
			@submitComment="(comment) => handleAddComment(post.comments, post.id, comment)"
			@deleteComment="(commentId) => handleEmitDeleteComment(post.comments, commentId)"
		/>
	</main>
</template>

<style scoped>
main {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	align-items: center;
	width: 80%;
	margin: 2rem auto;
}

p {
	margin: 0;
}
</style>