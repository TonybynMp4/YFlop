<script setup lang="ts">
	import type { PostComponentProps } from '@/types/components';
	import { ref, useTemplateRef } from 'vue';
	import PostGalleryItemComponent from './PostGalleryItemComponent.vue';
	import { ExternalLinkIcon, XIcon } from 'lucide-vue-next';
	import PostComponent from './PostComponent.vue';
	import router from '@/router';
	import { watch } from 'vue';
	import { useRoute } from 'vue-router';
	const dialogRef = useTemplateRef<HTMLDialogElement>('dialogRef');
	function openDialog (postId: number) {
		dialogRef.value?.showModal();
		dialogPostId.value = postId;
	}
	function closeDialog() {
		dialogRef.value?.close();
	}
	const dialogPostId = ref<number | null>(null);

	defineProps<{
		posts: PostComponentProps[];
	}>();

	const Route = useRoute();
	watch(() => Route, () => {
		closeDialog();
	}, { immediate: true, deep: true });
	const emit = defineEmits([
		'likePost',
		'dislikePost',
		'editPost',
		'deletePost',
	]);
</script>

<template>
	<section class="gallery">
		<PostGalleryItemComponent
			v-for="post in posts"
			:key="post.id"
			:post="post"
			@openPost="openDialog"
		/>
		<dialog ref="dialogRef" class="dialog" @click.self="closeDialog">
			<div class="dialogActions">
				<ExternalLinkIcon @click="router.push(`/post/${dialogPostId}`)" />
				<XIcon
					class="closeDialog"
					@click="closeDialog"
				/>
			</div>
			<div class="dialogContent">
				<PostComponent
					v-if="dialogPostId"
					:post="posts.find((post) => post.id === dialogPostId) ?? posts[0]"
					@likePost="(postId) => emit('likePost', postId)"
					@dislikePost="(postId) => emit('dislikePost', postId)"
					@editPost="(postId, newContent) => emit('editPost', postId, newContent)"
					@deletePost="(postId) => emit('deletePost', postId)"
				/>
			</div>
		</dialog>
	</section>
</template>

<style scoped>
	.gallery {
		display: flex;
		flex-wrap: wrap;
		gap: 1%;
	}

	.dialog {
		width: 80%;
		height: 90%;
		background-color: transparent;
	}

	.dialogActions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		align-items: center;
	}

	.dialogActions svg {
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		color: #000;
	}

	.dialogActions svg:hover {
		color: white;
	}

	.closeDialog {
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		color: red;
	}

	.dialogContent {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		height: 40%;
	}

	.gallery_item {
		margin-bottom: 0.5rem;
	}
</style>