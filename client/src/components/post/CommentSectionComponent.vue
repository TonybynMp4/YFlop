<script setup lang="ts">
	import { defineProps } from 'vue';
	import type { Comment } from '@/types/types';
	import CommentComponent from './CommentComponent.vue';

	const props = defineProps<{
		comments: Comment[];
	}>();

	const emit = defineEmits(['submitComment', 'deleteComment']);

	const onSubmit = (event: Event) => {
		event.preventDefault();
		const commentInput = (event.target as HTMLFormElement).comment.value;
		if (!commentInput) return;
		if (commentInput.length > 200) {
			alert('Le commentaire ne doit pas dépasser 200 caractères.');
			return;
		}

		emit('submitComment', commentInput);
		(event.target as HTMLFormElement).reset();
	};
</script>

<template>
	<div class="post_comments">
		<div>
			<p>Commentaires</p>
			<div class="post_comment_section">
				<CommentComponent
					v-for="comment in props.comments"
					:comment="comment"
					:key="comment.comment.id"
					@deleteComment="(commentId) => emit('deleteComment', commentId)"
				/>
				<p v-if="!props.comments" class="no_comments">Aucun commentaire</p>
			</div>
		</div>
		<form v-on:submit="onSubmit" class="post_comment_form">
			<textarea name="comment" id="comment" rows="1" placeholder="Laisser un commentaire.."></textarea>
			<button type="submit">Commenter</button>
		</form>
	</div>
</template>

<style scoped>
	.no_comments {
		font-size: smaller;
		text-align: center;
		color: #888;
	}

	.post_comments {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		height: 100%;
		padding: 1rem;
		border: 1px solid #a5a5a5;
		border-radius: 0.5rem;
	}

	.post_aside {
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		gap: 1rem;
		width: 70%;
		padding: 1rem;
		height: 100%;
	}

	.post_comment_section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-size: smaller;
		height: auto;
		overflow-y: auto;
		max-height: 20rem;
		border-top: 1px solid #a5a5a5;
	}

	.post_comment_form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: auto;
		width: 80%;
	}

	.post_comment_form textarea {
		resize: vertical;
		width: 100%;
		max-height: 7.5rem;
		border: 1px solid #a5a5a5;
	}

	@media (max-width: 1024px) {
		.post_comment_form {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>