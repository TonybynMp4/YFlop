<script setup lang="ts">
	import { UploadButton } from '@/uploadthing';
	import ProfilePictureComponent from '../profile/ProfilePictureComponent.vue';
	import useAuthStore from '@/stores/auth-store';
	import { ref } from 'vue';
	import baseURL from '@/baseUrl';
	import { XIcon } from 'lucide-vue-next';
	const authStore = useAuthStore();

	const mediaUrls = ref<string[]>([]);
	const isUploading = ref(false);

	const emit = defineEmits(['postPublished']);

	const publishPost = (data: Event) => {
		if (!authStore.getUser) return;
		if (isUploading.value) {
			return;
		}
		const requestBody = JSON.stringify({
			content: (data.target as HTMLFormElement).post.value,
			mediaUrls: mediaUrls.value,
		});

		fetch(baseURL + '/api/post', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: requestBody,
		})
		.then(response => {
			if (!response.ok) throw new Error('Network response was not ok');
			return response.json();
		})
		.then(post => {
			alert('Post publié avec succès !');
			emit('postPublished', {...post, liked: false});
		})
		.catch(error => {
			console.error('Error publishing post:', error);
			alert('Error publishing post. Please try again later.');
		});
		mediaUrls.value = []; // Clear media URLs after publishing

		(data.target as HTMLFormElement).reset(); // Reset the form
	};

	function alert(message: string) {
		window.alert(message);
	}
</script>

<template>
	<form class="post-composer" @submit.prevent="publishPost">
		<div class="post-composer__input">
			<ProfilePictureComponent :src="authStore.getUser?.profilePicture" :fallback="authStore.getUser?.username || '?'" />
			<textarea name="post" id="post" cols="30" rows="3" placeholder="What's on your mind?"></textarea>
		</div>
		<div class="post-composer__media-preview">
			<div v-for="url in mediaUrls" class="relative">
				<img :src="url" alt="Uploaded media" style="max-width: 100px; max-height: 100px;" />
				<XIcon @click="mediaUrls = mediaUrls.filter(mediaUrl => mediaUrl !== url)"
					style="cursor: pointer; color: red; height: 50%; width: 50%;" class="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2" />
			</div>
		</div>
		<UploadButton :config="{
			headers: {
				credentials: 'include',
			},
			endpoint: 'Images',
			onClientUploadComplete: (files) => {
				files.forEach(file => mediaUrls.push(file.ufsUrl));
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
		<div class="flex gap-2 ml-auto flex-wrap justify-center">
			<button type="reset" @click="mediaUrls = []" class="destructive py-2 m-0 h-min">Reinitialiser</button>
			<button class="h-10" :disabled="isUploading">Yeet</button>
		</div>
	</form>
</template>

<style scoped>
	@media (max-width: 1200px) {
		.post-composer {
			width: 90% !important;
		}
	}

.post-composer {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	width: 50%;
	padding: 1rem;
	border-radius: 1rem;
	border: 1px solid #a5a5a5;
}

.post-composer__input {
	display: flex;
	gap: 1rem;
	width: 100%;
}

.post-composer__input textarea {
	width: 100%;
	height: 100%;
	outline: none;
	resize: none;
	padding: 0.5rem;
	border-radius: 1rem;
}

.post-composer__media-preview {
	display: flex;
	gap: 1rem;
	width: 100%;
	overflow-x: auto;
}
</style>