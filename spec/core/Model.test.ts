import { Model, IModel, Proxy, IProxy } from "puremvc";

describe("Model Test", () =>
{
	let model: IModel;

	beforeEach(() =>
	{
		model = Model.getInstance();
	});

	it("Get Instance", () =>
	{
		// Test Factory Method
		expect(model).not.toBeNull();
		expect(model).toBeInstanceOf(Model);
	});

	it("Register and Retrieve Proxy", () =>
	{
		model.registerProxy(new Proxy("colors", ["red", "green", "blue"]));

		const proxy = model.retrieveProxy("colors");

		expect(proxy).not.toBeNull();

		const data = proxy.getData() as string[];

		expect(data).not.toBeNull();
		expect(data).toBeInstanceOf(Array);
		expect(data.length).toBe(3);
		expect(data[0]).toBe("red");
		expect(data[1]).toBe("green");
		expect(data[2]).toBe("blue");
	});

	it("Register and Remove Proxy", () =>
	{
		let proxy = new Proxy("sizes", [7, 13, 21]);
		model.registerProxy(proxy);

		const removedProxy = model.removeProxy("sizes");
		expect(removedProxy.getProxyName()).toBe("sizes");

		proxy = model.retrieveProxy("sizes");
		expect(proxy).toBeUndefined();
	});

	it("Has Proxy", () =>
	{
		const proxy = new Proxy("aces", ["clubs", "spades", "hearts", "diamonds"]);
		model.registerProxy(proxy);

		expect(model.hasProxy("aces")).toBe(true);

		model.removeProxy("aces");

		expect(model.hasProxy("aces")).toBe(false);
	});

	it ("OnRegister and OnRemove", () =>
	{
		const proxy = new ModelTestProxy();
		model.registerProxy(proxy);

		expect(proxy.getData()).toBe(ModelTestProxy.ON_REGISTER_CALLED);

		model.removeProxy(ModelTestProxy.NAME);

		expect(proxy.getData()).toBe(ModelTestProxy.ON_REMOVE_CALLED);
	});

});


class ModelTestProxy extends Proxy
	implements IProxy
{
	/**
	 * Constructs a <code>ModelTestProxy</code> instance passing super its default name and
	 * an empty string initializer.
	 */
	constructor()
	{
		super( ModelTestProxy.NAME, '' );
	}

	/**
	 * @override.
	 */
	public override onRegister():void
	{
		this.setData( ModelTestProxy.ON_REGISTER_CALLED );
	}

	/**
	 * @override.
	 */
	public override onRemove():void
	{
		this.setData( ModelTestProxy.ON_REMOVE_CALLED );
	}

	/**
	 * @constant
	 */
	public static NAME:string = 'ModelTestProxy';

	/**
	 * @constant
	 */
	public static ON_REGISTER_CALLED:string = 'onRegister Called';

	/**
	 * @constant
	 */
	public static ON_REMOVE_CALLED:string = 'onRemove Called';
}