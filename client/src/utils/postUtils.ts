import baseURL from "@/baseUrl";
import router from "@/router";
import useAuthStore from "@/stores/auth-store";
import type { PostComponentProps } from "@/types/components";
import type { Comment } from "@/types/types";
const authStore = useAuthStore();

async function likePost(postId: number) {
	if (!postId) return;
	if (!authStore.getUser) return router.push('/login');

	const APIResponse: {
		liked: boolean;
		error?: string;
	} = await fetch(baseURL + '/api/like', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			postId: postId
		})
	}).then((res) => res.json());

	if (!APIResponse) {
		alert('Error liking post. Please try again later.');
		return;
	}

	if ('error' in APIResponse) {
		console.error(APIResponse.error);
		alert(APIResponse.error);
		return;
	}

	return APIResponse.liked;
}

async function dislikePost(postId: number) {
	if (!postId) return;
	if (!authStore.getUser) return router.push('/login');

	const APIResponse: {
		disliked: boolean;
		error?: string;
	} | null = await fetch(baseURL + '/api/like', {
		method: 'DELETE',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			postId: postId
		})
	}).then((res) => res.json());

	if (!APIResponse) {
		alert('Error liking post. Please try again later.');
		return;
	}

	if ('error' in APIResponse) {
		console.error(APIResponse.error);
		alert(APIResponse.error);
		return;
	}

	return APIResponse.disliked;
}

async function createComment(postId: number, commentContent: string) {
	if (!authStore.getUser) {
		router.push('/login');
		return null;
	}
	if (!commentContent || !postId) return null;

	const APIResponse: {
		comment: Comment;
		error?: string;
	} = await fetch(baseURL+'/api/comment', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			postId: postId,
			content: commentContent
		})
	}).then((res) => res.json());

	if (!APIResponse) {
		alert('Error adding comment. Please try again later.');
		return null;
	}

	if ('error' in APIResponse) {
		console.error(APIResponse.error);
		alert(APIResponse.error);
		return null;
	}

	return APIResponse.comment;
};

async function deleteComment(commentId: number) {
	if (!authStore.getUser) {
		router.push('/login');
		return null;
	}

	if (!commentId) return null;

	const APIResponse: {
		deleted: boolean;
		error?: string;
	} = await fetch(baseURL + '/api/comment/' + commentId, {
		method: 'DELETE',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
	}).then((res) => res.json());

	if (!APIResponse) {
		alert('Error deleting comment. Please try again later.');
		return null;
	}

	if ('error' in APIResponse) {
		console.error(APIResponse.error);
		alert(APIResponse.error);
		return null;
	}

	return APIResponse.deleted;
}

function handleAddPost(posts: PostComponentProps[], post: PostComponentProps) {
	if (!post) return;
	posts.unshift(post);
};

async function handleEmitLikePost(posts: PostComponentProps[], postId: number) {
	const liked = await likePost(postId);
	const post = posts.find((post) => post.id === postId);

	if (!post) return;

	if (!liked) return;

	post.liked = true;
	post.likes += 1;
}

async function handleEmitDislikePost(posts: PostComponentProps[], postId: number) {
	const disliked = await dislikePost(postId);
	const post = posts.find((post) => post.id === postId);

	if (!post) return;
	if (!disliked) return;

	post.liked = false;
	post.likes -= 1;
}

async function handleAddComment(comments: Comment[], postId: number, commentContent: string) {
	const comment = await createComment(postId, commentContent);
	if (!comment) return;

	comments.unshift(comment);
}

async function handleEmitDeleteComment(comments: Comment[], commentId: number) {
	const comment = comments.find((comment) => comment.comment.id === commentId);
	if (!comment) return;

	const deleted = await deleteComment(commentId);
	if (!deleted) return;

	const index = comments.indexOf(comment);
	if (index > -1) {
		comments.splice(index, 1);
	}
}

async function handleEmitEditPost(posts: PostComponentProps[], postId: number, newContent: string) {
	const post = posts.find((post) => post.id === postId);
	if (!post || !newContent) return;

	const APIResponse: {
		post: PostComponentProps;
		error?: string;
	} = await fetch(baseURL + '/api/post', {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			postId: postId,
			description: newContent,
		}),
	}).then((res) => res.json());

	if (!APIResponse) {
		alert('Error editing post. Please try again later.');
		return null;
	}

	if ('error' in APIResponse) {
		console.error(APIResponse.error);
		alert(APIResponse.error);
		return null;
	}

	return APIResponse.post;
}

async function handleDeletePost(postId: number) {
	const APIResponse: {
		deleted: boolean;
		error?: string;
	} = await fetch(baseURL + '/api/post/' + postId, {
		method: 'DELETE',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
	}).then((res) => res.json());

	if (!APIResponse) {
		alert('Error deleting post. Please try again later.');
		return null;
	}

	if ('error' in APIResponse) {
		console.error(APIResponse.error);
		alert(APIResponse.error);
		return null;
	}

	return APIResponse.deleted;
}

export {
	handleAddPost,
	handleEmitLikePost,
	handleEmitDislikePost,
	handleEmitDeleteComment,
	handleEmitEditPost,
	handleAddComment,
	handleDeletePost
}