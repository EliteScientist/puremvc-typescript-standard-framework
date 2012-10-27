/*
 PureMVC TypeScript by Frederic Saunier <frederic.saunier@puremvc.org>
 PureMVC - Copyright(c) 2006-2012 Futurescale, Inc., Some rights reserved.
 Your reuse is governed by the Creative Commons Attribution 3.0 License
*/

///<reference path='../../../../../../../test/lib/YUITest.d.ts'/>

///<reference path='../../../../../../../src/org/puremvc/typescript/interfaces/INotification.ts'/>

///<reference path='../../../../../../../src/org/puremvc/typescript/patterns/facade/Facade.ts'/>
///<reference path='../../../../../../../src/org/puremvc/typescript/patterns/observer/Notification.ts'/>

///<reference path='NotifierTestCommand' />
///<reference path='NotifierTestSub' />
///<reference path='NotifierTestVO' />

module puremvc
{
	"use strict";

	import YUITest = module("YUITest");

	/**
	 * Test the PureMVC Notifier class.
	 *
	 * @see puremvc.Notifier
	 */
	export class NotifierTest
	{
		/**
		 * The name of the test case - if not provided, one is automatically generated by the
		 * YUITest framework.
		 */

		name:string = "PureMVC Notifier class tests";

		/**
		 * Sets up data that is needed by each test.
		 */
		setUp():void
		{
		}

		/**
		 * Cleans up everything that was created by setUp().
		 */
		tearDown():void
		{
		}

		/**
		 * Tests if constructing the Notifier also create a facade instance.
		 */
		testConstructor():void
		{
			// Create a new subclass of Notifier and verify that its facade
			// has well been created
			var notifierTestSub:NotifierTestSub = new NotifierTestSub();

			// test assertions
			YUITest.Assert.isTrue
			(
				notifierTestSub.hasFacade(),
				"Expecting notifierTestSub.hasFacade() === true"
			);
		}

		/**
		 * Tests sending a Notification from the Notifier.
		 */
		testSendNotification():void
		{
			// Create the Facade, register the FacadeTestCommand to
			// handle 'NotifierTest' notifications
			var facade:Facade = Facade.getInstance();
			facade.registerCommand( 'NotifierTestNote', NotifierTestCommand );

			// Send notification. The Command associated with the event
			// (NotifierTestCommand) will be invoked, and will multiply
			// the vo.input value by 2 and set the result on vo.result
			var vo:NotifierTestVO = new NotifierTestVO( 32 );
			facade.sendNotification( 'NotifierTestNote', vo );

			// test assertions
			YUITest.Assert.areEqual
			(
				64,
				vo.result,
				"Expecting vo.result == 64"
			);
		}
	}
}