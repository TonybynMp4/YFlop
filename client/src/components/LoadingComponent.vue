<script setup lang="ts">
	import { LoaderCircleIcon } from "lucide-vue-next";
</script>

<template>
	<div class="loading">
		<LoaderCircleIcon class="spinner" /><p><slot>Chargement...</slot></p>
	</div>
</template>

<style scoped>
.loading {
	display: flex;
	gap: 0.5rem;
	align-items: center;
}

.spinner {
	animation: spin 1s linear infinite;
	width: 1.5rem;
	height: 1.5rem;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>