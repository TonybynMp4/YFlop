<script setup lang="ts">
	import type { ProfilePictureComponent } from '@/types/components';
	import { defineProps } from 'vue';

	const props = defineProps<ProfilePictureComponent>();
	const { src, fallback } = props;
</script>

<template>
	<img v-if="src" class="profile_picture" :src="src" alt="Profile Picture" />
	<div v-else class="profile_picture">
		{{ fallback ? fallback.slice(0, 1).toUpperCase() : '?' }}
	</div>
</template>

<style scoped>
	.profile_picture {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid #a5a5a5;
		align-content: center;
		text-align: center;
	}
</style>