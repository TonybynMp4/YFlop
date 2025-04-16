import type { Comment } from "./types";

type serverMedia = {
	id: number;
	media_url: string;
	post_id: number;
	user_id: number;
	createdAt: string;
	created_at: string;
}

type serverPost = {
	id: number;
	user_id: number;
	description: string;
	created_at: string;
	username: string;
	displayname: string;
	profile_picture?: string;
	liked: boolean;
	medias: serverMedia[];
	likes: number;
	comments: Comment[];
}

export type {
	serverMedia,
	serverPost
}