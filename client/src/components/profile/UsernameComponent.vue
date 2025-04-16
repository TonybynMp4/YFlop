<script setup lang="ts">
	import { defineProps } from 'vue';
	import type { UsernameComponentProps } from '@/types/components';

	const props = defineProps<UsernameComponentProps>();
	const { username, displayname } = props;
</script>

<template>
	<router-link :to="`/profile/${username}`" class="username">{{ displayname ?? '@' + username }}</router-link>
</template>

<style scoped>
	.username {
		text-decoration: none;
		color: var(--primary);
		font-weight: bold;
	}
	.username:hover {
		text-decoration: underline;
		color: var(--secondary);
	}
</style>