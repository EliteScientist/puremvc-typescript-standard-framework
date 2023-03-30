/**
 * The interface definition for a PureMVC notification.
 *
 * PureMVC does not rely upon underlying event models such as the one provided in JavaScript DOM API,
 * and TypeScript does not have an inherent event model.
 *
 * The Observer pattern as implemented within PureMVC exists to support event-driven
 * communication between the application and the actors of the MVC triad (Model, View and
 * Controller).
 *
 * Notifications are not meant to be a replacement for Events in Javascript.
 * Generally, <code>IMediator</code> implementors place event listeners on their view components,
 * which they then handle in the usual way. This may lead to the broadcast of
 * <code>INotification</code>s to trigger <code>ICommand</code>s or to communicate with other
 * <code>IMediators</code>. <code>IProxy</code> and <code>ICommand</code> instances communicate
 * with each other and <code>IMediator</code>s by broadcasting <code>INotification</code>s.
 *
 * A key difference between JavaScript <code>Event</code>s and PureMVC
 * <code>INotification</code>s is that <code>Event</code>s follow the 'Chain of Responsibility'
 * pattern, 'bubbling' up the display hierarchy until some parent component handles the
 * <code>Event</code>, while PureMVC <code>INotification</code>s follow a 'Publish/Subscribe'
 * pattern. PureMVC classes need not be related to each other in a parent/child relationship in
 * order to communicate with one another using <code>INotification</code>s.
 */
interface INotification {
    /**
     * Get the name of the <code>Notification</code> instance.
     *
     * @return
     *		The name of the <code>Notification</code> instance.
        */
    getName(): string;
    /**
     * Set the body of the <code>INotification</code>.
     *
     * @param body
     * 		The body of the notification instance.
     */
    setBody(body: any): void;
    /**
     * Get the body of the <code>INotification</code>.
     *
     * @return
     *		The body object of the <code>INotification</code>.
        */
    getBody(): any;
    /**
     * Set the type of the <code>INotification</code>.
     *
     * @param type
     * 		The type identifier for the notification.
     */
    setType(type: string): void;
    /**
     * Get the type of the <code>INotification</code>.
     *
     * @return
     *		The type of the <code>INotification</code>.
        */
    getType(): string | undefined;
    /**
     * Get a textual representation of the <code>Notification</code> instance.
     *
     * @return
     * 		The textual representation of the <code>Notification</code>	instance.
     */
    toString(): string;
}

/**
 * The interface definition for a PureMVC <code>Notifier</code>.
 *
 * <code>MacroCommand</code>, <code>SimpleCommand</code>, <code>Mediator</code> and
 * <code>Proxy</code> all have a need to send <code>Notifications</code>.
 *
 * The <code>INotifier</code> interface provides a common method called
 * <code>sendNotification</code> that relieves implementation code of the necessity to actually
 * construct <code>Notification</code>s.
 *
 * The <code>INotifier</code> interface, which all of the above mentioned classes extend,
 * provides an initialized reference to the <code>Facade</code> singleton, which is required by
 * the convenience method <code>sendNotification</code>	for sending <code>Notifications</code>,
 * but it also eases implementation as these classes have frequent <code>Facade</code>
 * interactions and usually require access to the facade anyway.
 */
interface INotifier {
    /**
     * Create and send a <code>Notification</code>.
     *
     * Keeps us from having to construct new <code>Notification</code> instances in our
     * implementation code.
     *
     * @param name
     * 		The name of the notification to send.
     *
     * @param body
     * 		The body of the notification (optional).
     *
     * @param type
     * 		The type of the notification (optional).
     */
    sendNotification(name: string, body?: any, type?: string): Promise<void>;
}

/**
 * The interface definition for a PureMVC Command.
 */
interface ICommand extends INotifier {
    /**
     * Fulfill the use-case initiated by the given <code>INotification</code>.
     *
     * In the Command Pattern, an application use-case typically begins with some user action,
     * which results in an <code>INotification</code> being broadcast, which is handled by
     * business logic in the <code>execute</code> method of an <code>ICommand</code>.
     *
     * @param notification
     * 		The <code>INotification</code> to handle.
     */
    execute(notification: INotification): Promise<void>;
}
interface CommandConstructor {
    new (args?: any): ICommand;
}

/**
 * The interface definition for a PureMVC Controller.
 *
 * In PureMVC, an <code>IController</code> implementor follows the 'Command and Controller'
 * strategy, and assumes these responsibilities:
 * <UL>
 * <LI>Remembering which <code>ICommand</code>s are intended to handle which
 * <code>INotification</code>s.
 * <LI>Registering itself as an <code>IObserver</code> with the <code>View</code> for each
 * <code>INotification</code> that it has an <code>ICommand</code> mapping for.
 * <LI>Creating a new instance of the proper <code>ICommand</code> to handle a given
 * <code>INotification</code> when notified by the <code>View</code>.
 * <LI>Calling the <code>ICommand</code>'s <code>execute</code> method, passing in the
 * <code>INotification</code>.
 *
 * Your application must register <code>ICommand</code>s with the <code>Controller</code>.
 *
 * The simplest way is to subclass </code>Facade</code>, and use its
 * <code>initializeController</code> method to add your registrations.
 */
interface IController {
    /**
     * If an <code>ICommand</code> has previously been registered to handle the given
     * <code>INotification</code>, then it is executed.
     *
     * @param notification
     * 		The <code>INotification</code> the command will receive as parameter.
     */
    executeCommand(notification: INotification): Promise<void>;
    /**
     * Register a particular <code>ICommand</code> class as the handler for a particular
     * <code>INotification</code>.
     *
     * If an <code>ICommand</code> has already been registered to handle
     * <code>INotification</code>s with this name, it is no longer used, the new
     * <code>ICommand</code> is used instead.
     *
     * The <code>Observer</code> for the new <code>ICommand</code> is only created if this the
     * first time an <code>ICommand</code> has been registered for this
     * <code>Notification</code> name.
     *
     * @param notificationName
     * 		The name of the <code>INotification</code>.
     *
     * @param commandClassRef
     * 		The constructor of the <code>ICommand</code> implementor.
     */
    registerCommand(notificationName: string, commandClassRef: Function): void;
    /**
     * Check if an <code>ICommand</code> is registered for a given <code>Notification</code>.
     *
     * @param notificationName
     * 		Name of the <code>Notification</code> to check wheter an <code>ICommand</code> is
     * 		registered for.
     *
     * @return
     * 		An <code>ICommand</code> is currently registered for the given
     *		<code>notificationName</code>.
        */
    hasCommand(notificationName: string): boolean;
    /**
     * Remove a previously registered <code>ICommand</code> to <code>INotification</code>
     * mapping.
     *
     * @param notificationName
     * 		The name of the <code>INotification</code> to remove the <code>ICommand</code>
     * 		mapping for.
     */
    removeCommand(notificationName: string): void;
    dispose(): Promise<void>;
}

/**
 * The interface definition for a PureMVC Mediator.
 *
 * In PureMVC, <code>IMediator</code> implementors assume these responsibilities:
 * <UL>
 * <LI>Implement a common method which returns a list of all <code>INotification</code>s
 * the <code>IMediator</code> has interest in.
 * <LI>Implement a notification callback method.
 * <LI>Implement methods that are called when the IMediator is registered or removed from the View.
 *
 * Additionally, <code>IMediator</code>s typically:
 * <UL>
 * <LI>Act as an intermediary between one or more view components such as text boxes or
 * list controls, maintaining references and coordinating their behavior.
 * <LI>In a PureMVC application, this the place where event listeners are added to view
 * components, and their handlers implemented.
 * <LI>Respond to and generate <code>INotifications</code>, interacting with of the rest of the
 * PureMVC application.
 *
 * When an <code>IMediator</code> is registered with the <code>IView</code>,
 * the <code>IView</code> will call the <code>IMediator</code>'s
 * <code>listNotificationInterests</code> method. The <code>IMediator</code> will
 * return a list of <code>INotification</code> names which
 * it wishes to be notified about.
 *
 * The <code>IView</code> will then create an <code>Observer</code> object
 * encapsulating that <code>IMediator</code>'s (<code>handleNotification</code>) method
 * and register it as an Observer for each <code>INotification</code> name returned by
 * <code>listNotificationInterests</code>.
 */
