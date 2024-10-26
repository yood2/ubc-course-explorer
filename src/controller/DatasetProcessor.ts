import JSZip = require("jszip");

import { checkKind } from "../utils/validation-utils";
import { InsightDatasetKind } from "./IInsightFacade";
import { PreProcessedSection, ProcessResult, Section } from "./InsightFacade.types";
import { isValidCourseSection, processCourseSection } from "../utils/section-utils";

export class DatasetProcessor {
	constructor() {
		// default constructor
	}

	public async validate(content: string, kind: InsightDatasetKind): Promise<JSZip> {
		const zip = new JSZip();
		const folder = await zip.loadAsync(content, { base64: true });

		switch (checkKind(kind)) {
			case "sections":
				this.validateSections(folder);
				break;
			case "rooms":
				this.validateRooms(folder);
				break;
			default:
				throw new Error("validate: Invalid InsightdatasetKind");
		}

		return folder;
	}

	public validateSections(zip: JSZip): void {
		const hasCourseFolder = Object.keys(zip.files).some((filename) => filename.startsWith("courses/"));
		if (!hasCourseFolder) {
			throw new Error("Zip file does not contain a 'courses' folder");
		}

		const coursesContent = Object.keys(zip.files).filter(
			(filename) => filename.startsWith("courses/") && filename !== "courses/"
		);
		if (coursesContent.length === 0) {
			throw new Error("'courses' folder is empty");
		}
	}

	public validateRooms(zip: JSZip): void {
		console.log(zip);
		throw new Error("validateRooms not implemented");
	}

	public async parse(folder: JSZip, kind: InsightDatasetKind): Promise<JSZip.JSZipObject[]> {
		let res: JSZip.JSZipObject[] = [];

		if (checkKind(kind) === "sections") {
			res = this.parseSections(folder);
		} else if (checkKind(kind) === "rooms") {
			res = this.parseRooms(folder);
		}

		return res;
	}

	private parseSections(folder: JSZip): JSZip.JSZipObject[] {
		return Object.values(folder.files).filter((file) => file.name.startsWith("courses/") && file.name !== "courses/");
	}

	private parseRooms(folder: JSZip): JSZip.JSZipObject[] {
		console.log(folder);
		throw new Error("Not implemented yet");
	}

	public async process(files: JSZip.JSZipObject[], kind: InsightDatasetKind): Promise<ProcessResult> {
		let res;

		if (checkKind(kind) === "sections") {
			res = this.processSections(files);
			return res;
		}

		res = this.processRooms(files);
		return res;
	}

	private async processSections(files: JSZip.JSZipObject[]): Promise<ProcessResult> {
		const fileProcessingPromises = files.map(async (file) => {
			try {
				const fileContent = await file.async("string");
				if (!("result" in JSON.parse(fileContent))) {
					throw new Error("No results array");
				}
				const preSections: PreProcessedSection[] = JSON.parse(fileContent).result;
				const processedSections: Section[] = [];

				for (const section of preSections) {
					if (!isValidCourseSection(section)) {
						throw new Error(`Invalid course section in file ${file.name}`);
					}
					processedSections.push(processCourseSection(section));
				}
				return processedSections;
			} catch (err) {
				throw new Error(`Error processing file ${file.name}: ${(err as Error).message}`);
			}
		});

		const processedSections = await Promise.all(fileProcessingPromises);
		const rows: Section[] = processedSections.flat();
		const totalRows = rows.length;

		return { rows, totalRows };
	}

	private async processRooms(files: JSZip.JSZipObject[]): Promise<ProcessResult> {
		console.log(files);
		throw new Error("not implemented yet");
	}
}
