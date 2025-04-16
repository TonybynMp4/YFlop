<script setup lang="ts">
import ProfilePicture from '@/components/profile/ProfilePictureComponent.vue';
import Username from '@/components/profile/UsernameComponent.vue';
import type { PostComponentProps } from '@/types/components';
import { ArrowLeft, ArrowRight, EditIcon, Heart, MessageSquareText, Share } from 'lucide-vue-next';
import { ref } from 'vue';
import useAuthStore from '@/stores/auth-store';
import { TrashIcon } from 'lucide-vue-next';
const authStore = useAuthStore();

const props = defineProps<{
	post: PostComponentProps;
}>();
const emit = defineEmits(['likePost', 'dislikePost', 'editPost', 'deletePost']);

const playLikeAnimation = ref(false);
function likePost() {
	const post = props.post;
	if (!post) return;
	post.liked = !post.liked;

	if (post.liked) {
		emit('likePost', post.id);
		playLikeAnimation.value = true;
		setTimeout(() => {
			playLikeAnimation.value = false;
		}, 500);
	} else {
		emit('dislikePost', post.id);
	}
};

const sharePost = () => {
	if (!props.post) return;
	const postUrl = `${window.location.origin}/post/${props.post.id}`;
	navigator.share({
		title: props.post.content,
		url: postUrl
	}).catch((error) => console.error('Error sharing:', error));
};

const currentImageIndex = ref(0);

const isEditing = ref(false);
const setIsEditing = () => isEditing.value = !isEditing.value;
const editPostContent = ref(props.post.content);
const editPost = () => {
	if (!props.post) return;
	if (!authStore.getUser) return;

	const newContent = editPostContent.value.trim();

	if (newContent.length > 255) {
		alert('Le post ne doit pas dépasser 255 caractères.');
		return;
	}
	if (newContent === props.post.content) {
		setIsEditing();
		return;
	}

	if (newContent === '') {
		alert('La description ne peut pas être vide.');
		return;
	}

	emit('editPost', props.post.id, newContent);
	isEditing.value = false;
};

const deletePost = () => {
	if (!props.post) return;
	if (!authStore.getUser) return;

	if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
		emit('deletePost', props.post.id);
	}
};
</script>

<template>
	<article class="post">
		<div class="post_details">
			<div class="post_details_upper">
				<div class="post_user">
					<ProfilePicture :src="props.post.user.profilePicture" :fallback="props.post.user.username" />
					<Username :username="props.post.user.username" :displayname="props.post.user.displayname" />
				</div>
				<div class="post_actions">
					<div class="post_like">
						<Heart class="post_action" :class="{ 'liked': props.post.liked }" @click="likePost" />
						<span>{{ props.post.likes }}</span>
					</div>
					<router-link class="post_comments" :to="`/post/${props.post.id}`">
						<MessageSquareText class="post_action" />
						<span>{{ props.post.comments.length }}</span>
					</router-link>
					<Share class="post_action" @click="sharePost()" />
					<EditIcon class="post_action" v-if="props.post.user.username === authStore.getUser?.username"
						@click="setIsEditing" />
					<TrashIcon class="destructive-inverted"
						v-if="props.post.user.username === authStore.getUser?.username" @click="deletePost" />
				</div>
			</div>
			<router-link :to="`/post/${props.post.id}`" class="post_content" v-if="!isEditing">{{ props.post.content }}</router-link>
			<p v-else class="post_edit">
				<textarea v-model="editPostContent" class="post_comment_edit" placeholder="Edit your post..."
					rows="3"></textarea>
				<button @click="editPost">Save</button>
			</p>
		</div>
		<div style="position: relative; width: 100%;" v-if="props.post.images && props.post.images.length > 0">
			<img class="post_image" :src="props.post.images[currentImageIndex]" alt="image" />
			<div class="post_image_arrows" v-if="props.post.images.length > 1">
				<ArrowLeft
					@click="currentImageIndex = (currentImageIndex - 1 + props.post.images.length) % props.post.images.length" />
				<ArrowRight @click="currentImageIndex = (currentImageIndex + 1) % props.post.images.length" />
			</div>
			<Heart class="heartBurst toggleHeartBurst" v-if="playLikeAnimation" />
		</div>
	</article>
</template>

<style scoped>
.post_edit textarea {
	width: 100%;
	border: 1px solid #a5a5a5;
	border-radius: 0.25rem;
	padding: 0.25rem;
	font-size: small;
	max-height: 8em;
	min-height: 2em;
	resize: vertical;
}

.post_edit {
	display: flex;
	margin-top: 0.25rem;
	gap: 1ch;
	align-items: center;
}

.post_image_arrows {
	position: absolute;
	display: flex;
	justify-content: space-between;
	top: 50%;
	transform: translateY(-50%);
	width: 100%;
	padding-inline: 0.5rem;
}

.post_image_arrows svg {
	cursor: pointer;
	width: 2rem;
	height: 2rem;
	color: #fff;
}

@media (max-width: 1200px) {
	.post {
		width: 100%;
		max-height: unset !important;
	}

	.post_main,
	.post_image {
		width: 100% !important;
	}
}

.post {
	display: flex;
	background-color: #242424;
	flex-direction: column;
	gap: 1rem;
	align-items: flex-start;
	border: 1px solid #f5f5f5;
	border-radius: 1rem;
	width: 100%;
	max-height: 50rem;
	color: white;
}

.post_like, .post_comments {
	display: flex;
	color: white;
	gap: 0.5rem;
	align-items: center;
	cursor: pointer;
}

.post_user {
	display: flex;
	gap: 1rem;
	align-items: center;
	width: 100%;
}

.post_user_info {
	display: flex;
	gap: 1rem;
	align-items: center;
	width: 100%;
}

#post-form {
	width: 100%;
	display: flex;
	gap: 1rem;
	align-items: center;
	flex-direction: column;
}

.post_image {
	background-color: #242424;
	width: 100%;
	align-self: center;
	max-height: 40rem;
	height: auto;
	border-radius: 0 0 1rem 1rem;
	position: relative;
	object-fit: contain;
}

.post_details {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 1rem;
	width: 100%;
}

.post_content {
	text-decoration: none;
	font-weight: normal;
	color: white;
}

.post_actions {
	display: flex;
	gap: 1rem;
	align-items: center;
}

.post_action {
	cursor: pointer;
	color: white;
}

.liked {
	fill: red;
}

.post_action:hover {
	color: #4e4e4e;
}

.post_details_upper {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
}

@keyframes heart-burst {
	0% {
		opacity: 0;
		transform: scale(0) translate(-50%, -50%);
	}

	15% {
		opacity: 0.9;
		transform: scale(1.2) translate(-50%, -50%);
	}

	30% {
		opacity: 0.8;
		transform: scale(0.9) translate(-50%, -50%);
	}

	45% {
		opacity: 0.7;
		transform: scale(1) translate(-50%, -50%);
	}

	60% {
		opacity: 0.6;
		transform: scale(0.95) translate(-50%, -50%);
	}

	100% {
		opacity: 0;
		transform: scale(2) translate(-50%, -50%);
	}
}

.heartBurst {
	display: none;
	position: absolute;
	top: 50%;
	left: 50%;
	width: 100px;
	height: 100px;
	fill: red;
	stroke: red;
	transform: translate(-50%, -50%);
}

.toggleHeartBurst {
	display: block;
	animation: heart-burst 0.5s ease forwards;
}
</style>