interface IMediator<ViewType = unknown> extends INotifier {
    /**
     * Get the <code>IMediator</code> instance name
     *
     * @return
     * 		The <code>IMediator</code> instance name
     */
    getMediatorName(): string;
    /**
     * Get the <code>Mediator</code>'s view component.
     *
     * Additionally, an implicit getter will usually be defined in the subclass that casts the
     * view object to a type, like this:
     *
     * <code>
     *		getMenu: function
        *		{
        *			return this.viewComponent;
        *		}
        * </code>
        *
        * @return
        * 		The <code>Mediator</code>'s view component.
        */
    getViewComponent(): ViewType | undefined;
    get viewComponent(): ViewType | undefined;
    /**
     * Set the <code>IMediator</code>'s view component.
     *
     * @param viewComponent
     * 		The default view component to set for this <code>Mediator</code>.
     */
    setViewComponent(viewComponent: ViewType): void;
    /**
     * List the <code>INotification</code> names this <code>IMediator</code> is interested in
     * being notified of.
     *
     * @return
     * 		The list of notifications names in which is interested the <code>Mediator</code>.
     */
    listNotificationInterests(): string[];
    /**
     * Handle <code>INotification</code>s.
     *
     *
     * Typically this will be handled in a switch statement, with one 'case' entry per
     * <code>INotification</code> the <code>Mediator</code> is interested in.
     *
     * @param notification
     * 		The notification instance to be handled.
     */
    handleNotification(notification: INotification): Promise<void>;
    /**
     * Called by the View when the Mediator is registered. This method has to be overridden
     * by the subclass to know when the instance is registered.
     */
    onRegister(): void;
    /**
     * Called by the View when the Mediator is removed. This method has to be overridden
     * by the subclass to know when the instance is removed.
     */
    onRemove(): void;
}

/**
 * The interface definition for a PureMVC Proxy.
 *
 * In PureMVC, <code>IProxy</code> implementors assume these responsibilities:
 * <UL>
 * <LI>Implement a common method which returns the name of the Proxy.
 * <LI>Provide methods for setting and getting the data object.
 *
 * Additionally, <code>IProxy</code>s typically:
 * <UL>
 * <LI>Maintain references to one or more pieces of model data.
 * <LI>Provide methods for manipulating that data.
 * <LI>Generate <code>INotifications</code> when their model data changes.
 * <LI>Expose their name as a <code>constant</code> called <code>NAME</code>, if they are not
 * instantiated multiple times.
 * <LI>Encapsulate interaction with local or remote services used to fetch and persist model
 * data.
 */
interface IProxy<DataType = unknown> extends INotifier {
    /**
     * Get the name of the <code>IProxy></code> instance.
     *
     * @return
     * 		The name of the <code>IProxy></code> instance.
     */
    getProxyName(): string;
    /**
     * Set the data of the <code>IProxy></code> instance.
     *
     * @param data
     * 		The data to set for the <code>IProxy></code> instance.
     */
    setData(data: DataType): void;
    /**
     * Get the data of the <code>IProxy></code> instance.
     *
     * @return
     * 		The data held in the <code>IProxy</code> instance.
     */
    getData(): DataType;
    /**
     * Called by the Model when the <code>IProxy</code> is registered. This method has to be
     * overridden by the subclass to know when the instance is registered.
     */
    onRegister(): void;
    /**
     * Called by the Model when the <code>IProxy</code> is removed. This method has to be
     * overridden by the subclass to know when the instance is removed.
     */
    onRemove(): void;
}

/**
 * The interface definition for a PureMVC Facade.
 *
 *
 * The Facade Pattern suggests providing a single class to act as a central point of
 * communication for a subsystem.
 *
 *
 * In PureMVC, the Facade acts as an interface between the core MVC actors (Model, View,
 * Controller) and the rest of your application.
 */
interface IFacade extends INotifier {
    /**
     * Register an <code>ICommand</code> with the <code>IController</code> associating it to a
     * <code>INotification</code> name.
     *
     * @param notificationName
     *		The name of the <code>INotification</code> to associate the <code>ICommand</code>
        *		with.
        *
        * @param commandClassRef
        * 		A reference to the constructor of the <code>ICommand</code>.
        */
    registerCommand(notificationName: string, commandClassRef: CommandConstructor): void;
    /**
     * Remove a previously registered <code>ICommand</code> to <code>INotification</code>
     * mapping from the <code>Controller</code>.
     *
     * @param notificationName
     *		The name of the <code>INotification</code> to remove the <code>ICommand</code>
        *		mapping for.
        */
    removeCommand(notificationName: string): void;
    /**
     * Check if an <code>ICommand</code> is registered for a given <code>Notification</code>.
     *
     * @param notificationName
     * 		The name of the <code>INotification</code> to verify for the existence of a
     * 		<code>ICommand</code> mapping for.
     *
     * @return
     * 		A <code>Command</code> is currently registered for the given
     *		<code>notificationName</code>.
        */
    hasCommand(notificationName: string): boolean;
    /**
     * Register an <code>IProxy</code> with the <code>Model</code> by name.
     *
     * @param proxy
     *		The <code>IProxy</code> to be registered with the <code>Model</code>.
        */
    registerProxy(proxy: IProxy): void;
    /**
     * Retrieve an <code>IProxy</code> from the <code>Model</code> by name.
     *
     * @param proxyName
     * 		The name of the <code>IProxy</code> to be retrieved.
     *
     * @return
     * 		The <code>IProxy</code> previously registered with the given <code>proxyName</code>.
     */
    retrieveProxy(proxyName: string): IProxy | undefined;
    /**
     * Remove an <code>IProxy</code> from the <code>Model</code> by name.
     *
     * @param proxyName
     *		The <code>IProxy</code> to remove from the <code>Model</code>.
        *
        * @return
        *		The <code>IProxy</code> that was removed from the <code>Model</code>
        */
    removeProxy(proxyName: string): IProxy | undefined;
    /**
     * Check if a <code>Proxy</code> is registered.
     *
     * @param proxyName
     * 		The <code>IProxy</code> to verify the existence of a registration with the
     *		<code>IModel</code>.
        *
        * @return
        * 		A <code>Proxy</code> is currently registered with the given	<code>proxyName</code>.
        */
    hasProxy(proxyName: string): boolean;
    /**
     * Register a <code>IMediator</code> with the <code>IView</code>.
     *
     * @param mediator
            A reference to the <code>IMediator</code>.
        */
    registerMediator(mediator: IMediator): void;
    /**
     * Retrieve an <code>IMediator</code> from the <code>IView</code>.
     *
     * @param mediatorName
     * 		The name of the registered <code>Mediator</code> to retrieve.
     *
     * @return
     *		The <code>IMediator</code> previously registered with the given
        *		<code>mediatorName</code>.
        */
    retrieveMediator(mediatorName: string): IMediator | undefined;
    /**
     * Remove an <code>IMediator</code> from the <code>IView</code>.
     *
     * @param mediatorName
     * 		Name of the <code>IMediator</code> to be removed.
     *
     * @return
     *		The <code>IMediator</code> that was removed from the <code>IView</code>
        */
    removeMediator(mediatorName: string): IMediator | undefined;
    /**
     * Check if a Mediator is registered or not
     *
     * @param mediatorName
     * 		The name of the <code>IMediator</code> to verify the existence of a registration
     *		for.
        *
        * @return
        * 		An <code>IMediator</code> is registered with the given <code>mediatorName</code>.
        */
    hasMediator(mediatorName: string): boolean;
    /**
     * Notify the <code>IObservers</code> for a particular <code>INotification</code>.
     *
     * This method is left public mostly for backward compatibility, and to allow you to send
     * custom notification classes using the facade.
     *
     * Usually you should just call sendNotification and pass the parameters, never having to
     * construct the notification yourself.
     *
     * @param notification
     * 		The <code>INotification</code> to have the <code>IView</code> notify
     *		<code>IObserver</code>s	of.
     */
    notifyObservers(notification: INotification): Promise<void>;
    dispose(): Promise<void>;
}

