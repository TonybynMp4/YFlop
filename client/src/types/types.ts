interface User {
	id: number;
    username: string;
	displayname: string;
    email: string;
    role: string;
	profilePicture: string;
}

interface UserProfile extends User {
	bio: string;
	followers: number;
	following: number;
	isFollowing: boolean;
}

interface Comment {
	user: {
		username: string;
		displayname: string;
		profilePicture: string | null;
	};
	comment: {
		id: number;
		postId: number;
		userId: number;
		content: string;
		createdAt: string;
	};
}

export type {
    User,
	UserProfile,
	Comment
}