export default function DanielTest(): () => void {
	return function (): void {
		it("Should pass", function () {
			console.log("Yay");
		});
	};
}