/**
 * The interface definition for a PureMVC Model.
 *
 * In PureMVC, the <code>IModel</code> class provides access to model objects
 * <code>Proxie</code>s by named lookup.
 *
 * The <code>Model</code> assumes these responsibilities:
 * <UL>
 * <LI>Maintain a cache of <code>IProxy</code> instances.
 * <LI>Provide methods for registering, retrieving, and removing <code>Proxy</code> instances.
 *
 * Your application must register <code>IProxy</code> instances with the <code>Model</code>.
 * Typically, you use an <code>ICommand</code> to create and register <code>Proxy</code> instances
 * once the <code>Facade</code> has initialized the Core actors.
 */
interface IModel {
    /**
     * Register an <code>IProxy</code> with the <code>Model</code>.
     *
     * @param proxy
     *		An <code>IProxy</code> to be held by the <code>Model</code>.
        */
    registerProxy(proxy: IProxy): void;
    /**
     * Remove an <code>IProxy</code> from the <code>Model</code>.
     *
     * @param proxyName
     *		The name of the <code>Proxy</code> instance to be removed.
        *
        * @return
        *		The <code>IProxy</code> that was removed from the <code>Model</code> or an
        *		explicit <code>null</null> if the <code>IProxy</code> didn't exist.
        */
    removeProxy(proxyName: string): IProxy | undefined;
    /**
     * Retrieve an <code>IProxy</code> from the <code>Model</code>.
     *
     * @param proxyName
     *		 The <code>IProxy</code> name to retrieve from the <code>Model</code>.
        *
        * @return
        *		The <code>IProxy</code> instance previously registered with the given
        *		<code>proxyName</code> or an explicit <code>null</code> if it doesn't exists.
        */
    retrieveProxy(proxyName: string): IProxy | undefined;
    /**
     * Check if a Proxy is registered
     *
     * @param proxyName
     *		The name of the <code>IProxy</code> to verify the existence of its registration.
     *
     * @return
     *		A Proxy is currently registered with the given <code>proxyName</code>.
     */
    hasProxy(proxyName: string): boolean;
    dispose(): Promise<void>;
}

/**
 * The interface definition for a PureMVC Observer.
 *
 * In PureMVC, <code>IObserver</code> implementors assumes these responsibilities:
 * <UL>
 * <LI>Encapsulate the notification (callback) method of the interested object.
 * <LI>Encapsulate the notification context (this) of the interested object.
 * <LI>Provide methods for setting the interested object notification method and context.
 * <LI>Provide a method for notifying the interested object.
 *
 * PureMVC does not rely upon underlying event models such as the one provided in JavaScript DOM API,
 * and JavaScript does not have an inherent event model.
 *
 * The Observer Pattern as implemented within PureMVC exists to support event driven
 * communication between the application and the actors of the MVC triad (Model, View, Controller).
 *
 * An Observer is an object that encapsulates information about an interested object with a
 * notification method that should be called when an </code>INotification</code> is broadcast.
 * The Observer then acts as a proxy for notifying the interested object.
 *
 * Observers can receive <code>Notification</code>s by having their <code>notifyObserver</code>
 * method invoked, passing in an object implementing the <code>INotification</code> interface,
 * such as a subclass of <code>Notification</code>.
 */
interface IObserver {
    /**
     * Set the notification method.
     *
     * The notification method should take one parameter of type <code>INotification</code>.
     *
     * @param notifyMethod
     * 		The notification (callback) method of the interested object.
     */
    setNotifyMethod(notifyMethod: Function): void;
    /**
    /**
     * Set the notification context.
     *
     * @param notifyContext
     * 		The notification context (this) of the interested object.
     */
    setNotifyContext(notifyContext: any): void;
    /**
     * Notify the interested object.
     *
     * @param notification
     * 		The <code>INotification</code> to pass to the interested object's notification
     * 		method.
     */
    notifyObserver(notification: INotification): Promise<void>;
    /**
     * Compare an object to the notification context.
     *
     * @param object
     * 		The object to compare.
     *
     * @return
     * 		The object and the notification context are the same.
     */
    compareNotifyContext(object: any): boolean;
}

/**
 * The interface definition for a PureMVC view.
 *
 * In PureMVC, <code>IView</code> implementors assume these responsibilities:
 *
 * In PureMVC, the <code>View</code> class assumes these responsibilities:
 * <UL>
 * <LI>Maintain a cache of <code>IMediator</code> instances.
 * <LI>Provide methods for registering, retrieving, and removing <code>IMediator</code>s.
 * <LI>Notifiying <code>IMediator</code>s when they are registered or removed.
 * <LI>Managing the <code>Observer</code> lists for each <code>INotification</code> in the
 * application.
 * <LI>Providing a method for attaching <code>IObservers</code> to an
 * <code>INotification</code>'s <code>Observer</code> list.
 * <LI>Providing a method for broadcasting an <code>INotification</code>.
 * <LI>Notifying the <code>IObserver</code>s of a given <code>INotification</code> when it
 * broadcasts.
 */
