import { House, Folder, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Debug from "../debug/debug";

export default function Menu() {
	return (
		<>
			<div className="flex items-center justify-between">
				<div className="flex flex-1 items-center space-x-2">
					<Link href="/">
						<Button variant="outline" size="sm" className="h-8 lg:flex">
							<House />
							Home
						</Button>
					</Link>
					<Link href="/manage">
						<Button variant="outline" size="sm" className="h-8 lg:flex">
							<Folder />
							Manage
						</Button>
					</Link>
					<Link href="/query">
						{" "}
						<Button variant="outline" size="sm" className="h-8 lg:flex">
							<ScanSearch />
							Query
						</Button>
					</Link>
					<Debug />
				</div>
			</div>
		</>
	);
}
