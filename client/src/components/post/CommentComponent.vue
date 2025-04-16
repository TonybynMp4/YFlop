<script setup lang="ts">
	import { defineProps } from 'vue';
	import type { CommentComponentProps } from '@/types/components';
	import Username from '@/components/profile/UsernameComponent.vue';
	import ProfilePicture from '../profile/ProfilePictureComponent.vue';
	import getRelativeTime from '@/utils/getRelativeTime';
	import useAuthStore from '@/stores/auth-store';
	import { TrashIcon } from 'lucide-vue-next';

	const props = defineProps<CommentComponentProps>();
	const emit = defineEmits(['deleteComment']);
	const {
		user: { profilePicture, username },
		comment: { userId, content, createdAt },
	} = props.comment;

	const timeAgo = getRelativeTime(createdAt);
	const authStore = useAuthStore();

	const deleteComment = () => {
		if (!props.comment) return;
		if (!authStore.getUser) return;

		if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
			emit('deleteComment', props.comment.comment.id);
		}
	};
</script>

<template>
	<article class="post_comment">
		<span class="post_comment_user">
			<ProfilePicture :src="profilePicture" :fallback="username" />
			<Username :username="username" />
			<time class="post_comment_time" datetime={createdAt}>{{
				timeAgo
			}}</time>
			<div class="comment_actions">
				<button class="destructive" v-if="userId === authStore.getUser?.id" @click="deleteComment"><TrashIcon /></button>
			</div>
		</span>
		<p>
			{{ content }}
		</p>
	</article>
</template>

<style scoped>
	.post_comment {
		display: flex;
		flex-direction: column;
		width: 100%;
		border-bottom: 1px solid #a5a5a5;
		padding-block: 0.5rem;
		padding-inline: 0.5rem;
		border-radius: 0;
	}

	.post_comment p {
		font-size: small;
		margin-left: 4ch;
		overflow: hidden;
	}

	.post_comment_user {
		display: flex;
		gap: 1ch;
		align-items: center;
	}

	.post_comment_time {
		font-size: smaller;
		color: #888;
	}

	.comment_actions {
		display: flex;
		gap: 0.5rem;
		margin-left: auto;
	}

	.comment_action {
		cursor: pointer;
		color: black;
		font-size: smaller;
		margin-left: auto;
		padding: 0.25rem;
		border-radius: 0.25rem;
		border: 1px solid #a5a5a5;
	}

	.comment_action svg{
		height: 0.75rem;
		width: 0.75rem;
	}


	.comment_action:hover {
		color: white;
		background-color: black
	}
</style>