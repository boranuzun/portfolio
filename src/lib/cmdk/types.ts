export type Mode = "command" | "search" | "chat";

export interface Action {
	name: string;
	icon: string;
	handler: () => void;
	external?: boolean;
	keepOpen?: boolean;
	keywords?: string[];
}

export interface Section {
	name: string;
	actions: Action[];
}

export interface SearchEntry {
	title: string;
	description?: string;
	url: string;
	group: string;
}
