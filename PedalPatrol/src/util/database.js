// import firebase from 'react-native-firebase';
import firebase from 'firebase'; // Using regular firebase here because there are some problems when trying to move to react-native-firebase 
import 'firebase/storage'; // Necessary for jest tests
import { NativeModules } from 'react-native';
import { LoginButton, AccessToken, LoginManager } from 'react-native-fbsdk';

import config from '../config/config.json';
import TimeUtil from './timeutility';

const { RNTwitterSignIn } = NativeModules;

const BikeImages = 'BikeImages/';
const ProfileImages = 'ProfileImages/';

/**
 * Class for the firebase database connection and operations
 */
class FirebaseDatabase {
	/**
	 * Creates an instance of the FirebaseDatabase class.
	 * Initializes the app as a firebase app and sets up the storage references.
	 * @constructor
	 */
	constructor() {
		this.currentUser = null;

		if (!firebase.apps.length) {
			firebase.initializeApp(config.databaseConfig);
		}
		this.setupDatabaseRef();
		this.setupStorageRef();
	}

	/**
	 * Set up the database reference to the PProject table
	 */
	setupDatabaseRef() {
		this.refDB = firebase.database().ref('PProject/');
	}

	/**
	 * Set up the storage reference
	 */
	setupStorageRef() {
		this.refStorage = firebase.storage().ref();
	}

	/**
	 * Returns the storage without a reference.
	 *
	 * @return {Object} The storage without reference
	 */
	getStorageWithoutRef() {
		return firebase.storage();
	}



 signUp(email,password,onSuccess, onError) {
	    firebase.auth().createUserWithEmailAndPassword(email,password)
	    .then(onSuccess).catch(onError);



//	    ((user) => {
//                  if (user) {
//                      console.log("signup user id is: "+user.uid)
//                      this.sendEmail(user.uid);
//                      this.setAccount(user.uid);
//                      this.signOut(user.uid);
//                   }
//                   }
//                   )
//                   .catch(onError);

	 }

    	checkVerify() {
    	let user = firebase.auth().currentUser;
    	let errorMessage='';
    			if (user.emailVerified == false) {
    			    console.log("user email verified"+user.emailVerified);
    				errorMessage = 'email not verified';
    				return errorMessage;
    			} else {
    			    return true;
    				// successful login
    			}
    		}

