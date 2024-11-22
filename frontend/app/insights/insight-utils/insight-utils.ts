export function getYears(options: [], datasetId: any): number[] {
	const years: [] = [];
	const key: string = `${datasetId}_year`;

	for (const option of options) {
		if (option[key] && !years.includes(option[key])) {
			years.push(option[key]);
		}
	}

	return years.sort();
}

export function getDepts(options: [], datasetId: any, selectedYear: number): string[] {
	const depts: [] = [];
	const deptKey: string = `${datasetId}_dept`;
	const yearKey: string = `${datasetId}_year`;

	for (const option of options) {
		if (option[yearKey] === selectedYear && option[deptKey] && !depts.includes(option[deptKey])) {
			depts.push(option[deptKey]);
		}
	}

	return depts.sort();
}

export function getIds(options: [], datasetId: any, selectedYear: number, selectedDept: string): string[] {
	const ids: [] = [];
	const deptKey: string = `${datasetId}_dept`;
	const yearKey: string = `${datasetId}_year`;
	const idKey: string = `${datasetId}_id`;

	for (const option of options) {
		if (
			option[yearKey] === selectedYear &&
			option[deptKey] === selectedDept &&
			option[idKey] &&
			!ids.includes(option[idKey])
		) {
			ids.push(option[idKey]);
		}
	}
	return ids.sort();
}

export function queryGenerator(
	selectedDataset: string,
	selectedYear: number,
	selectedDept: string,
	selectedId: string
) {
	const yearCol = `${selectedDataset}_year`;
	const deptCol = `${selectedDataset}_dept`;
	const idCol = `${selectedDataset}_id`;
	const avgCol = `${selectedDataset}_avg`;
	const failCol = `${selectedDataset}_fail`;
	const passCol = `${selectedDataset}_pass`;
	const auditCol = `${selectedDataset}_audit`;
	const instructorCol = `${selectedDataset}_instructor`;
	const uuidCol = `${selectedDataset}_uuid`;

	const query = {
		WHERE: {
			AND: [
				{
					EQ: {
						[yearCol]: selectedYear,
					},
				},
				{
					IS: {
						[deptCol]: selectedDept,
					},
				},
				{
					IS: {
						[idCol]: selectedId,
					},
				},
			],
		},
		OPTIONS: {
			COLUMNS: [idCol, deptCol, avgCol, failCol, passCol, auditCol, instructorCol, uuidCol],
			ORDER: failCol,
		},
	};

	return query;
}
