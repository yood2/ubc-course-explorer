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

export interface Room {
	id: string;
}

export interface Query {
	WHERE: object;

	OPTIONS: {
		COLUMNS: string[];
		ORDER?: string;
	};
}

export type Where = Record<string, any>;

export interface PreProcessedSection {
	id: string;
	Course: string;
	Title: string;
	Professor: string;
	Subject: string;
	Year: string;
	Avg: string;
	Pass: string;
	Fail: string;
	Audit: string;
	Section: string;
}

export interface ProcessResult {
	rows: Section[] | Room[];
	totalRows: number;
}
