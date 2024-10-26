import { PreProcessedSection, Section } from "../controller/InsightFacade.types";

export function isValidCourseSection(section: PreProcessedSection): boolean {
	const requiredFields = ["id", "Course", "Title", "Professor", "Subject", "Year", "Avg", "Pass", "Fail", "Audit"];
	return requiredFields.every((field) => field in section);
}

export function processCourseSection(section: PreProcessedSection): Section {
	const isOverall = section.Section === "overall";
	const defaultYear = 1900;
	return {
		uuid: section.id.toString(),
		id: section.Course || "",
		title: section.Title || "",
		instructor: section.Professor || "",
		dept: section.Subject || "",
		year: isOverall ? defaultYear : parseYear(section.Year),
		avg: parseFloat(section.Avg) || 0,
		pass: parseInt(section.Pass, 10) || 0,
		fail: parseInt(section.Fail, 10) || 0,
		audit: parseInt(section.Audit, 10) || 0,
	};
}

function parseYear(year: string): number {
	const defaultYear = 1900;
	if (year === "" || isNaN(parseInt(year, 10))) {
		return defaultYear;
	}
	return parseInt(year, 10);
}
