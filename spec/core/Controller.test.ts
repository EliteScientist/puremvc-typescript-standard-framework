import { Controller, IController, SimpleCommand, Notification, INotification } from "puremvc";

describe("Controller Test", () =>
{
	let controller: IController;

	beforeEach(() =>
	{
		controller = Controller.getInstance();
	});
	it("Get Instance", () =>
	{
		// Test Factory Method
		expect(controller).not.toBeNull();
		expect(controller).toBeInstanceOf(Controller);
	});

	it("Register and Execute", async () =>
	{
		// Register the ControllerTestCommand to handle 'ControllerTest' notifications
		controller.registerCommand("ControllerTest", ControllerTestCommand);

		const vo = new ControllerTestVO(12);
		const notification = new Notification("ControllerTest", vo);


		await controller.executeCommand(notification);

		expect(vo.result).toBe(24);
	});

	it("Register and Remove", async () =>
	{
		// Register the ControllerTestCommand to handle 'ControllerTest' notifications
		controller.registerCommand("ControllerRemoveTest", ControllerTestCommand);

		// Create a 'ControllerTest' notification
		const vo = new ControllerTestVO(12);
		const notification = new Notification("ControllerRemoveTest", vo);

		// Tell the controller to execute the Command associated with the notification
		// the ControllerTestCommand invoked will multiply the vo.input value
		// by 2 and set the result on vo.result
		await controller.executeCommand(notification);

		expect(vo.result).toBe(24);

		// Reset result
		vo.result = 0;

		// Remove the Command from the Controller
		controller.removeCommand("ControllerRemoveTest");

		// Tell the controller to execute the Command associated with the
		// notification. This time, it should not be registered, and our vo result
		// will not change
		await controller.executeCommand(notification);

		// test assertions
		expect(vo.result).toBe(0);
	});

	it("Has Command", () =>
	{
		controller.registerCommand("hasCommandTest", ControllerTestCommand);

		// test that hasCommand returns true for hasCommandTest notifications
		expect(controller.hasCommand("hasCommandTest")).toBe(true);

		// Remove the Command from the Controller
		controller.removeCommand("hasCommandTest");

		// test that hasCommand returns false for hasCommandTest notification
		expect(controller.hasCommand("hasCommandTest")).toBe(false);
	});

	it("Reregister and Execute", async () =>
	{
		controller.registerCommand("ControllerTest2", ControllerTestCommand2);

		// Remove the Command from the Controller
		controller.removeCommand("ControllerTest2");

		// Re-register the Command with the Controller
		controller.registerCommand("ControllerTest2", ControllerTestCommand2);

		// Create a 'ControllerTest2' notification
		const vo = new ControllerTestVO(12);
		const notification = new Notification("ControllerTest2", vo);


		// send the Notification
		await controller.executeCommand(notification);

		// test assertions
		// if the command is executed once the value will be 24
		expect(vo.result).toBe(24);

		// Prove that accumulation works in the VO by sending the notification again
		await controller.executeCommand(notification);

		// if the command is executed twice the value will be 48
		// test assertions
		expect(vo.result).toBe(48);
	});
});


class ControllerTestCommand extends SimpleCommand
{
	public async execute(notification: INotification<ControllerTestVO>): Promise<void>
	{
		const vo = notification.getBody();

		// Fabricate a result
		vo.result = 2 * vo.input;
	}
}

class ControllerTestCommand2 extends SimpleCommand
{
	public async execute(notification: INotification<ControllerTestVO>): Promise<void>
	{
		const vo = notification.getBody();

		// Fabricate a result
		vo.result = vo.result + (2 * vo.input);
	}
}

class ControllerTestVO
{
	#input: number;

	public result: number = 0;

	constructor(input: number)
	{
		this.#input = input;
	}

	public get input(): number
	{
		return this.#input
	}
}