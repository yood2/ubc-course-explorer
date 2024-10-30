import JSZip = require("jszip");

export type Row = Room | Section;

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
	fullname: string;
	shortname: string;
	number: string;
	name: string;
	address: string;
	lat: number;
	lon: number;
	seats: number;
	type: string;
	furniture: string;
	href: string;
}

export interface IndexRow {
	fullname: string;
	shortname: string;
	address: string;
	href: string;
	lat: number;
	lon: number;
}

export interface BuildingRow {
	number: string;
	seats: string;
	type: string;
	furniture: string;
}

export interface Query {
	WHERE: object;

	OPTIONS: {
		COLUMNS: string[];
		ORDER?: string;
	};

	TRANSFORMATIONS?: {
		GROUP: string[];
		APPLY: any[];
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

export interface ParsedData {
	sections?: { folder: JSZip; values: JSZip.JSZipObject[] };
	rooms?: { indexRows: any[]; buildingData: Record<string, any[]> };
}

export interface GeoResponse {
	lat?: number;
	lon?: number;
	error?: string;
}
