export interface SchemaOrgPerson {
	"@context": string;
	"@type": "Person";
	"@id": string;
	name: string;
	email: string;
	jobTitle: string;
	description: string;
	url: string;
	image: string;
	sameAs: string[];
}

export interface SchemaOrgBlogPosting {
	"@context": string;
	"@type": "BlogPosting";
	headline: string;
	description: string;
	datePublished: string;
	dateModified: string;
	author: {
		"@type": "Person";
		name: string;
		email: string;
		url: string;
	};
	url: string;
	mainEntityOfPage: {
		"@type": "WebPage";
		"@id": string;
	};
}

export interface SchemaOrgSoftwareSourceCode {
	"@context": string;
	"@type": "SoftwareSourceCode";
	name: string;
	description: string;
	dateCreated: string;
	author: {
		"@type": "Person";
		name: string;
		email: string;
		url: string;
	};
	url: string;
	programmingLanguage: string[];
}
