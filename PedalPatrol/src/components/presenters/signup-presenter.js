//login presenter
import BasePresenter from './presenter';
import { LoginM } from '../models/export-models';

export default class SignUpPresenter extends BasePresenter{
/**
	 * Creates an instance of LoginPresenter
	 *
	 * @constructor
	 * @param {Object} view - An instance of a view class
	 */

	constructor(view) {
		super();
		this.view = view;
		LoginM.subscribe(this);
	}
		/**
			 * Updates the bike model with new data.
			 *
			 * @param {Object} newData - New data to update the model's data with, including username and password for sign up.
			 */
	update = (newData) => {
		LoginM.update(newData);
	};

	 /**
		 * Called when the model is updated with new data. Refreshes the state of the view.
		 * Method is supplied with the data to add.
		 * Better way to refresh the state?
		 *
		 * @param {Object} newData - New data to add.
		 */
	onUpdated = (newData) => {
		// Do something with the new data or let the view auto update?
		console.log(newData)
		this.view.refreshState();
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
		result=true;
		//1. check if it is empty
		if ((username=='') || (password=='')) {
			reportError('Account name and password can not be empty')
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
