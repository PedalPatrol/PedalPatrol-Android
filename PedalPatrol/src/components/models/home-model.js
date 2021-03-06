import Model from './model';
import Database from '../../util/database';
import TimeUtil from '../../util/timeutility';

/**
 * Class for the home/notification model to be used by the Home Presenter
 * @extends Model 
 */
class HomeModel extends Model {
	/**
	 * Creates an instance of HomeModel. Initializes , creates an observerlist,
	 * and registers an on read from the database.
	 *
	 * @constructor
	 */
	constructor() {
		super();
		
		this.listener = null;
		this._data = {data: []};
		this._activeBookmarks = [];

		this._callback = this._defaultCallback;
		this._createObserverList();
		this._registerDBReadListener();
	}

	/**
	 * Get method for presenters to get data.
	 *
	 * @return {Object} data stored in the model
	 */
	get() {
		return {...this._data} // immutable
	}

	/**
	 * Default callback
	 */
	_defaultCallback(message) {
		console.log(message);
	}

	/**
	 * Set the model's callback to a new callback. This callback can be used anywhere and is usually passed in from a presenter.
	 *
	 * @param {Function} callback - A callback to run when certain code is executed
	 */
	setCallback(callback) {
		this._callback = callback;
	}

	/**
	 * Register an 'on' read from the database, supplying the callback when the database has changed.
	 */
	_registerDBReadListener() {
		this.listener = Database.readBikeDataOn((snapshot) => {
			// console.log(snapshot.val());
			this._insertDataOnRead(snapshot.val());
			this.moveBookmarkedDataToFront();
		});
	}

	/**
	 * Toggle the database listener off and then on again to get the data again.
	 * TODO : Better method to do this?
	 */
	toggleListeners() {
		if (this.listener != null) {
			Database.readBikeDataOff(this.listener);
			this._registerDBReadListener();
		}
	}

	/**
	 * Insert data into the data object when data has changed from the database
	 *
	 * @param {Object} databaseData - Each data item is an object within the overall object
	 */
	_insertDataOnRead(databaseData) {
		let tempData = {data:[]};
		let dataID = 0;
		
		if (databaseData != null) { // Check if there are objects in the database
			for (let val in databaseData) {
				if (!databaseData[val].hasOwnProperty('id')) { // Make sure id exists, otherwise skip
					continue;
				}
				// if (!databaseData[val].hasOwnProperty('stolen') || !databaseData[val].stolen) {
				// 	continue;
				// }

				if (databaseData[val].hasOwnProperty('stolen') && databaseData[val].stolen) {
					databaseData[val].dataID = dataID++;
					// Add timeago and datetime formatted info
					databaseData[val].timeago = TimeUtil.getTimeAgoFromMilliseconds(databaseData[val].milliseconds);
					databaseData[val].datetime = TimeUtil.getDateFormatFromDateTime(databaseData[val].milliseconds);
					tempData.data.push(databaseData[val]);
				}
			}
			this._data = tempData;
			// console.log(this._data)
		}
	}

	/**
	 * Recalculates the 'timeago' property of the object, based on the milliseconds.
	 */
	recalculateTimeAgo() {
		let tempData = Object.assign(this._data.data);
		let dataID = 0;
		for (let i=0; i < tempData.length; i++) {
			tempData[i].dataID = dataID++;
			// Convert back to timeago from milliseconds
			tempData[i].timeago = TimeUtil.getTimeAgoFromMilliseconds(tempData[i].milliseconds);
		}
		this._data.data = Object.assign(tempData);
	}


	/**
	 * Moves the bookmarked data to the front of the list.
	 */
	moveBookmarkedDataToFront() {
		if (typeof this._data !== "undefined" && this._data != undefined) {
			const temp = this._data.data;

			const nonBookmarkedData = this.getBookmarkedData(temp, false);
			const bookmarkedData	= this.getBookmarkedData(temp, true);

			// Reverse the lists because we want latest time first
			const sortedBookmarkedData 		= TimeUtil.sortOnTime(bookmarkedData).reverse();
			const sortedNonBookmarkedData 	= TimeUtil.sortOnTime(nonBookmarkedData).reverse();
		
			// console.log(sortedNonBookmarkedData);

			const totalTempData = sortedBookmarkedData.concat(sortedNonBookmarkedData);

			this._data.data = totalTempData;
			this._notifyAll(this._data);
		}
	}

	/**
	 * Gets the bookmarked or unbookmarked data from based on the toggle value.
	 *
	 * @param {List} data - A list of objects with property id
	 * @param {Boolean} toggle - true: Look for bookmarked data; false: Look for unbookmarked data
	 * @return {List} A list of bookmarked or unbookmarked data depending on the toggle value
	 */
	getBookmarkedData(data, toggle) {
		return data.filter(obj => this.isBookmarked(obj.id) === toggle);
	}

	/**
	 * Update method for presenters to update the model's data.
	 *
	 * @param {Object} newData - New data to add
	 */
	update(newData) {
		newData.data.found_milliseconds = TimeUtil.getDateTime();

		if (newData.hasOwnProperty('foundTriggered') && newData.foundTriggered && newData.data.found) {
			this._editExistingInDatabase(newData.data, (result) => {
				this._callback(true); 
				this._removeFromData(newData.data); 
				this._notifyAll(this._data);
			});
		}
	}

	/**
	 * @private
	 * TEST CASE USE ONLY
	 * Function for tests only to inject data.
	 */
	testUpdateInjection(newData) {
		this._data.data.push(newData.data);
		this._notifyAll(this._data);
	}

	/**
	 * Remove data from the home model's data.
	 * 
	 * @param {Object} data - Data to remove
	 */
	_removeFromData(data) {
		this._data.data = this._data.data.filter((el) => el != data);
	}

	/**
	 * Returns the bookmarked state for a bike ID
	 *
	 * @param {Number} id - A bike notification ID
	 * @return {Boolean} true: if ID is bookmarked by user; false: otherwise
	 */
	isBookmarked(id) {
		return this._activeBookmarks.includes(id);
	}

	/**
	 * Sets a bookmark for a specific ID
	 *
	 * @param {Number} id - A bike notification ID to bookmark
	 */
	setBookmark(id) {
		this._activeBookmarks.push(id);
	}

	/**
	 * Unsets a bookmark for a specific ID
	 *
	 * @param {Number} id - A bike nofication ID to unbookmark
	 */
	unsetBookmark(id) {
		this._activeBookmarks = this._activeBookmarks.filter(bid => {return bid != id;})
	}

	/**
	 * @private
	 * DON'T USE THIS FUNCTION IF YOU DON'T HAVE TO.
	 * I hope you know what you're doing.
	 * We force a notifyAll here because if a presenter subscribes too late and needs data on startup, it won't
	 * receive anything because it mounts after data is received. Force a notifyAll so it can start with data.
	 */
	forceNotifyAll() {
		this._notifyAll(this._data);
	}

	/**
	 * Overwrite existing data in database and call the function callback depending on if it was successful or not.
	 *
	 * @param {Object} newData - Data to be written to the database
	 * @param {Function} callback - A function to call on the success or failure of the call
	 */
	_editExistingInDatabase(newData, callback) {
		return Database.editBikeData(newData, (data) => {
			// console.log(data);
			callback(typeof data !== 'undefined' && data !== undefined);
			// return typeof data !== 'undefined' && data !== undefined;
			// this._callback(typeof data !== 'undefined' && data !== undefined);
		},(error) => {
			console.log(error);
			callback(false);
			// this._callback(false);
		});
	}
}

export default HomeModel;