interface IView {
    /**
     * Register an <code>IObserver</code> to be notified of <code>INotifications</code> with a
     * given name.
     *
     * @param notificationName
     * 		The name of the <code>INotifications</code> to notify this <code>IObserver</code>
     * 		of.
     *
     * @param observer
     * 		The <code>IObserver</code> to register.
     */
    registerObserver(notificationName: string, observer: IObserver): void;
    /**
     * Remove a list of <code>Observer</code>s for a given <code>notifyContext</code> from an
     * <code>Observer</code> list for a given <code>INotification</code> name.
     *
     * @param notificationName
     * 		Which <code>IObserver</code> list to remove from.
     *
     * @param notifyContext
     * 		Remove the <code>IObserver</code> with this object as its
     *		<code>notifyContext</code>.
        */
    removeObserver(notificationName: string, notifyContext: any): void;
    /**
     * Notify the <code>IObserver</code>s for a particular <code>INotification</code>.
     *
     * All previously attached <code>IObserver</code>s for this <code>INotification</code>'s
     * list are notified and are passed a reference to the <code>INotification</code> in the
     * order in which they were registered.
     *
     * @param notification
     * 		The <code>INotification</code> to notify <code>IObserver</code>s of.
     */
    notifyObservers(notification: INotification): void;
    /**
     * Register an <code>IMediator</code> instance with the <code>View</code>.
     *
     * Registers the <code>IMediator</code> so that it can be retrieved by name, and further
     * interrogates the <code>IMediator</code> for its <code>INotification</code> interests.
     *
     * If the <code>IMediator</code> returns any <code>INotification</code> names to be
     * notified about, an <code>Observer</code> is created to encapsulate the
     * <code>IMediator</code> instance's <code>handleNotification</code> method and register
     * it as an <code>Observer</code> for all <code>INotification</code>s the
     * <code>IMediator</code> is interested in.
     *
     * @param mediator
     * 		A reference to an <code>IMediator</code> implementation instance.
     */
    registerMediator(mediator: IMediator): void;
    /**
     * Retrieve an <code>IMediator</code> from the <code>View</code>.
     *
     * @param mediatorName
     * 		The name of the <code>IMediator</code> instance to retrieve.
     *
     * @return
     * 		The <code>IMediator</code> instance previously registered with the given
     *		<code>mediatorName</code> or an explicit <code>null</code> if it doesn't exists.
        */
    retrieveMediator(mediatorName: string): IMediator | undefined;
    /**
     * Remove an <code>IMediator</code> from the <code>View</code>.
     *
     * @param mediatorName
     * 		Name of the <code>IMediator</code> instance to be removed.
     *
     * @return
     *		The <code>IMediator</code> that was removed from the <code>View</code> or a
        *		strict <code>null</null> if the <code>Mediator</code> didn't exist.
        */
    removeMediator(mediatorName: string): IMediator | undefined;
    /**
     * Check if a <code>IMediator</code> is registered or not.
     *
     * @param mediatorName
     * 		The <code>IMediator</code> name to check whether it is registered.
     *
     * @return
     *		A <code>Mediator</code> is registered with the given <code>mediatorName</code>.
        */
    hasMediator(mediatorName: string): boolean;
    dispose(): Promise<void>;
}

/**
 * The <code>Controller</code> class for PureMVC.
 *
 * A singleton <code>IController</code> implementation.
 *
 * In PureMVC, the <code>Controller</code> class follows the 'Command and Controller' strategy,
 * and assumes these responsibilities:
 *
 * <UL>
 * <LI>Remembering which <code>ICommand</code>s are intended to handle which
 * <code>INotification</code>s.
 * <LI>Registering itself as an <code>IObserver</code> with the <code>View</code> for each
 * <code>INotification</code> that it has an <code>ICommand</code> mapping for.
 * <LI>Creating a new instance of the proper <code>ICommand</code> to handle a given
 * <code>INotification</code> when notified by the <code>View</code>.
 * <LI>Calling the <code>ICommand</code>'s <code>execute</code> method, passing in the
 * <code>INotification</code>.
 *
 * Your application must register <code>ICommand</code>s with the <code>Controller</code>.
 *
 * The simplest way is to subclass </code>Facade</code>, and use its
 * <code>initializeController</code> method to add your registrations.
 */
declare class Controller implements IController {
    #private;
    /**
    /**
     * Constructs a <code>Controller</code> instance.
     *
     * This <code>IController</code> implementation is a singleton, so you should not call the
     * constructor directly, but instead call the static singleton Factory method
     * <code>Controller.getInstance()</code>.
     *
     * @throws Error
     * 		Throws an error if an instance for this singleton has already been constructed.
     */
    constructor();
    /**
     * Initialize the singleton <code>Controller</code> instance.
     *
     * Called automatically by the constructor.
     *
     * Note that if you are using a subclass of <code>View</code> in your application, you
     * should <i>also</i> subclass <code>Controller</code> and override the
     * <code>initializeController</code> method in the following way:
     *
     * <pre>
     *		// ensure that the Controller is talking to my IView implementation
        *		initializeController():void
        *		{
        *			this.view = MyView.getInstance();
        *		}
        * </pre>
        *
        * @protected
        */
    protected initializeController(): void;
    /**
     * If an <code>ICommand</code> has previously been registered to handle the given
     * <code>INotification</code>, then it is executed.
     *
     * @param notification
     * 		The <code>INotification</code> the command will receive as parameter.
     */
    executeCommand(notification: INotification): Promise<void>;
    /**
     * Register a particular <code>ICommand</code> class as the handler for a particular
     * <code>INotification</code>.
     *
     * If an <code>ICommand</code> has already been registered to handle
     * <code>INotification</code>s with this name, it is no longer used, the new
     * <code>ICommand</code> is used instead.
     *
     * The <code>Observer</code> for the new <code>ICommand</code> is only created if this the
     * first time an <code>ICommand</code> has been registered for this
     * <code>Notification</code> name.
     *
     * @param notificationName
     * 		The name of the <code>INotification</code>.
     *
     * @param commandClassRef
     * 		The constructor of the <code>ICommand</code>.
     */
    registerCommand(notificationName: string, commandClass: CommandConstructor): void;
    /**
     * Check if an <code>ICommand</code> is registered for a given <code>Notification</code>.
     *
     * @param notificationName
     * 		Name of the <code>Notification</code> to check wheter an <code>ICommand</code> is
     * 		registered for.
     *
     * @return
     * 		An <code>ICommand</code> is currently registered for the given
     * 		<code>notificationName</code>.
     */
    hasCommand(notificationName: string): boolean;
    /**
     * Remove a previously registered <code>ICommand</code> to <code>INotification</code>
     * mapping.
     *
     * @param notificationName
     * 		The name of the <code>INotification</code> to remove the <code>ICommand</code>
     * 		mapping for.
     */
    removeCommand(notificationName: string): void;
    dispose(): Promise<void>;
    /**
     * Singleton instance local reference.
     *
     * @protected
     */
    private static instance;
    /**
     * Error message used to indicate that a controller singleton is already constructed when
     * trying to constructs the class twice.
     *
     * @protected
     * @constant
     */
    private static SINGLETON_MSG;
    /**
     * <code>Controller</code> singleton Factory method.
     *
     * @return
     * 		The singleton instance of <code>Controller</code>
     */
    static getInstance(): IController;
}

/**
 * The <code>Model</code> class for PureMVC.
 *
 * A singleton <code>IModel</code> implementation.
 *
 * In PureMVC, the <code>IModel</code> class provides access to model objects
 * <code>Proxie</code>s by named lookup.
 *
 * The <code>Model</code> assumes these responsibilities:
 * <UL>
 * <LI>Maintain a cache of <code>IProxy</code> instances.
 * <LI>Provide methods for registering, retrieving, and removing <code>Proxy</code> instances.
 *
 * Your application must register <code>IProxy</code> instances with the <code>Model</code>.
 * Typically, you use an <code>ICommand</code> to create and register <code>Proxy</code> instances
 * once the <code>Facade</code> has initialized the Core actors.
 */
