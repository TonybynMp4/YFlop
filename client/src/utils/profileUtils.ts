import baseURL from "@/baseUrl";
import type { PostComponentProps } from "@/types/components";
import type { UserProfile } from "@/types/types";

async function fetchUserProfile(username: string): Promise<UserProfile> {
	const response: {
		userProfile: UserProfile;
		error?: string;
	} = await fetch(baseURL+`/api/user/getProfile/${username}`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((res) => res.json());

	if (response.error) {
		throw new Error(response.error);
	}

	if (!response.userProfile) {
		throw new Error("User profile not found");
	}

	return response.userProfile;
}

async function fetchUserPosts(username: string): Promise<PostComponentProps[]> {
	const response: {
		posts: PostComponentProps[];
		error?: string;
	} = await fetch(baseURL+`/api/post/getPosts/${username}`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((res) => res.json());

	if (response.error) {
		throw new Error(response.error);
	}

	return response.posts;
}

export {
	fetchUserProfile,
	fetchUserPosts
}