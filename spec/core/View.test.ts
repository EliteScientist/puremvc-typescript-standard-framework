import { View, IView, Observer, Notification, INotification, Mediator, IMediator } from "puremvc";

describe("Model Test", () =>
{
	let view: IView;

	beforeEach(() =>
	{
		view = View.getInstance();
	});

	it("Get Instance", () =>
	{
		// Test Factory Method
		expect(view).not.toBeNull();
		expect(view).toBeInstanceOf(View);
	});

	it("Register and Notify Observer", () =>
	{
		let testVariable: number = -1;

		const observer = new Observer((notification: INotification) => {
			testVariable = notification.getBody();
		}, {});

		view.registerObserver(ViewTestNote.NAME, observer);

		const notification = ViewTestNote.create(10);
		view.notifyObservers(notification);

		expect(testVariable).toBe(10);

	});

	it("Register and Retrieve Mediator", () =>
	{
		const mediator = new ViewTestMediator({});
		view.registerMediator(mediator);

		expect(view.retrieveMediator(ViewTestMediator.NAME)).toBe(mediator);
	});

	it("Has Mediator", () =>
	{
		const mediator = new Mediator("hasMediatorTest", {});
		view.registerMediator(mediator);

		expect(view.hasMediator("hasMediatorTest")).toBe(true);

		view.removeMediator("hasMediatorTest");

		expect(view.hasMediator("hasMediatorTest")).toBe(false);
	});

	it("Register and Remove Mediator", () =>
	{
		const mediator = new Mediator("testing", {});
		view.registerMediator(mediator);

		const removedMediator = view.removeMediator("testing");

		expect(removedMediator.getMediatorName()).toBe("testing");

		const retrievedMediator = view.retrieveMediator("testing");

		expect(retrievedMediator).toBeUndefined();
	});

	it("OnRegister and OnRemove", () =>
	{
		const viewable = {
			onRegisterCalled: false,
			onRemoveCalled: false
		};

		const mediator = new ViewTestMediator4(viewable);
		view.registerMediator(mediator);

		expect(viewable.onRegisterCalled).toBe(true);

		view.removeMediator(ViewTestMediator4.NAME);

		expect(viewable.onRemoveCalled).toBe(true);
	});
});

class ViewTestNote
	extends Notification
	implements INotification
{
	/**
	 * Constructs a <code>Notification</code> subclass instance.
	 *
	 * @param name
	 *		Ignored and forced to NAME.
		*
		* @param body
		*		The body of the Notification to be constructed.
		*/
	constructor( name:string, body:any )
	{
		super( ViewTestNote.NAME, body );
	}

	/**
	 * The name of this Notification.
	 */
	public static NAME:string = "ViewTestNote";

	/**
	 * Factory method.
	 *
	 * This method creates new instances of the ViewTestNote class,
	 * automatically setting the notification name so you don't have to. Use
	 * this as an alternative to the constructor.
	 *
	 * @param body
	 * 		The body of the Notification to be constructed.
	 *
	 * @return
	 *		The created <code>Notification</code>
		*/
	public static create( body:any ): INotification
	{
		return new ViewTestNote( ViewTestNote.NAME, body );
	}
}

class ViewTestMediator
	extends Mediator
	implements IMediator
{
	/**
	 * Constructs a <code>Mediator</code> subclass instance.
	 *
	 * @param view
	 *		The view component handled by this <code>Mediator</code>.
		*/
	constructor( view:any )
	{
		super( ViewTestMediator.NAME, view );
	}

	/**
	 * @override
	 *
	 * @return
	 * 		The list of notifications names in which is interested the <code>Mediator</code>.
	 */
	public listNotificationInterests():string[]
	{
		// Be sure that the mediator has some Observers created in order to test removeMediator.
		return [ 'ABC', 'DEF', 'GHI' ];
	}

	/**
	 * The Mediator name.
	 *
	 * @constant
	 */
	public static NAME:string = "ViewTestMediator";
}

class ViewTestMediator4 extends Mediator
	implements IMediator
{
	/**
	 * Constructs a <code>Mediator</code> subclass instance.
	 *
	 * @param view
	 *		The view component handled by this <code>Mediator</code>.
		*/
	constructor( view:any )
	{
		super( ViewTestMediator4.NAME, view );
	}

	/**
	 * Standard getter to return the view handled by the <code>Mediator</code>.
	 *
	 * @return
	 * 		The view handled by the <code>Mediator</code>.
	 */
	public getViewTest():any
	{
		return this.viewComponent;
	}

	/**
	 * @override
	 */
	public onRegister(): void
	{
		this.getViewTest().onRegisterCalled = true;
	}

	/**
	 * @override
	 */
	public onRemove(): void
	{
		this.getViewTest().onRemoveCalled = true;
	}

	/**
	 * The Mediator name.
	 *
	 * @constant
	 */
	public static NAME:string = 'ViewTestMediator4';
}