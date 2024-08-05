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
class Observer {
    /**
     * The notification method of the interested object.
     * @protected
     */
    notify;
    /**
     * The notification context of the interested object.
     * @protected
     */
    context;
    /**
     * Constructs an <code>Observer</code> instance.
     *
     * @param notifyMethod
     * 		The notification method of the interested object.
     *
     * @param notifyContext
     * 		The notification context of the interested object.
     */
    constructor(notifyMethod, notifyContext) {
        this.setNotifyMethod(notifyMethod);
        this.setNotifyContext(notifyContext);
    }
    /**
     * Get the notification method.
     *
     * @return
     * 		The notification (callback) method of the interested object.
     */
    getNotifyMethod() {
        return this.notify;
    }
    /**
     * Set the notification method.
     *
     * The notification method should take one parameter of type <code>INotification</code>.
     *
     * @param notifyMethod
     * 		The notification (callback) method of the interested object.
     */
    setNotifyMethod(notifyMethod) {
        this.notify = notifyMethod;
    }
    /**
     * Get the notification context.
     *
     * @return
     * 		The notification context (<code>this</code>) of the interested object.
     */
    getNotifyContext() {
        return this.context;
    }
    /**
     * Set the notification context.
     *
     * @param notifyContext
     * 		The notification context (this) of the interested object.
     */
    setNotifyContext(notifyContext) {
        this.context = notifyContext;
    }
    /**
     * Notify the interested object.
     *
     * @param notification
     * 		The <code>INotification</code> to pass to the interested object's notification
     * 		method.
     */
    async notifyObserver(notification) {
        await this.getNotifyMethod().call(this.getNotifyContext(), notification);
    }
    /**
     * Compare an object to the notification context.
     *
     * @param object
     * 		The object to compare.
     *
     * @return
     * 		The object and the notification context are the same.
     */
    compareNotifyContext(object) {
        return object === this.context;
    }
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
class View {
    /**
     * Mapping of <code>Mediator</code> names to <code>Mediator</code> instances.
     *
     * @protected
     */
    #mediatorMap;
    /**
     * Mapping of <code>Notification</code> names to <code>Observers</code> lists.
     *
     * @protected
     */
    #observerMap;
    /**
     * This <code>IView</code> implementation is a singleton, so you should not call the
     * constructor directly, but instead call the static singleton Factory method
     * <code>View.getInstance()</code>.
     *
     * @throws Error
     * 		Throws an error if an instance for this singleton has already been constructed.
     */
    constructor() {
        if (View.instance)
            throw Error(View.SINGLETON_MSG);
        View.instance = this;
        this.#mediatorMap = new Map();
        this.#observerMap = new Map();
        this.initializeView();
    }
    /**
     * Initialize the singleton <code>View</code> instance.
     *
     * Called automatically by the constructor. This is the opportunity to initialize the
     * singleton instance in a subclass without overriding the constructor.
     */
    initializeView() {
    }
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
    registerObserver(notificationName, observer) {
        const observers = this.#observerMap.get(notificationName);
        if (observers)
            observers.push(observer);
        else
            this.#observerMap.set(notificationName, [observer]);
    }
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
    removeObserver(notificationName, notifyContext) {
        // The observer list for the notification under inspection
        const observers = this.#observerMap.get(notificationName);
        if (!observers)
            return;
        // Find the observer for the notifyContext.
        let i = observers.length;
        while (i--) {
            const observer = observers[i];
            if (observer.compareNotifyContext(notifyContext)) {
                observers.splice(i, 1);
                break;
            }
        }
        /*
         * Also, when a Notification's Observer list length falls to zero, delete the
         * notification key from the observer map.
         */
        if (observers.length === 0)
            this.#observerMap.delete(notificationName);
    }
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
    async notifyObservers(notification) {
        const notificationName = notification.getName();
        const observers = this.#observerMap.get(notificationName);
        if (!observers)
            return;
        for (const observer of observers) {
            await observer.notifyObserver(notification);
        }
    }
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
    registerMediator(mediator) {
        const name = mediator.getMediatorName();
        // Do not allow re-registration (you must removeMediator first).
        if (this.#mediatorMap.has(name))
            return;
        // Register the Mediator for retrieval by name.
        this.#mediatorMap.set(name, mediator);
        // Get Notification interests, if any.
        const interests = mediator.listNotificationInterests();
        if (interests.length > 0) {
            // Create Observer referencing this mediator's handlNotification method.
            const observer = new Observer(mediator.handleNotification, mediator);
            // Register Mediator as Observer for its list of Notification interests.
            interests.forEach((interest) => {
                this.registerObserver(interest, observer);
            });
        }
        // Alert the mediator that it has been registered.
        mediator.onRegister();
    }
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
    retrieveMediator(mediatorName) {
        //Return a strict null when the mediator doesn't exist
        return this.#mediatorMap.get(mediatorName);
    }
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
    removeMediator(mediatorName) {
        // Retrieve the named mediator
        const mediator = this.#mediatorMap.get(mediatorName);
        if (!mediator)
            return undefined;
        //Get Notification interests, if any.
        const interests = mediator.listNotificationInterests();
        // For every notification this mediator is interested in...
        interests?.forEach((interest) => this.removeObserver(interest, mediator));
        // remove the mediator from the map
        this.#mediatorMap.delete(mediatorName);
        //Alert the mediator that it has been removed
        mediator.onRemove();
        return mediator;
    }
    /**
     * Check if a <code>IMediator</code> is registered or not.
     *
     * @param mediatorName
     * 		The <code>IMediator</code> name to check whether it is registered.
     *
     * @return
     *		A <code>Mediator</code> is registered with the given <code>mediatorName</code>.
     */
    hasMediator(mediatorName) {
        return this.#mediatorMap.has(mediatorName);
    }
    async dispose() {
        const names = [...this.#mediatorMap.keys()];
        names.forEach((name) => this.removeMediator(name));
        View.instance = undefined;
    }
    /**
     * @constant
     * @protected
     */
    static SINGLETON_MSG = "View singleton already constructed!";
    /**
     * Singleton instance local reference.
     *
     * @protected
     */
    static instance;
    /**
     * <code>View</code> singleton Factory method.
     *
     * @return
     *		The singleton instance of <code>View</code>.
        */
    static getInstance() {
        if (!View.instance)
            View.instance = new View();
        return View.instance;
    }
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
class Controller {
    /**
     * Local reference to the <code>View</code> singleton.
     *
     * @protected
     */
    #view;
    /**
     * Mapping of <code>Notification<code> names to <code>Command</code> constructors references.
     *
     * @protected
     */
    #commandMap;
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
    constructor() {
        if (Controller.instance)
            throw Error(Controller.SINGLETON_MSG);
        Controller.instance = this;
        this.#commandMap = new Map();
        this.initializeController();
    }
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
    initializeController() {
        this.#view = View.getInstance();
    }
    /**
     * If an <code>ICommand</code> has previously been registered to handle the given
     * <code>INotification</code>, then it is executed.
     *
     * @param notification
     * 		The <code>INotification</code> the command will receive as parameter.
     */
    async executeCommand(notification) {
        /*
         * Typed any here instead of <code>Function</code> ( won't compile if set to Function
         * because today the compiler consider that <code>Function</code> is not newable and
         * doesn't have a <code>Class</code> type)
         */
        const commandClass = this.#commandMap.get(notification.getName());
        if (commandClass) {
            const command = new commandClass();
            await command.execute(notification);
        }
    }
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
    registerCommand(notificationName, commandClass) {
        if (!this.#commandMap.has(notificationName))
            this.#view.registerObserver(notificationName, new Observer(this.executeCommand, this));
        this.#commandMap.set(notificationName, commandClass);
    }
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
    hasCommand(notificationName) {
        return this.#commandMap.has(notificationName);
    }
    /**
     * Remove a previously registered <code>ICommand</code> to <code>INotification</code>
     * mapping.
     *
     * @param notificationName
     * 		The name of the <code>INotification</code> to remove the <code>ICommand</code>
     * 		mapping for.
     */
    removeCommand(notificationName) {
        // if the Command is registered...
        if (this.hasCommand(notificationName)) {
            this.#view.removeObserver(notificationName, this);
            this.#commandMap.delete(notificationName);
        }
    }
    async dispose() {
        const names = [...this.#commandMap.keys()];
        names.forEach((name) => this.removeCommand(name));
        Controller.instance = undefined;
    }
    /**
     * Singleton instance local reference.
     *
     * @protected
     */
    static instance;
    /**
     * Error message used to indicate that a controller singleton is already constructed when
     * trying to constructs the class twice.
     *
     * @protected
     * @constant
     */
    static SINGLETON_MSG = "Controller singleton already constructed!";
    /**
     * <code>Controller</code> singleton Factory method.
     *
     * @return
     * 		The singleton instance of <code>Controller</code>
     */
    static getInstance() {
        if (!Controller.instance)
            Controller.instance = new Controller();
        return Controller.instance;
    }
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
class Model {
    /**
     * HashTable of <code>IProxy</code> registered with the <code>Model</code>.
     *
     * @protected
     */
    #proxyMap;
    /**
     * This <code>IModel</code> implementation is a singleton, so you should not call the
     * constructor directly, but instead call the static singleton Factory method
     * <code>Model.getInstance()</code>.
     *
     * @throws Error
     * 		Error if singleton instance has already been constructed.
     */
    constructor() {
        if (Model.instance)
            throw Error(Model.SINGLETON_MSG);
        Model.instance = this;
        this.#proxyMap = new Map();
        this.initializeModel();
    }
    /**
     * Initialize the singleton <code>Model</code> instance.
     *
     * Called automatically by the constructor, this is the opportunity to initialize the
     * singleton instance in a subclass without overriding the constructor.
     *
     * @protected
     */
    initializeModel() {
    }
    /**
     * Register an <code>IProxy</code> with the <code>Model</code>.
     *
     * @param proxy
     *		An <code>IProxy</code> to be held by the <code>Model</code>.
        */
    registerProxy(proxy) {
        this.#proxyMap.set(proxy.getProxyName(), proxy);
        proxy.onRegister();
    }
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
    removeProxy(proxyName) {
        const proxy = this.#proxyMap.get(proxyName);
        if (proxy) {
            this.#proxyMap.delete(proxyName);
            proxy.onRemove();
        }
        return proxy;
    }
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
    retrieveProxy(proxyName) {
        //Return a strict null when the proxy doesn't exist
        return this.#proxyMap.get(proxyName);
    }
    /**
     * Check if a Proxy is registered
     *
     * @param proxyName
     *		The name of the <code>IProxy</code> to verify the existence of its registration.
     *
     * @return
     *		A Proxy is currently registered with the given <code>proxyName</code>.
     */
    hasProxy(proxyName) {
        return this.#proxyMap.has(proxyName);
    }
    async dispose() {
        const names = [...this.#proxyMap.keys()];
        names.forEach((name) => this.removeProxy(name));
        Model.instance = undefined;
    }
    /**
     * Error message used to indicate that a controller singleton is already constructed when
     * trying to constructs the class twice.
     *
     * @constant
     * @protected
     */
    static SINGLETON_MSG = "Model singleton already constructed!";
    /**
     * singleton instance local reference.
     *
     * @protected
     */
    static instance;
    /**
     * <code>Model</code> singleton factory method.
     *
     * @return
     * 		The singleton instance of <code>Model</code>.
     */
    static getInstance() {
        if (!Model.instance)
            Model.instance = new Model();
        return Model.instance;
    }
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
class Notification {
    /**
     * The name of the <code>Notification</code>.
     *
     * @protected
     */
    #name;
    /**
     * The body data to send with the <code>Notification</code>.
     *
     * @protected
     */
    #body;
    /**
     * The type identifier of the <code>Notification</code>.
     *
     * @protected
     */
    #type;
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
    constructor(name, body, type) {
        this.#name = name;
        this.#body = body;
        this.#type = type;
    }
    /**
     * Get the name of the <code>Notification</code> instance.
     *
     * @return
     *		The name of the <code>Notification</code> instance.
        */
    getName() {
        return this.#name;
    }
    /**
     * Set the body of the <code>Notification</code> instance.
     *
     * @param body
     * 		The body of the <code>Notification</code> instance.
     */
    setBody(body) {
        this.#body = body;
    }
    /**
     * Get the body of the <code>Notification</code> instance.
     *
     * @return
     *		The body object of the <code>Notification</code> instance.
        */
    getBody() {
        return this.#body;
    }
    /**
     * Set the type of the <code>Notification</code> instance.
     *
     * @param type
     * 		The type of the <code>Notification</code> instance.
     */
    setType(type) {
        this.#type = type;
    }
    /**
     * Get the type of the <code>Notification</code> instance.
     *
     * @return
     *		The type of the <code>Notification</code> instance.
        */
    getType() {
        return this.#type;
    }
    /**
     * Get a textual representation of the <code>Notification</code> instance.
     *
     * @return
     * 		The textual representation of the <code>Notification</code>	instance.
     */
    toString() {
        let msg = "Notification Name: " + this.getName();
        msg += "\nBody:" + ((this.getBody() == null) ? "null" : this.getBody().toString());
        msg += "\nType:" + ((this.getType() == null) ? "null" : this.getType());
        return msg;
    }
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
class Facade {
    /**
     * Local reference to the <code>Model</code> singleton.
     *
     * @protected
     */
    #model;
    /**
     * Local reference to the <code>View</code> singleton.
     *
     * @protected
     */
    #view;
    /**
     * Local reference to the <code>Controller</code> singleton.
     *
     * @protected
     */
    #controller;
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
    constructor() {
        if (Facade.instance)
            throw Error(Facade.SINGLETON_MSG);
        Facade.instance = this;
        this.initializeFacade();
    }
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
    initializeFacade() {
        this.initializeModel();
        this.initializeController();
        this.initializeView();
    }
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
    initializeModel() {
        if (!this.#model)
            this.#model = Model.getInstance();
    }
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
    initializeController() {
        if (!this.#controller)
            this.#controller = Controller.getInstance();
    }
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
    initializeView() {
        if (!this.#view)
            this.#view = View.getInstance();
    }
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
    registerCommand(notificationName, commandClass) {
        this.#controller.registerCommand(notificationName, commandClass);
    }
    /**
     * Remove a previously registered <code>ICommand</code> to <code>INotification</code>
     * mapping from the <code>Controller</code>.
     *
     * @param notificationName
     *		The name of the <code>INotification</code> to remove the <code>ICommand</code>
     *		mapping for.
     */
    removeCommand(notificationName) {
        this.#controller.removeCommand(notificationName);
    }
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
    hasCommand(notificationName) {
        return this.#controller.hasCommand(notificationName);
    }
    /**
     * Register an <code>IProxy</code> with the <code>Model</code> by name.
     *
     * @param proxy
     *		The <code>IProxy</code> to be registered with the <code>Model</code>.
     */
    registerProxy(proxy) {
        this.#model.registerProxy(proxy);
    }
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
    retrieveProxy(proxyName) {
        return this.#model.retrieveProxy(proxyName);
    }
    /**
     * Remove an <code>IProxy</code> from the <code>Model</code> by name.
     *
     * @param proxyName
     *		The <code>IProxy</code> to remove from the <code>Model</code>.
     *
     * @return
     *		The <code>IProxy</code> that was removed from the <code>Model</code>
     */
    removeProxy(proxyName) {
        return this.#model?.removeProxy(proxyName);
    }
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
    hasProxy(proxyName) {
        return this.#model.hasProxy(proxyName);
    }
    /**
     * Register a <code>IMediator</code> with the <code>IView</code>.
     *
     * @param mediator
        A reference to the <code>IMediator</code>.
     */
    registerMediator(mediator) {
        if (this.#view)
            this.#view.registerMediator(mediator);
    }
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
    retrieveMediator(mediatorName) {
        return this.#view.retrieveMediator(mediatorName);
    }
    /**
     * Remove an <code>IMediator</code> from the <code>IView</code>.
     *
     * @param mediatorName
     * 		Name of the <code>IMediator</code> to be removed.
     *
     * @return
     *		The <code>IMediator</code> that was removed from the <code>IView</code>
     */
    removeMediator(mediatorName) {
        return this.#view?.removeMediator(mediatorName);
    }
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
    hasMediator(mediatorName) {
        return this.#view.hasMediator(mediatorName);
    }
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
    async notifyObservers(notification) {
        if (this.#view)
            this.#view.notifyObservers(notification);
    }
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
    async sendNotification(name, body, type) {
        return this.notifyObservers(new Notification(name, body, type));
    }
    async dispose() {
        await this.#view.dispose();
        await this.#controller.dispose();
        await this.#model.dispose();
        Facade.instance = undefined;
    }
    /**
     * @constant
     * @protected
     */
    static SINGLETON_MSG = "Facade singleton already constructed!";
    /**
     * The singleton <code>Facade</code> instance.
     *
     * @protected
     */
    static instance;
    /**
     * Facade singleton factory method.
     *
     * @return
     * 		The singleton instance of <code>Facade</code>.
     */
    static getInstance() {
        if (!Facade.instance)
            Facade.instance = new Facade();
        return Facade.instance;
    }
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
class Notifier {
    /**
     * Local reference to the singleton <code>Facade</code>.
     *
     * @protected
     */
    #facade;
    /**
     * Constructs a <code>Notifier</code> instance.
     */
    constructor() {
        this.#facade = Facade.getInstance();
    }
    get facade() {
        return this.#facade;
    }
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
    async sendNotification(name, body, type) {
        return this.facade.sendNotification(name, body, type);
    }
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
class MacroCommand extends Notifier {
    /**
     * An array of <code>ICommand</code>s.
     *
     * @protected
     */
    #subCommands;
    #sequentialExecution;
    /**
     * Constructs a <code>MacroCommand</code> instance.
     *
     * You should not need to define a constructor in your subclasses, instead, override the
     * <code>initializeMacroCommand</code> method.
     *
     * If your subclass does define a constructor, be  sure to call <code>super()</code>.
     */
    constructor(sequentialExeuction = false) {
        super();
        this.#subCommands = [];
        this.#sequentialExecution = sequentialExeuction;
        this.initializeMacroCommand();
    }
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
    initializeMacroCommand() {
    }
    /**
     * Add an entry to the <i>subCommands</i> list.
     *
     * The <i>subCommands</i> will be called in First In/First Out (FIFO) order.
     *
     * @param commandClassRef
     *		A reference to the constructor of the <code>ICommand</code>.
        */
    addSubCommand(commandClass) {
        this.#subCommands.push(commandClass);
    }
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
    async execute(notification) {
        const subCommands = this.#subCommands.slice(0);
        if (!this.#sequentialExecution) {
            await Promise.allSettled(this.#subCommands.map((commandClass) => {
                const commandInstance = new commandClass();
                return commandInstance.execute(notification);
            }));
        }
        else {
            for (let i = 0; i < subCommands.length; i++) {
                const commandClass = subCommands[i];
                const commandInstance = new commandClass();
                await commandInstance.execute(notification);
            }
        }
    }
}

/**
 * A base <code>ICommand</code> implementation.
 *
 * Your subclass should override the <code>execute</code> method where your business logic will
 * handle the <code>INotification</code>.
 */
class SimpleCommand extends Notifier {
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
    async execute(notification) {
    }
}

/**
 * A base <code>IMediator</code> implementation.
 *
 * Typically, a <code>Mediator</code> will be written to serve one specific control or group
 * controls and so, will not have a need to be dynamically named.
 */
class Mediator extends Notifier {
    /**
     * The name of the <code>Mediator</code>.
     *
     * @protected
     */
    #mediatorName;
    /**
     * The <code>Mediator</code>'s view component.
     *
     * @protected
     */
    #viewComponent;
    /**
     * Constructs a <code>Mediator</code> instance.
     *
     * @param mediatorName
     * 		The name of the <code>Mediator</code>.
     *
     * @param viewComponent
     * 		The view component handled by this <code>Mediator</code>.
     */
    constructor(mediatorName, viewComponent) {
        super();
        this.#mediatorName = (mediatorName != null) ? mediatorName : Mediator.NAME;
        this.#viewComponent = viewComponent;
    }
    /**
     * Get the <code>Mediator</code> instance name.
     *
     * @return
     * 		The <code>Mediator</code> instance name
     */
    getMediatorName() {
        return this.#mediatorName;
    }
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
    getViewComponent() {
        return this.#viewComponent;
    }
    get viewComponent() {
        return this.#viewComponent;
    }
    /**
     * Set the <code>IMediator</code>'s view component.
     *
     * @param viewComponent
     * 		The default view component to set for this <code>Mediator</code>.
     */
    setViewComponent(viewComponent) {
        this.#viewComponent = viewComponent;
    }
    /**
     * List the <code>INotification</code> names this <code>IMediator</code> is interested in
     * being notified of.
     *
     * @return
     * 		The list of notifications names in which is interested the <code>Mediator</code>.
     */
    listNotificationInterests() {
        return [];
    }
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
    async handleNotification(notification) {
    }
    /**
     * Called by the View when the Mediator is registered. This method has to be overridden
     * by the subclass to know when the instance is registered.
     */
    onRegister() {
    }
    /**
     * Called by the View when the Mediator is removed. This method has to be overridden
     * by the subclass to know when the instance is removed.
     */
    onRemove() {
    }
    /**
     * Default name of the <code>Mediator</code>.
     *
     * @constant
     */
    static NAME = 'Mediator';
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
class Proxy extends Notifier {
    /**
     * The data object controlled by the <code>Proxy</code>.
     *
     * @protected
     */
    #proxyName;
    /**
     * The name of the <code>Proxy</code>.
     *
     * @protected
     */
    #data;
    /**
     * Constructs a <code>Proxy</code> instance.
     *
     * @param proxyName
     * 		The name of the <code>Proxy</code> instance.
     *
     * @param data
     * 		An initial data object to be held by the <code>Proxy</code>.
     */
    constructor(proxyName, data) {
        super();
        this.#proxyName = (proxyName != null) ? proxyName : Proxy.NAME;
        if (data !== undefined)
            this.setData(data);
    }
    /**
     * Get the name of the <code>Proxy></code> instance.
     *
     * @return
     * 		The name of the <code>Proxy></code> instance.
     */
    getProxyName() {
        return this.#proxyName;
    }
    /**
     * Set the data of the <code>Proxy></code> instance.
     *
     * @param data
     * 		The data to set for the <code>Proxy></code> instance.
     */
    setData(data) {
        this.#data = data;
    }
    /**
     * Get the data of the <code>Proxy></code> instance.
     *
     * @return
     * 		The data held in the <code>Proxy</code> instance.
     */
    getData() {
        return this.#data;
    }
    /**
     * Called by the Model when the <code>Proxy</code> is registered. This method has to be
     * overridden by the subclass to know when the instance is registered.
     */
    onRegister() {
    }
    /**
     * Called by the Model when the <code>Proxy</code> is removed. This method has to be
     * overridden by the subclass to know when the instance is removed.
     */
    onRemove() {
    }
    /**
     * The default name of the <code>Proxy</code>
     *
     * @type
     * @constant
     */
    static NAME = "Proxy";
}

export { Controller, Facade, MacroCommand, Mediator, Model, Notification, Notifier, Observer, Proxy, SimpleCommand, View };