declare class Model implements IModel {
    #private;
    /**
     * This <code>IModel</code> implementation is a singleton, so you should not call the
     * constructor directly, but instead call the static singleton Factory method
     * <code>Model.getInstance()</code>.
     *
     * @throws Error
     * 		Error if singleton instance has already been constructed.
     */
    constructor();
    /**
     * Initialize the singleton <code>Model</code> instance.
     *
     * Called automatically by the constructor, this is the opportunity to initialize the
     * singleton instance in a subclass without overriding the constructor.
     *
     * @protected
     */
    protected initializeModel(): void;
    /**
     * Register an <code>IProxy</code> with the <code>Model</code>.
     *
     * @param proxy
     *		An <code>IProxy</code> to be held by the <code>Model</code>.
        */
    registerProxy(proxy: IProxy): void;
    /**
     * Remove an <code>IProxy</code> from the <code>Model</code>.
     *
     * @param proxyName
     *		The name of the <code>Proxy</code> instance to be removed.
     *
     * @return
     *		The <code>IProxy</code> that was removed from the <code>Model</code> or an
     *		explicit <code>null</null> if the <code>IProxy</code> didn't exist.
     */
    removeProxy(proxyName: string): IProxy | undefined;
    /**
     * Retrieve an <code>IProxy</code> from the <code>Model</code>.
     *
     * @param proxyName
     *		The <code>IProxy</code> name to retrieve from the <code>Model</code>.
     *
     * @return
     *		The <code>IProxy</code> instance previously registered with the given
     *		<code>proxyName</code> or an explicit <code>null</code> if it doesn't exists.
     */
    retrieveProxy(proxyName: string): IProxy | undefined;
    /**
     * Check if a Proxy is registered
     *
     * @param proxyName
     *		The name of the <code>IProxy</code> to verify the existence of its registration.
     *
     * @return
     *		A Proxy is currently registered with the given <code>proxyName</code>.
     */
    hasProxy(proxyName: string): boolean;
    dispose(): Promise<void>;
    /**
     * Error message used to indicate that a controller singleton is already constructed when
     * trying to constructs the class twice.
     *
     * @constant
     * @protected
     */
    private static SINGLETON_MSG;
    /**
     * singleton instance local reference.
     *
     * @protected
     */
    private static instance;
    /**
     * <code>Model</code> singleton factory method.
     *
     * @return
     * 		The singleton instance of <code>Model</code>.
     */
    static getInstance(): IModel;
}

/**
 * The <code>View</code> class for PureMVC.
 *
 * A singleton <code>IView</code> implementation.
 *
 * In PureMVC, the <code>View</code> class assumes these responsibilities:
 * <UL>
 * <LI>Maintain a cache of <code>IMediator</code> instances.
 * <LI>Provide methods for registering, retrieving, and removing <code>IMediator</code>s.
 * <LI>Notifiying <code>IMediator</code>s when they are registered or removed.
 * <LI>Managing the <code>Observer</code> lists for each <code>INotification</code> in the
 * application.
 * <LI>Providing a method for attaching <code>IObservers</code> to an
 * <code>INotification</code>'s <code>Observer</code> list.
 * <LI>Providing a method for broadcasting an <code>INotification</code>.
 * <LI>Notifying the <code>IObserver</code>s of a given <code>INotification</code> when it
 * broadcasts.
 */
declare class View implements IView {
    #private;
    /**
     * This <code>IView</code> implementation is a singleton, so you should not call the
     * constructor directly, but instead call the static singleton Factory method
     * <code>View.getInstance()</code>.
     *
     * @throws Error
     * 		Throws an error if an instance for this singleton has already been constructed.
     */
    constructor();
    /**
     * Initialize the singleton <code>View</code> instance.
     *
     * Called automatically by the constructor. This is the opportunity to initialize the
     * singleton instance in a subclass without overriding the constructor.
     */
    protected initializeView(): void;
    /**
     * Register an <code>IObserver</code> to be notified of <code>INotifications</code> with a
     * given name.
     *
     * @param notificationName
     * 		The name of the <code>INotifications</code> to notify this <code>IObserver</code>
     * 		of.
     *
     * @param observer
     * 		The <code>IObserver</code> to register.
     */
    registerObserver(notificationName: string, observer: IObserver): void;
    /**
     * Remove a list of <code>Observer</code>s for a given <code>notifyContext</code> from an
     * <code>Observer</code> list for a given <code>INotification</code> name.
     *
     * @param notificationName
     * 		Which <code>IObserver</code> list to remove from.
     *
     * @param notifyContext
     * 		Remove the <code>IObserver</code> with this object as its
     *		<code>notifyContext</code>.
     */
    removeObserver(notificationName: string, notifyContext: any): void;
    /**
     * Notify the <code>IObserver</code>s for a particular <code>INotification</code>.
     *
     * All previously attached <code>IObserver</code>s for this <code>INotification</code>'s
     * list are notified and are passed a reference to the <code>INotification</code> in the
     * order in which they were registered.
     *
     * @param notification
     * 		The <code>INotification</code> to notify <code>IObserver</code>s of.
     */
    notifyObservers(notification: INotification): Promise<void>;
    /**
     * Register an <code>IMediator</code> instance with the <code>View</code>.
     *
     * Registers the <code>IMediator</code> so that it can be retrieved by name, and further
     * interrogates the <code>IMediator</code> for its <code>INotification</code> interests.
     *
     * If the <code>IMediator</code> returns any <code>INotification</code> names to be
     * notified about, an <code>Observer</code> is created to encapsulate the
     * <code>IMediator</code> instance's <code>handleNotification</code> method and register
     * it as an <code>Observer</code> for all <code>INotification</code>s the
     * <code>IMediator</code> is interested in.
     *
     * @param mediator
     * 		A reference to an <code>IMediator</code> implementation instance.
     */
    registerMediator(mediator: IMediator): void;
    /**
     * Retrieve an <code>IMediator</code> from the <code>View</code>.
     *
     * @param mediatorName
     * 		The name of the <code>IMediator</code> instance to retrieve.
     *
     * @return
     * 		The <code>IMediator</code> instance previously registered with the given
     *		<code>mediatorName</code> or an explicit <code>null</code> if it doesn't exists.
     */
    retrieveMediator(mediatorName: string): IMediator | undefined;
    /**
     * Remove an <code>IMediator</code> from the <code>View</code>.
     *
     * @param mediatorName
     * 		Name of the <code>IMediator</code> instance to be removed.
     *
     * @return
     *		The <code>IMediator</code> that was removed from the <code>View</code> or a
     *		strict <code>null</null> if the <code>Mediator</code> didn't exist.
     */
    removeMediator(mediatorName: string): IMediator | undefined;
    /**
     * Check if a <code>IMediator</code> is registered or not.
     *
     * @param mediatorName
     * 		The <code>IMediator</code> name to check whether it is registered.
     *
     * @return
     *		A <code>Mediator</code> is registered with the given <code>mediatorName</code>.
     */
    hasMediator(mediatorName: string): boolean;
    dispose(): Promise<void>;
    /**
     * @constant
     * @protected
     */
    private static SINGLETON_MSG;
    /**
     * Singleton instance local reference.
     *
     * @protected
     */
    private static instance;
    /**
     * <code>View</code> singleton Factory method.
     *
     * @return
     *		The singleton instance of <code>View</code>.
        */
    static getInstance(): IView;
}

/**
 * A base <code>INotification</code> implementation.
 *
 * PureMVC does not rely upon underlying event models such as the one provided in JavaScript DOM API,
 * and TypeScript does not have an inherent event model.
 *
 * The Observer pattern as implemented within PureMVC exists to support event-driven
 * communication between the application and the actors of the MVC triad (Model, View and
 * Controller).
 *
 * Notifications are not meant to be a replacement for Events in Javascript.
 * Generally, <code>IMediator</code> implementors place event listeners on their view components,
 * which they then handle in the usual way. This may lead to the broadcast of
 * <code>INotification</code>s to trigger <code>ICommand</code>s or to communicate with other
 * <code>IMediators</code>. <code>IProxy</code> and <code>ICommand</code> instances communicate
 * with each other and <code>IMediator</code>s by broadcasting <code>INotification</code>s.
 *
 * A key difference between JavaScript <code>Event</code>s and PureMVC
 * <code>INotification</code>s is that <code>Event</code>s follow the 'Chain of Responsibility'
 * pattern, 'bubbling' up the display hierarchy until some parent component handles the
 * <code>Event</code>, while PureMVC <code>INotification</code>s follow a 'Publish/Subscribe'
 * pattern. PureMVC classes need not be related to each other in a parent/child relationship in
 * order to communicate with one another using <code>INotification</code>s.
 */
