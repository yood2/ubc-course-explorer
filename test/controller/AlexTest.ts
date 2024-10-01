export default function AlexTest(): () => void {
	return function (): void {
		it("Should pass", function () {
			console.log("Yay");
		});
	};
}
