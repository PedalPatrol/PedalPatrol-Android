import BasePresenter from './presenter';
import { HomeM } from '../models/export-models';

/**
 * Class for the Reportfound presenter and view
 * @extends BasePresenter
 */
class ReportFoundPresenter extends BasePresenter {
	/**
	 * Creates an instance of ReportfoundPresenter
	 *
	 * @constructor
	 * @param {Object} view - An instance of a view class
	 */
	constructor(view) {
		super();
		this.view = view;
		HomeM.subscribe(this);
	}

	/**
	 * Updates the bike model with new data.
	 *
	 * @param {Object} newData - New data to update the model's data with.
	 * @param {Function} callback - A function that will execute a callback when accessing is complete
	 */
	update = (newData, callback) => {
		let editedBike = newData.data.editeddata;
		const newBike = {data:{}};
		const skipKeys = ['datetime', 'dataID', 'timeago'];

		Object.keys(editedBike).forEach((key) => {
			if (!skipKeys.includes(key)) {
				// console.log(key)
				newBike.data[key] = editedBike[key];	
			}
		});

		newBike.foundTriggered = true;
		newBike.data.stolen = false;
		newBike.data.found = true;
		newBike.data.found_latitude = newData.data.coordinate.latitude;
		newBike.data.found_longitude = newData.data.coordinate.longitude;
		newBike.data.found_description = newData.data.text;
		HomeM.setCallback(callback);
		HomeM.update(newBike);
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
	//	console.log(newData)
		this.view.refreshState();
	};


	/**
	 * Called when the model is updated with new data. Refreshes the state of the view.
	 * Better way to refresh the state?
	 */
	 onUpdated = () => {
		this.view.refreshState();
	 };

	/**
	 * Gets the data from the model and returns it to the caller.
	 *
	 * @return {Object} Data from the model.
	 */
	getData = () => {
		let data = HomeM.get().data;
		return data.filter((el) => {
			return el.stolen;
		});
	};

	/**
	 * If the view or presenter is destroyed, unsubscribe the presenter from the model.
	 */
	onDestroy = () => {
		HomeM.unsubscribe(this);
	};

}

export default ReportFoundPresenter;