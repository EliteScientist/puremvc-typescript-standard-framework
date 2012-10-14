/*
 PureMVC - Copyright(c) 2006-12 Futurescale, Inc., Some rights reserved.
 Your reuse is governed by the Creative Commons Attribution 3.0 United States License
*/
module puremvc
{
	import org.puremvc.typescript.interfaces.*;
	import org.puremvc.typescript.patterns.observer.*;
	import org.puremvc.typescript.patterns.facade.Facade;
	
	/**
	 * A base <code>IMediator</code> implementation. 
	 * 
	 * @see org.puremvc.typescript.core.view.View View
	 */
	public class Mediator
		extends Notifier
		implements IMediator, INotifier
	{
		"use strict";

		/**
		 * The name of the <code>Mediator</code>. 
		 * 
		 * <P>
		 * Typically, a <code>Mediator</code> will be written to serve
		 * one specific control or group controls and so,
		 * will not have a need to be dynamically named.</P>
		 */
		public static const NAME:String = 'Mediator';
		
		/**
		 * Constructor.
		 */
		public Mediator( mediatorName:String=null, viewComponent:Object=null ) {
			this.mediatorName = (mediatorName != null)?mediatorName:NAME; 
			this.viewComponent = viewComponent;	
		}

		/**
		 * Get the name of the <code>Mediator</code>.
		 * @return the Mediator name
		 */		
		public getMediatorName():String
		{	
			return mediatorName;
		}

		/**
		 * Set the <code>IMediator</code>'s view component.
		 * 
		 * @param Object the view component
		 */
		public setViewComponent( viewComponent:Object ):void
		{
			this.viewComponent = viewComponent;
		}

		/**
		 * Get the <code>Mediator</code>'s view component.
		 * 
		 * <P>
		 * Additionally, an implicit getter will usually
		 * be defined in the subclass that casts the view 
		 * object to a type, like this:</P>
		 * 
		 * <listing>
		 *		private get comboBox : mx.controls.ComboBox
		 *		{
		 *			return viewComponent as mx.controls.ComboBox;
		 *		}
		 * </listing>
		 * 
		 * @return the view component
		 */		
		public getViewComponent():Object
		{	
			return viewComponent;
		}

		/**
		 * List the <code>INotification</code> names this
		 * <code>Mediator</code> is interested in being notified of.
		 * 
		 * @return Array the list of <code>INotification</code> names 
		 */
		public listNotificationInterests():Array
		{
			return [ ];
		}

		/**
		 * Handle <code>INotification</code>s.
		 * 
		 * <P>
		 * Typically this will be handled in a switch statement,
		 * with one 'case' entry per <code>INotification</code>
		 * the <code>Mediator</code> is interested in.
		 */ 
		public handleNotification( notification:INotification ):void {}
		
		/**
		 * Called by the View when the Mediator is registered
		 */ 
		public onRegister( ):void {}

		/**
		 * Called by the View when the Mediator is removed
		 */ 
		public onRemove( ):void {}

		// the mediator name
		protected var mediatorName:String;

		// The view component
		protected var viewComponent:Object;
	}
}