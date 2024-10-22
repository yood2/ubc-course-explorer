export interface Section {
	uuid: string;
	id: string;
	title: string;
	instructor: string;
	dept: string;
	year: number;
	avg: number;
	pass: number;
	fail: number;
	audit: number;
}

export interface Query {
	WHERE: object;

	OPTIONS: {
		COLUMNS: string[];
		ORDER?: string;
	};
}

export type Where = Record<string, any>;
