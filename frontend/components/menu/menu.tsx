"use client";

import { House, Folder, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import Debug from "../debug/debug";

export default function Menu() {
	return (
		<>
			<div className="flex items-center justify-between">
				<div className="flex flex-1 items-center space-x-2">
					<a href="/">
						<Button variant="outline" size="sm" className="h-8 lg:flex">
							<House />
							Home
						</Button>
					</a>
					<a href="/manage">
						<Button variant="outline" size="sm" className="h-8 lg:flex">
							<Folder />
							Manage
						</Button>
					</a>
					<a href="/query">
						{" "}
						<Button variant="outline" size="sm" className="h-8 lg:flex">
							<ScanSearch />
							Query
						</Button>
					</a>
					<Debug />
				</div>
			</div>
		</>
	);
}
