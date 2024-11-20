export async function addDataset(content: ArrayBuffer, datasetId: string, kind: string) {
	const response = await fetch(`http://localhost:4321/dataset/${datasetId}/${kind}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/octet-stream",
		},
		body: content,
	});

	if (response.ok) {
		const result = await response.json();
		return { result };
	} else {
		const error = await response.json();
		return { error: error.error || "An error occurred." };
	}
}

export async function removeDataset(id: string) {
	const response = await fetch(`http://localhost:4321/dataset/${id}`, {
		method: "DELETE",
	});

	if (response.ok) {
		const result = await response.json();
		return { result: result.result };
	} else {
		const error = await response.json();
		return { error: error.error || "An error occurred while removing dataset" };
	}
}

export async function listDatasets() {
	const response = await fetch(`http://localhost:4321/datasets`, {
		method: "GET",
	});

	if (response.ok) {
		const result = await response.json();
		return { result: result.result };
	} else {
		const error = await response.json();
		return { error: error.error || "An error occurred while listing datasets" };
	}
}

export async function performQuery(query: object) {
	const response = await fetch(`http://localhost:4321/query`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(query),
	});

	if (response.ok) {
		const result = await response.json();
		return { result: result.result };
	} else {
		const error = await response.json();
		return { error: error.error || "An error occurred while querying the dataset" };
	}
}
