//login presenter
import BasePresenter from './presenter';
import { LoginM } from '../models/export-models';

export default class LoginPresenter extends BasePresenter {
	/**
	 * Creates an instance of LoginPresenter
	 *
	 * @constructor
	 * @param {Object} view - An instance of a view class
	 */

	constructor(view) {
		super()

		this.view = view;
		LoginM.subscribe(this);
	}
	
	/**
	 * Updates the login model with new data.
	 *
	 * @param {Object} newData - New data to update the model's data with, including username and password.
	 */
	update = (newData) => {
		LoginM.update(newData);
	};

	/**
	 * Called when the model finished checking with username and password. Refreshes the state of the view.
	 *
	 * @param {Object} message - a boolean value that check if the login is successful.
	 * message is true: navigate to the home screen.
	 * message is false: report error.
	 */
	onUpdated = (message) => {
		// Do something with the new data or let the view auto update?
		if (message == 'true') {
			this.view.navigateToTabs();
		} else if(message =='false'){
			this.view.handleLoginIncorrect();
		}
	};


	/**
	 * Gets the data from the model and returns it to the caller.
	 *
	 * @return {Object} Data from the model.
	 */
	getData = () => {
		return LoginM.get().data;
	};

	/**
	 * Called after user click the login button, before presenter sending data to the login model
	 * Check if the input is valid
	 * @param {Object} username - the username that user entered in the view
	 * @param {Object} password - the password that user entered in the view
	 */
	checkInput = (username, password, reportError) => {
		let result = true;
		//1. check if it is empty
		if ((username == '') || (password == '')) {
			reportError('Account name and password can not be empty');
			result = false;
		}
		//2. check the length
		return result;
	};


	/**
	 * If the view or presenter is destroyed, unsubscribe the presenter from the model.
	 */
	onDestroy = () => {
		LoginM.unsubscribe(this);
	};

};



