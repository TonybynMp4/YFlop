import type { Comment } from "./types";

interface FormComponentProps {
	formLegend: string;
	fields: FieldComponentProps[];
	actions: ButtonComponentProps[];
	onSubmit: (event: Event) => void;
}

type FieldComponentProps = {
	id: string;
	label: string;
	placeholder: string;
	type?: string;
	minLength?: number;
	required?: boolean;
	defaultValue?: string;
};

type ButtonComponentProps = {
	id: string;
	label: string;
	type?: 'submit' | 'reset' | 'button';
	className?: string;
	style?: string;
	disabled?: boolean;
	onClick?: (event: Event) => void;
};

interface UsernameComponentProps {
	username: string;
	displayname?: string;
}

interface PostComponentProps {
	user: {
		username: string;
		displayname?: string;
		profilePicture?: string;
	};
	id: number;
	content: string;
	images: string[];
	liked: boolean;
	likes: number;
	createdAt: string;
	comments: Comment[];
}

type CommentComponentProps = {
	comment: Comment;
}

interface ProfilePictureComponent {
	src?: string | null;
	fallback: string;
}

export type {
	FormComponentProps,
	FieldComponentProps,
	ButtonComponentProps,
	CommentComponentProps,
	UsernameComponentProps,
	PostComponentProps,
	ProfilePictureComponent
}