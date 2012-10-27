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
	 * A utility class used by FacadeTest.
	 *
	 * @see puremvc.FacadeTest FacadeTest
	 * @see puremvc.FacadeTestCommand FacadeTestCommand
	 */
	export class FacadeTestVO
	{
		/**
		 * @constructor
		 * Constructs a <code>FacadeTestVo</code> instance.
		 *
		 * @param input
		 * 		The number to be fed to the FacadeTestCommand
		 */
		constructor( input:number )
		{
			this.input = input;
		}

		/**
		 * Will be used to store the number to pass to the command.
		 */
		input:number = null;

		/**
		 * Will be used to read the result calculated by the command.
		 */
		result:number = null;
	}
}