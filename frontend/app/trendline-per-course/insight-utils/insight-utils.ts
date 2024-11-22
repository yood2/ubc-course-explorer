export function getDepts(options: [], datasetId: any): string[] {
	const depts: [] = [];
	const deptKey: string = `${datasetId}_dept`;

	for (const option of options) {
		if (option[deptKey] && !depts.includes(option[deptKey])) {
			depts.push(option[deptKey]);
		}
	}

	return depts.sort();
}

export function getIds(options: [], datasetId: any, selectedDept: string): string[] {
	const ids: [] = [];
	const deptKey: string = `${datasetId}_dept`;
	const yearKey: string = `${datasetId}_year`;
	const idKey: string = `${datasetId}_id`;

	for (const option of options) {
		if (option[deptKey] === selectedDept && option[idKey] && !ids.includes(option[idKey])) {
			ids.push(option[idKey]);
		}
	}
	return ids.sort();
}

export function queryGenerator(selectedDataset: string, selectedDept: string, selectedId: string) {
	const yearCol = `${selectedDataset}_year`;
	const deptCol = `${selectedDataset}_dept`;
	const idCol = `${selectedDataset}_id`;
	const avgCol = `${selectedDataset}_avg`;
	const trendline = "avgPerYear";

	const query = {
		WHERE: {
			AND: [
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
			COLUMNS: [idCol, deptCol, yearCol, trendline],
			ORDER: yearCol,
		},
		TRANSFORMATIONS: {
			GROUP: [idCol, deptCol, yearCol],
			APPLY: [
				{
					[trendline]: {
						AVG: avgCol,
					},
				},
			],
		},
	};

	return query;
}
