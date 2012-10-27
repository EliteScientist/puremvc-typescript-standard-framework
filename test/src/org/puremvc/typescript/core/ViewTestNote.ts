/*
 PureMVC TypeScript by Frederic Saunier <frederic.saunier@puremvc.org>
 PureMVC - Copyright(c) 2006-2012 Futurescale, Inc., Some rights reserved.
 Your reuse is governed by the Creative Commons Attribution 3.0 License
*/

///<reference path='../../../../../../../test/lib/YUITest.d.ts'/>

///<reference path='../../../../../../../src/org/puremvc/typescript/interfaces/INotification.ts'/>

///<reference path='../../../../../../../src/org/puremvc/typescript/patterns/observer/Notification.ts'/>

module puremvc
{
	"use strict";

	/**
	 * @classDescription
	 * A Notification class used by ViewTest.
	 *
	 * @see puremvc.ViewTest ViewTest
	 * @extends puremvc.Notification Notification
	 */
	class ViewTestNote
		extends Notification
	{
		/**
		 * @constructor.
		 *
		 * @param {String} name
		 *		Ignored and forced to NAME.
		 *
		 * @param {Object} body
		 *		The body of the Notification to be constructed.
		 */
		constructor( name, body )
		{
			super( ViewTestNote.NAME, body );
		}

		/**
		 * The name of this Notification.
		 */
		private static NAME:string = "ViewTestNote";

		/**
		 * Factory method.
		 *
		 * This method creates new instances of the ViewTestNote class,
		 * automatically setting the note name so you don't have to. Use
		 * this as an alternative to the constructor.
		 *
		 * @param {Object} body
		 * 		The body of the Notification to be constructed.
		 *
		 * @return {Notification}
		 *		The created <code>Notification</code>
		 */
		static create( body )
		{
			return new ViewTestNote( ViewTestNote.NAME, body );
		}
	}
}