declare class Notification implements INotification {
    #private;
    /**
     * Constructs a <code>Notification</code> instance.
     *
     * @param name
     * 		The name of the notification.
     *
     * @param body
     * 		Body data to send with the <code>Notification</code>.
     *
     * @param type
     * 		Type identifier of the <code>Notification</code>.
     */
    constructor(name: string, body?: any, type?: string);
    /**
     * Get the name of the <code>Notification</code> instance.
     *
     * @return
     *		The name of the <code>Notification</code> instance.
        */
    getName(): string;
    /**
     * Set the body of the <code>Notification</code> instance.
     *
     * @param body
     * 		The body of the <code>Notification</code> instance.
     */
    setBody(body: any): void;
    /**
     * Get the body of the <code>Notification</code> instance.
     *
     * @return
     *		The body object of the <code>Notification</code> instance.
        */
    getBody(): any;
    /**
     * Set the type of the <code>Notification</code> instance.
     *
     * @param type
     * 		The type of the <code>Notification</code> instance.
     */
    setType(type: string): void;
    /**
     * Get the type of the <code>Notification</code> instance.
     *
     * @return
     *		The type of the <code>Notification</code> instance.
        */
    getType(): string | undefined;
    /**
     * Get a textual representation of the <code>Notification</code> instance.
     *
     * @return
     * 		The textual representation of the <code>Notification</code>	instance.
     */
    toString(): string;
}

/**
 * A base <code>INotifier</code> implementation.
 *
 * <code>MacroCommand</code>, <code>SimpleCommand</code>, <code>Mediator</code> and
 * <code>Proxy</code> all have a need to send <code>Notifications</code>.
 *
 * The <code>INotifier</code> interface provides a common method called
 * <code>sendNotification</code> that relieves implementation code of the necessity to actually
 * construct <code>Notification</code>s.
 *
 * The <code>INotifier</code> interface, which all of the above mentioned classes extend,
 * provides an initialized reference to the <code>Facade</code> singleton, which is required by
 * the convenience method <code>sendNotification</code>	for sending <code>Notifications</code>,
 * but it also eases implementation as these classes have frequent <code>Facade</code>
 * interactions and usually require access to the facade anyway.
 */
declare class Notifier implements INotifier {
    #private;
    /**
     * Constructs a <code>Notifier</code> instance.
     */
    constructor();
    get facade(): IFacade;
    /**
     * Create and send a <code>Notification</code>.
     *
     * Keeps us from having to construct new <code>Notification</code> instances in our
     * implementation code.
     *
     * @param name
     * 		The name of the notification to send.
     *
     * @param body
     * 		The body of the notification.
     *
     * @param type
     * 		The type of the notification.
     */
    sendNotification(name: string, body?: any, type?: string): Promise<void>;
}

/**
 * A base <code>IObserver</code> implementation.
 *
 * In PureMVC, the <code>Observer</code> class assumes these responsibilities:
 * <UL>
 * <LI>Encapsulate the notification (callback) method of the interested object.
 * <LI>Encapsulate the notification context (this) of the interested object.
 * <LI>Provide methods for setting the interested object notification method and context.
 * <LI>Provide a method for notifying the interested object.
 *
 * PureMVC does not rely upon underlying event models such as the one provided in JavaScript DOM API,
 * and TypeScript does not have an inherent event model.
 *
 * The Observer Pattern as implemented within PureMVC exists to support event driven
 * communication between the application and the actors of the MVC triad (Model, View, Controller).
 *
 * An Observer is an object that encapsulates information about an interested object with a
 * notification method that should be called when an </code>INotification</code> is broadcast.
 * The Observer then acts as a proxy for notifying the interested object.
 *
 * Observers can receive <code>Notification</code>s by having their <code>notifyObserver</code>
 * method invoked, passing in an object implementing the <code>INotification</code> interface,
 * such as a subclass of <code>Notification</code>.
 */
declare class Observer implements IObserver {
    /**
     * The notification method of the interested object.
     * @protected
     */
    notify: Function;
    /**
     * The notification context of the interested object.
     * @protected
     */
    context: any;
    /**
     * Constructs an <code>Observer</code> instance.
     *
     * @param notifyMethod
     * 		The notification method of the interested object.
     *
     * @param notifyContext
     * 		The notification context of the interested object.
     */
    constructor(notifyMethod: Function, notifyContext: any);
    /**
     * Get the notification method.
     *
     * @return
     * 		The notification (callback) method of the interested object.
     */
    private getNotifyMethod;
    /**
     * Set the notification method.
     *
     * The notification method should take one parameter of type <code>INotification</code>.
     *
     * @param notifyMethod
     * 		The notification (callback) method of the interested object.
     */
    setNotifyMethod(notifyMethod: Function): void;
    /**
     * Get the notification context.
     *
     * @return
     * 		The notification context (<code>this</code>) of the interested object.
     */
    private getNotifyContext;
    /**
     * Set the notification context.
     *
     * @param notifyContext
     * 		The notification context (this) of the interested object.
     */
    setNotifyContext(notifyContext: any): void;
    /**
     * Notify the interested object.
     *
     * @param notification
     * 		The <code>INotification</code> to pass to the interested object's notification
     * 		method.
     */
    notifyObserver(notification: INotification): Promise<void>;
    /**
     * Compare an object to the notification context.
     *
     * @param object
     * 		The object to compare.
     *
     * @return
     * 		The object and the notification context are the same.
     */
    compareNotifyContext(object: any): boolean;
}

/**
 * A base <code>ICommand</code> implementation that executes other <code>ICommand</code>s.
 *
 * A <code>MacroCommand</code> maintains an list of <code>ICommand</code> constructor references
 * called <i>SubCommand</i>s.
 *
 * When <code>execute</code> is called, the <code>MacroCommand</code> instantiates and calls
 * <code>execute</code> on each of its <i>SubCommands</i> turn. Each <i>SubCommand</i> will be
 * passed a reference to the original <code>INotification</code> that was passed to the
 * <code>MacroCommand</code>'s <code>execute</code> method.
 *
 * Unlike <code>SimpleCommand</code>, your subclass should not override <code>execute</code>,
 * but instead, should override the <code>initializeMacroCommand</code> method, calling
 * <code>addSubCommand</code> once for each <i>SubCommand</i> to be executed.
 */
declare class MacroCommand extends Notifier implements ICommand, INotifier {
    #private;
    /**
     * Constructs a <code>MacroCommand</code> instance.
     *
     * You should not need to define a constructor in your subclasses, instead, override the
     * <code>initializeMacroCommand</code> method.
     *
     * If your subclass does define a constructor, be  sure to call <code>super()</code>.
     */
    constructor(sequentialExeuction?: boolean);
    /**
     * Initialize the <code>MacroCommand</code>.
     *
     * In your subclass, override this method to  initialize the <code>MacroCommand</code>'s
     * <i>SubCommand</i> list with <code>ICommand</code> class references like this:
     *
     * <pre>
     *		// Initialize MyMacroCommand
        *		initializeMacroCommand():void
        *		{
        *			this.addSubCommand( FirstCommand );
        *			this.addSubCommand( SecondCommand );
        *			this.addSubCommand( ThirdCommand );
        *		}
        * </pre>
        *
        * Note that <i>subCommand</i>s may be any <code>ICommand</code> implementor so
        * <code>MacroCommand</code>s or <code>SimpleCommand</code>s are both acceptable.
        */
    initializeMacroCommand(): void;
    /**
     * Add an entry to the <i>subCommands</i> list.
     *
     * The <i>subCommands</i> will be called in First In/First Out (FIFO) order.
     *
     * @param commandClassRef
     *		A reference to the constructor of the <code>ICommand</code>.
        */
    protected addSubCommand(commandClass: CommandConstructor): void;
    /**
     * Execute this <code>MacroCommand</code>'s <i>SubCommands</i>.
     *
     * The <i>SubCommands</i> will be called in First In/First Out (FIFO)
     * order.
     *
     * @param notification
     *		The <code>INotification</code> object to be passed to each <i>SubCommand</i> of
        *		the list.
        *
        * @final
        */
    execute(notification: INotification): Promise<void>;
}

