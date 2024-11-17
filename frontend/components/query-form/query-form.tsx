import { QueryFilter } from "./query-filters";
import { QueryDataset } from "./query-dataset";
import { QueryOptions } from "./query-options";

export default function QueryForm() {
	return (
		<>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Query</h3>
			<p className="leading-7 [&:not(:first-child)]:mt-6">
				Dataset: <QueryDataset />
				<br />
				<br />
				Filters: <QueryFilter />
				<br />
				<br />
				Options: <QueryOptions />
			</p>
		</>
	);
}
