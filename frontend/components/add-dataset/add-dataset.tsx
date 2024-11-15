import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddDataset() {
	return (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<Label htmlFor="dataset">Add Dataset</Label>
			<Input id="dataset" type="file" />
		</div>
	);
}