/**
 * A base <code>ICommand</code> implementation.
 *
 * Your subclass should override the <code>execute</code> method where your business logic will
 * handle the <code>INotification</code>.
 */
declare class SimpleCommand extends Notifier implements ICommand, INotifier {
    /**
     * Fulfill the use-case initiated by the given <code>INotification</code>.
     *
     * In the Command Pattern, an application use-case typically begins with some user action,
     * which results in an <code>INotification</code> being broadcast, which is handled by
     * business logic in the <code>execute</code> method of an <code>ICommand</code>.
     *
     * @param notification
     * 		The <code>INotification</code> to handle.
     */
    execute(notification: INotification): Promise<void>;
}

/**
 * A base singleton <code>IFacade</code> implementation.
 *
 * In PureMVC, the <code>Facade</code> class assumes these responsibilities:
 *
 * <UL>
 * <LI>Initializing the <code>Model</code>, <code>View</code> and <code>Controller</code>
 * singletons.
 * <LI>Providing all the methods defined by the <code>IModel</code>, <code>IView</code>, &
 * <code>IController</code> interfaces.
 * <LI>Providing the ability to override the specific <code>Model</code>, <code>View</code> and
 * <code>Controller</code> singletons created.
 * <LI>Providing a single point of contact to the application for registering
 * <code>Commands</code> and notifying <code>Observer</code>s.
 *
 * This <code>Facade</code> implementation is a singleton and cannot be instantiated directly,
 * but instead calls the static singleton factory method <code>Facade.getInstance()</code>.
 */
declare class Facade implements IFacade {
    #private;
    /**
     * Constructs a <code>Controller</code> instance.
     *
     * This <code>IFacade</code> implementation is a singleton, so you should not call the
     * constructor directly, but instead call the static singleton Factory method
     * <code>Facade.getInstance()</code>.
     *
     * @throws Error
     *		Throws an error if an instance of this singleton has already been constructed.
        */
    constructor();
    /**
     * Called automatically by the constructor.
     * Initialize the singleton <code>Facade</code> instance.
     *
     * Override in your subclass to do any subclass specific initializations. Be sure to
     * extend the <code>Facade</code> with the methods and properties on your implementation
     * and call <code>Facade.initializeFacade()</code>.
     *
     * @protected
     */
    protected initializeFacade(): void;
    /**
     * Initialize the <code>Model</code>.
     *
     * Called by the <code>initializeFacade</code> method. Override this method in your
     * subclass of <code>Facade</code> if one or both of the following are true:
     *
     * <UL>
     * <LI> You wish to initialize a different <code>IModel</code>.
     * <LI> You have <code>Proxy</code>s to register with the <code>Model</code> that do not
     * retrieve a reference to the <code>Facade</code> at construction time.
     *
     * If you don't want to initialize a different <code>IModel</code>, call
     * <code>super.initializeModel()</code> at the beginning of your method, then register
     * <code>Proxy</code>s.
     *
     * Note: This method is <i>rarely</i> overridden; in practice you are more likely to use a
     * <code>Command</code> to create and register <code>Proxy</code>s with the
     * <code>Model</code>, since <code>Proxy</code>s with mutable data will likely need to send
     * <code>INotification</code>s and thus will likely want to fetch a reference to the
     * <code>Facade</code> during their construction.
     *
     * @protected
     */
    protected initializeModel(): void;
    /**
     * Initialize the <code>Controller</code>.
     *
     * Called by the <code>initializeFacade</code> method. Override this method in your
     * subclass of <code>Facade</code> if one or both of the following are true:
     *
     * <UL>
     * <LI>You wish to initialize a different <code>IController</code>.
     * <LI>You have <code>ICommand</code>s to register with the <code>Controller</code> at
     * startup.
     *
     * If you don't want to initialize a different <code>IController</code>, call
     * <code>super.initializeController()</code> at the beginning of your method, then register
     * <code>Command</code>s.
     *
     * @protected
     */
    protected initializeController(): void;
    /**
     * Initialize the <code>View</code>.
     *
     * Called by the <code>initializeFacade</code> method. Override this method in your
     * subclass of <code>Facade</code> if one or both of the following are true:
     * <UL>
     * <LI> You wish to initialize a different <code>IView</code>.
     * <LI> You have <code>Observers</code> to register with the <code>View</code>
     *
     * If you don't want to initialize a different <code>IView</code>, call
     * <code>super.initializeView()</code> at the beginning of your method, then register
     * <code>IMediator</code> instances.
     *
     * Note: This method is <i>rarely</i> overridden; in practice you are more likely to use a
     * <code>Command</code> to create and register <code>Mediator</code>s with the
     * <code>View</code>, since <code>IMediator</code> instances will need to send
     * <code>INotification</code>s and thus will likely want to fetch a reference to the
     * <code>Facade</code> during their construction.
     *
     * @protected
     */
    protected initializeView(): void;
    /**
     * Register an <code>ICommand</code> with the <code>IController</code> associating it to a
     * <code>INotification</code> name.
     *
     * @param notificationName
     *		The name of the <code>INotification</code> to associate the <code>ICommand</code>
     *		with.
    
     * @param commandClassRef
     * 		A reference to the constructor of the <code>ICommand</code>.
     */
    registerCommand(notificationName: string, commandClass: CommandConstructor): void;
    /**
     * Remove a previously registered <code>ICommand</code> to <code>INotification</code>
     * mapping from the <code>Controller</code>.
     *
     * @param notificationName
     *		The name of the <code>INotification</code> to remove the <code>ICommand</code>
     *		mapping for.
     */
    removeCommand(notificationName: string): void;
    /**
     * Check if an <code>ICommand</code> is registered for a given <code>Notification</code>.
     *
     * @param notificationName
     * 		The name of the <code>INotification</code> to verify for the existence of an
     * 		<code>ICommand</code> mapping for.
     *
     * @return
     * 		A <code>Command</code> is currently registered for the given
     *		<code>notificationName</code>.
     */
    hasCommand(notificationName: string): boolean;
    /**
     * Register an <code>IProxy</code> with the <code>Model</code> by name.
     *
     * @param proxy
     *		The <code>IProxy</code> to be registered with the <code>Model</code>.
     */
    registerProxy(proxy: IProxy): void;
    /**
     * Retrieve an <code>IProxy</code> from the <code>Model</code> by name.
     *
     * @param proxyName
     * 		The name of the <code>IProxy</code> to be retrieved.
     *
     * @return
     * 		The <code>IProxy</code> previously registered with the given
     *		<code>proxyName</code>.
     */
    retrieveProxy(proxyName: string): IProxy | undefined;
    /**
     * Remove an <code>IProxy</code> from the <code>Model</code> by name.
     *
     * @param proxyName
     *		The <code>IProxy</code> to remove from the <code>Model</code>.
     *
     * @return
     *		The <code>IProxy</code> that was removed from the <code>Model</code>
     */
    removeProxy(proxyName: string): IProxy | undefined;
    /**
     * Check if a <code>Proxy</code> is registered.
     *
     * @param proxyName
     * 		The <code>IProxy</code> to verify the existence of a registration with the
     *		<code>IModel</code>.
     *
     * @return
     * 		A <code>Proxy</code> is currently registered with the given	<code>proxyName</code>.
     */
    hasProxy(proxyName: string): boolean;
    /**
     * Register a <code>IMediator</code> with the <code>IView</code>.
     *
     * @param mediator
        A reference to the <code>IMediator</code>.
     */
    registerMediator(mediator: IMediator): void;
    /**
     * Retrieve an <code>IMediator</code> from the <code>IView</code>.
     *
     * @param mediatorName
     * 		The name of the registered <code>Mediator</code> to retrieve.
     *
     * @return
     *		The <code>IMediator</code> previously registered with the given
     *		<code>mediatorName</code>.
     */
    retrieveMediator(mediatorName: string): IMediator | undefined;
    /**
     * Remove an <code>IMediator</code> from the <code>IView</code>.
     *
     * @param mediatorName
     * 		Name of the <code>IMediator</code> to be removed.
     *
     * @return
     *		The <code>IMediator</code> that was removed from the <code>IView</code>
     */
    removeMediator(mediatorName: string): IMediator | undefined;
    /**
     * Check if a <code>Mediator</code> is registered or not
     *
     * @param mediatorName
     * 		The name of the <code>IMediator</code> to verify the existence of a registration
     *		for.
     *
     * @return
     * 		An <code>IMediator</code> is registered with the given <code>mediatorName</code>.
     */
    hasMediator(mediatorName: string): boolean;
    /**
     * Notify the <code>IObservers</code> for a particular <code>INotification</code>.
     *
     * This method is left public mostly for backward compatibility, and to allow you to
     * send custom notification classes using the <code>Facade</code>.
     *
     *
     * Usually you should just call <code>sendNotification</code> and pass the parameters,
     * never having to construct the <code>INotification</code> yourself.
     *
     * @param notification
     * 		The <code>INotification</code> to have the <code>IView</code> notify
     *		<code>IObserver</code>s	of.
     */
    notifyObservers(notification: INotification): Promise<void>;
    /**
     * Create and send an <code>INotification</code>.
     *
     * Keeps us from having to construct new notification instances in our implementation code.
     *
     * @param name
     *		The name of the notification to send.
     *
     * @param body
     *		The body of the notification to send.
     *
     * @param type
     *		The type of the notification to send.
     */
    sendNotification(name: string, body?: any, type?: string): Promise<void>;
    dispose(): Promise<void>;
    /**
     * @constant
     * @protected
     */
    private static SINGLETON_MSG;
    /**
     * The singleton <code>Facade</code> instance.
     *
     * @protected
     */
    private static instance;
    /**
     * Facade singleton factory method.
     *
     * @return
     * 		The singleton instance of <code>Facade</code>.
     */
    static getInstance(): IFacade;
}