  sendEmail() {
  //console.log("user in send email is : "+ user);
    		 firebase.auth().currentUser.sendEmailVerification().then(function() {
            // Email Verification sent!
            // [START_EXCLUDE]
            alert('Email Verification Sent!');
            // [END_EXCLUDE]
          }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
    		var errorMessage = error.message;
    		console.log('error for email:      '+ errorMessage);
    		alert(errorMessage);
    		});
    	}

  sendresetEmail() {
    		let email = getCurrentUserEmail();
    		firebase.auth().sendPasswordResetEmail(email).then(function() {
    		// Email sent.
    		}).catch(function(error) {
    		// An error happened.
    		var errorCode = error.code;
    		var errorMessage = error.message;
    		alert(errorMessage);
    		});

    	}

	/**
	 * Accesses Firebase data to sign in with email and password.
	 * This function is called asynchronously. Use 'async' and 'await'.
	 *
	 * @param {string} email - A user's email
	 * @param {string} password - A user's password
	 * @param {Function} onError - A function callback to execute on error
	 */
	async signIn(email, password, onError) {
		await firebase.auth().signInWithEmailAndPassword(email, password).catch(onError);
	}

	signinwithFB() {
		//console.log('begin signinwithFB');
		LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(
		// console.log('walk into else'),
		AccessToken.getCurrentAccessToken().then(function(data) {
			let accessToken = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
				console.log('accessToken'+accessToken)
				this.handleFirebaseLogin(accessToken);
			}.bind(this))
		);
	}

	signInwithTwitter(){
		RNTwitterSignIn.init('pdfOq2bGgmAD59pe3241W1hMg','xPRtJaBCqmZoFKPV7N8YcllUqOi4d0QWR521rebCQFcMUFGYE3');
		RNTwitterSignIn.logIn().then((loginData)=>{
			let accessToken = firebase.auth
									.TwitterAuthProvider
									.credential(
										loginData.authToken,
										loginData.authTokenSecret
								  	);
			this.handleFirebaseLogin(accessToken);
		}).catch((error) => {
			console.log(error)
			alert('Unable sign in with Twitter.')
		});
		user = firebase.auth().currentUser;
			this.setAccount(user.uid);
		// console.log('did login')
	}

	handleFirebaseLogin(accessToken) {
		// console.log(accessToken)
		firebase.auth().signInAndRetrieveDataWithCredential(accessToken).then((data)=> {
			let user = firebase.auth().currentUser;
		}).catch((error)=> {
			let errorCode = error.code;
			let errorMessage = error.message;
			let email = error.email;
			let credential = error.credential;
			if (errorCode === 'auth/account-exists-with-different-credential') {
				// Email already associated with another account.
			}
		})
		console.log('did into handle firebase login')
	}


	 setAccount(user){
            //let user = firebase.auth().currentUser;
            console.log("user in set account is: "+user);
            this.refDB.child('Users/').child(user).set({
            id:user,
            circle_lat:"",
            circle_long:"",
            circle_r:"",
            deviceToken:"",
            full_name:'',
            phoneNum:"",
            email:user.email,
            thumbnail:["https://firebasestorage.googleapis.com/v0/b/test-f4788.appspot.com/o/ProfileImages%2FKXx6FLsyOOVyCy1ik4bJK4Y17UV2%2F0.jpg?alt=media&token=526759aa-0a3d-4b0c-9cfe-33952fefc692"]


            });
        }

	/**
	 * Sign out of the database.
	 *
	 * @param {Function} onSuccess - A callback function on a successful signout
	 * @param {Function} onError - A callback function on a failure to signout
	 */
	signOut(onSuccess, onError) {
		this.currentUser = null;
		firebase.auth().signOut().then(onSuccess, onError);
	}


	/** 
	 * Write to the database in table 'Bike' using the id as the child. Adds a date time and owner to the data
	 *
	 * @param {Object} bikeData - Bike data to add to the database
	 * @param {Function} onSuccess - A function callback to execute on the success of writing to the database
	 * @param {Function} onError - A function callback to execute on an error when writing to the database
	 */
	writeBikeData(bikeData, onSuccess, onError) {
		this.getCurrentUser((userID) => {
			bikeData.owner = userID;	
			this.refDB.child('Bike/').child(bikeData.id).set(bikeData, onSuccess).catch(onError);
		});
	}

	/**
	 * Write to the database in the table 'Users' using the user id as the child.
	 *
	 * @param {Object} profileData - The data to upload
	 * @param {Function} onSuccess - A function callback to execute on the success of writing to the database
	 * @param {Function} onError - A function callback to execute on an error when writing to the database 
	 */
	writeProfileData(profileData, onSuccess, onError) {
		this.refDB.child('Users/').child(profileData.id).set(profileData, onSuccess).catch(onError);
	}

	/**
	 * Overwrites data in the database by reading the data, merging it with the new values and writing back to the same ID.
	 *
	 * @param {Object} newBikeData - New data to write
	 * @param {Function} onSuccess - A function callback to run when writing is successful
	 * @param {Function} onErorr - A function callback to run when writing fails
	 */
	editBikeData(newBikeData, onSuccess, onError) {
		const bikeID = newBikeData.id;

		this.refDB.child('Bike/').once('value', (snapshot) => {
			let bikeData = snapshot.val();
			let originalBikeData = bikeData[bikeID];
			let updatedObj = this.merge(originalBikeData, newBikeData);
			this.refDB.child('Bike/').child(bikeID).set(updatedObj, onSuccess).catch(onError);
		}).catch((error) => {
			onError(error);
			console.log(error);
		});
	}

	/**
	 * Overwrites data in the database by reading the data, merging it with the new values and writing back to the same ID.
	 *
	 * @param {Object} newProfileData - New data to write
	 * @param {Function}b onSuccess - A function callback to run when writing is successful
	 * @param {Function} onErorr - A function callback to run when writing fails
	 */
	editProfileData(newProfileData, onSuccess, onError) {
		const userID = newProfileData.id;

		this.refDB.child('Users/' + userID).once('value', (snapshot) => {
			let originalUserData = snapshot.val();
			let updatedObj = this.merge(originalUserData, newProfileData);
			this.refDB.child('Users/').child(userID).set(updatedObj, onSuccess).catch(onError);
		}).catch((error) => {
			onError(error);
			console.log(error);
		});
	}

	/**
	 * Merges the data of two objects. Keeps everything in originalObj, adds any key in newObj and overwrites duplicates in originalObj.
	 *
	 * @param {Object} originalObj - Original data to replace
	 * @param {Object} newObj - New data to add
	 *
	 * @return {Object} Merged data
	 */
	merge(originalObj, newObj) {
		// Merge them together by just overwriting existing keys and adding new ones
		// key: the name of the object key
		// index: the ordinal position of the key within the object 
		Object.keys(newObj).forEach((key,index) => {
			originalObj[key] = newObj[key];
		});
		return originalObj; // Need to return original because it has datetime and owner
	}

	/**
	 * Read data from the user table once, only looking for a specific user id.
	 *
	 * @param {string} id - The current user's id
	 * @param {Function} callback - A function callback that is with the value(s) read
	 */
	readProfileDataOnce(id, callback) {
		this.refDB.child('Users/' + id).once('value', callback);
	}

	/**
	 * Read data from the bike table only once.
	 *
	 * @param {Function} callback - A function callback that is with the value(s) read
	 */
	readBikeDataOnce(callback) {
		this.refDB.child('Bike/').once('value', callback);
	}

	/**
	 * Read data from the bike table every time there is a change in the database.
	 *
	 * @param {Function} callback - A function callback that is with the value(s) read
	 * @return {Object} A listener from the 'on' function
	 */
	readBikeDataOn(callback) {
		return this.listenOn('Bike/', 'value', callback);
		// this.refDB.child('Bike/').on('value', callback);
	}

	readBikeDataOff(listener) {
		this.listenOff('Bike/', 'value', listener);
	}

	/**
	 * General function for listening to the database for events.
	 * Be as specific as possible when specifying the child (don't just listen on root).
	 * See https://firebase.google.com/docs/reference/js/firebase.database.Reference#on
	 * for event names.
	 *
	 * @param {string} child - A child to listen on
	 * @param {string} event - An event to listen for
	 * @param {Function} callback - A function callback to trigger when data is recieved
	 * @return {Object} A listener from the 'on' function
	 */
	listenOn(child, event, callback) {
		return this.refDB.child(child).on(event, callback);
	}

	listenOff(child, event, listener) {
		this.refDB.child(child).off(event, listener);
	}

	/**
	 * Removes a bike id from the database.
	 *
	 * @param {string} key - A bike id to remove
	 * @param {Function} callback - A function callback to trigger when the bike is removed
	 */
	removeBikeItem(key, callback) {
		this.removeItem('Bike/', key, callback);
	}

	/**
	 * Removes an item from the database given by 'removeChild' in the 'table'.
	 *
	 * @param {string} table - A table to remove from
	 * @param {string} removeChild - A child id to remove
	 * @param {Function} callback - A function callback to trigger when item is removed
	 */
	removeItem(table, removeChild, callback) {
		this.refDB.child(table).child(removeChild).remove().then(() => {
			callback(true);
		}).catch(() => {
			callback(false);
		});
	}

	/**
	 * Trigger the on reads by adding and removing an item from the database in the Bike Table.
	 *
	 * @param {Object} data - The temporary object to store
	 * @param {Function} onError - A callback function if there is an error writing
	 */
	triggerTemporaryItem(data, onError) {
		this.refDB.child('Bike/').child(data.tempID).set(data, (result) => {
			this.refDB.child('Bike/').child(data.tempID).remove();
		}).catch(onError);
	}

	/**
	 * Returns a new unique key generated by the database.
	 *
	 * @return {string} A newly generated unique key
	 */
	getNewBikeID() {
		return this.refDB.child('Bike').push().key;
	}

	/**
	 * Returns a new unique key generated by the database. Shouldn't need to use this because user IDs are generated on Sign-up.
	 */
	getNewProfileID() {
		return this.refDB.child('Users').push().key;
	}

	/**
	 * Makes the database go offline.
	 */
	goOffline() {
		firebase.database().goOffline();
	}

	/**
	 * Makes the database go online.
	 */
	goOnline() {
		firebase.database().goOnline();
	}

	/**
	 * Removes an item from the database by a supplied key.
	 *
	 * @param {string} key - An id in the database
	 */
	// removeBikeItem(key) {
	// 	this.refDB.child('Bike').child(key).remove();
	// }

	/**
	 * Returns the currently logged in user's id.
	 *
	 * @param {Function} onComplete - A callback function when the state has changed 
	 */
	getCurrentUser(onComplete) {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				console.log("user id: " + user.uid);
				onComplete(user.uid);
			} else {
				console.log("user not defined");
				onComplete(null);
			}
		});
	}

	/**
	 * Listens for authentication changes and only calls the onSuccess function if a user is defined.
	 *
	 * @param {Function} onSuccess - A callback function when the state has changed and a user is defined
	 */
	listenForAuthChange(onSuccess) {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				console.log("user id: " + user.uid);
				onSuccess(user.uid);
			}
		});
	}

	/**
	 * Remove a images by their url from storage.
	 *
	 * @param {string} thumbnails - A list of images to delete
	 * @param {Function} callback - A function to call on completion or on failure
	 */
	removeImages(thumbnails, callback) {
		let result = true;
		const storageWithoutRef = this.getStorageWithoutRef(); // We need to use the refFromURL so we can only use the storage without a reference
		// Firebase does not support deleting directories so we must loop through the thumbnails and delete each file
		for (let i=0; i < thumbnails.length; i++) {
			storageWithoutRef.refFromURL(thumbnails[i]).delete().then(() => { 
				result = result && true; 
			}).catch((error) => { 
				result = result && false; 
			});	
		}
		callback(result);
	}

	/**
	 * Return the possible image folders in the firebase storage.
	 * See top definitions for names.
	 * Possible TODO : Fetch folder names from the storage so to not hardcode them in.
	 *
	 * @return {Object} The string names of the folders, includes '/' in each name
	 */
	getImageFolders() {
		return { BikeImages, ProfileImages };
	}

	/**
	 * Asynchronously write an image to firebase storage.
	 *
	 * @param {string} id - The id of the bike to write to
	 * @param {Object} file - The file object to write
	 * @param {string} filename - The name of the file
	 * @param {string} baseFolder - The base folder of the images. One of "BikeImages/", "ProfileImages/" etc. (Must include '/')
	 * @param {Function} onSuccess - The callback to call on a successful upload
	 * @param {Function} onError - The callback to call on a failed upload
	 */
	async writeImage(id, file, filename, baseFolder, onSuccess, onError) {
		// Create a blob because the firebase 'put' function requires a blob
		// I found out later that when we get an image from the user, we can actually get it as data
		// and since the firebase 'put' function also accepts the data format, we can use that instead
		// which would save the XMLHttpRequest to create a blob.
		// TODO : Optimization - Use data format for images instead of creating a blob which would eliminate
		// the following Promise
		const blob = await new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.onload = () => {
				resolve(xhr.response);
			};
			xhr.onerror = (e) => {
				console.log(e);
				reject(new TypeError('Network request failed'));
			};
			xhr.responseType = 'blob';
			xhr.open('GET', file.uri, true);
			xhr.send(null);
		});

		const task = this.refStorage.child(baseFolder + id + '/' + filename).put(blob);
		task.on('state_changed', (snapshot) => {
			// Observe state change events such as progress, pause, and resume
			// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
			let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			console.log('Upload is ' + progress + '% done');
			switch (snapshot.state) {
				case firebase.storage.TaskState.PAUSED: // or 'paused'
					// console.log('Upload is paused');
					break;
				case firebase.storage.TaskState.RUNNING: // or 'running'
					// console.log('Upload is running');
					break;
			}
		}, onError, () => {
			task.snapshot.ref.getDownloadURL().then((downloadURL) => {
				// console.log('File available at', downloadURL);
				blob.close(); // Make sure to close the blob
				onSuccess(downloadURL);
				return null;
			});
		});
	}

	/*
	 * Use this function when moving to react-native-firebase. The above function works with regular firebase.
	 */
	// async writeImage(id, file, filename, baseFolder, onSuccess, onError) {
	// 	const task = this.refStorage.child(baseFolder + id + '/' + filename).putFile(file.uri);
	// 	task.on('state_changed', (snapshot) => {
	// 		// Observe state change events such as progress, pause, and resume
	// 		// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
	// 		let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
	// 		console.log('Upload is ' + progress + '% done');
	// 		switch (snapshot.state) {
	// 			case firebase.storage.TaskState.PAUSED: // or 'paused'
	// 				// console.log('Upload is paused');
	// 				break;
	// 			case firebase.storage.TaskState.RUNNING: // or 'running'
	// 				// console.log('Upload is running');
	// 				break;
	// 		}
	// 	}, onError, () => {
	// 		task.snapshot.ref.getDownloadURL().then((downloadURL) => {
	// 			// console.log('File available at', downloadURL);
	// 			blob.close(); // Make sure to close the blob
	// 			onSuccess(downloadURL);
	// 			return null;
	// 		});
	// 	});
	// }
}

const Database = new FirebaseDatabase();
export default Database;