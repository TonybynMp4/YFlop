<script setup lang="ts">
	import type { PostComponentProps } from "@/types/components";
	defineProps<{
		post: PostComponentProps;
	}>();
	const emit = defineEmits(['openPost']);
</script>

<template>
	<article class="gallery_item" @click="() => emit('openPost', post.id)">
		<img class="gallery_image" :src="post.images[0]" alt="image" />
	</article>
</template>

<style scoped>
	.gallery_item {
		width: 24%;
		aspect-ratio: 1;
		cursor: pointer;
	}
	.gallery_image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 8px;
	}
</style>