/**
 * A base <code>IMediator</code> implementation.
 *
 * Typically, a <code>Mediator</code> will be written to serve one specific control or group
 * controls and so, will not have a need to be dynamically named.
 */
declare class Mediator<ViewType = unknown> extends Notifier implements IMediator<ViewType>, INotifier {
    #private;
    /**
     * Constructs a <code>Mediator</code> instance.
     *
     * @param mediatorName
     * 		The name of the <code>Mediator</code>.
     *
     * @param viewComponent
     * 		The view component handled by this <code>Mediator</code>.
     */
    constructor(mediatorName?: string, viewComponent?: ViewType);
    /**
     * Get the <code>Mediator</code> instance name.
     *
     * @return
     * 		The <code>Mediator</code> instance name
     */
    getMediatorName(): string;
    /**
     * Get the <code>Mediator</code>'s view component.
     *
     * Additionally, an implicit getter will usually be defined in the subclass that casts the
     * view object to a type, like this:
     *
     * <code>
     *		getMenu():Menu
     *		{
     *			return <Menu> this.viewComponent;
     *		}
     * </code>
     *
     * @return
     * 		The <code>Mediator</code>'s default view component.
     */
    getViewComponent(): ViewType | undefined;
    get viewComponent(): ViewType | undefined;
    /**
     * Set the <code>IMediator</code>'s view component.
     *
     * @param viewComponent
     * 		The default view component to set for this <code>Mediator</code>.
     */
    setViewComponent(viewComponent: ViewType): void;
    /**
     * List the <code>INotification</code> names this <code>IMediator</code> is interested in
     * being notified of.
     *
     * @return
     * 		The list of notifications names in which is interested the <code>Mediator</code>.
     */
    listNotificationInterests(): string[];
    /**
     * Handle <code>INotification</code>s.
     *
     *
     * Typically this will be handled in a switch statement, with one 'case' entry per
     * <code>INotification</code> the <code>Mediator</code> is interested in.
     *
     * @param notification
     * 		The notification instance to be handled.
     */
    handleNotification(notification: INotification): Promise<void>;
    /**
     * Called by the View when the Mediator is registered. This method has to be overridden
     * by the subclass to know when the instance is registered.
     */
    onRegister(): void;
    /**
     * Called by the View when the Mediator is removed. This method has to be overridden
     * by the subclass to know when the instance is removed.
     */
    onRemove(): void;
    /**
     * Default name of the <code>Mediator</code>.
     *
     * @constant
     */
    static NAME: string;
}

/**
 * A base <code>IProxy</code> implementation.
 *
 * In PureMVC, <code>IProxy</code> implementors assume these responsibilities:
 * <UL>
 * <LI>Implement a common method which returns the name of the Proxy.
 * <LI>Provide methods for setting and getting the data object.
 *
 * Additionally, <code>IProxy</code>s typically:
 * <UL>
 * <LI>Maintain references to one or more pieces of model data.
 * <LI>Provide methods for manipulating that data.
 * <LI>Generate <code>INotifications</code> when their model data changes.
 * <LI>Expose their name as a <code>constant</code> called <code>NAME</code>, if they are not
 * instantiated multiple times.
 * <LI>Encapsulate interaction with local or remote services used to fetch and persist model
 * data.
 */
declare class Proxy<DataType = unknown> extends Notifier implements IProxy<DataType>, INotifier {
    #private;
    /**
     * Constructs a <code>Proxy</code> instance.
     *
     * @param proxyName
     * 		The name of the <code>Proxy</code> instance.
     *
     * @param data
     * 		An initial data object to be held by the <code>Proxy</code>.
     */
    constructor(proxyName: string, data?: DataType);
    /**
     * Get the name of the <code>Proxy></code> instance.
     *
     * @return
     * 		The name of the <code>Proxy></code> instance.
     */
    getProxyName(): string;
    /**
     * Set the data of the <code>Proxy></code> instance.
     *
     * @param data
     * 		The data to set for the <code>Proxy></code> instance.
     */
    setData(data: DataType): void;
    /**
     * Get the data of the <code>Proxy></code> instance.
     *
     * @return
     * 		The data held in the <code>Proxy</code> instance.
     */
    getData(): DataType;
    /**
     * Called by the Model when the <code>Proxy</code> is registered. This method has to be
     * overridden by the subclass to know when the instance is registered.
     */
    onRegister(): void;
    /**
     * Called by the Model when the <code>Proxy</code> is removed. This method has to be
     * overridden by the subclass to know when the instance is removed.
     */
    onRemove(): void;
    /**
     * The default name of the <code>Proxy</code>
     *
     * @type
     * @constant
     */
    static NAME: string;
}

export { CommandConstructor, Controller, Facade, ICommand, IController, IFacade, IMediator, IModel, INotification, INotifier, IObserver, IProxy, IView, MacroCommand, Mediator, Model, Notification, Notifier, Observer, Proxy, SimpleCommand, View };
