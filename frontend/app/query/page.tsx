import { DataTable } from "@/components/data-table/data-table";
import QueryForm from "@/components/query-form/query-form";
import { columns } from "@/components/data-table/columns";

export default function Query() {
	return (
		<>
			<QueryForm />
			{/* <DataTable data={data} columns={columns} /> */}
		</>
	);
}

const data = [
	{
		uuid: "test",
		id: "CPSC121",
		title: "Discrete Math",
		instructor: "Me",
		dept: "CPSC",
		year: 1999,
		avg: 90,
		pass: 10,
		fail: 1,
		audit: 1,
	},
];
