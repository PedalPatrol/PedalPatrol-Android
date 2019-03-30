import AlertModel from './alert-model';
import AuthLoadingModel from './authloading-model';
import BikeModel from './bike-model';
import HomeModel from './home-model';
import LoginModel from './login-model';
import MapModel from './map-model';
import ProfileModel from './profile-model';
import SignUpModel from './signup-model';


/**
 * This file allows for singleton instances of a class to be created.
 * To export a new model, add the class instance creation as a const below,
 * then add the name to the export list.
 * To import in a new class add the following line to the top of the file:
 * import { NameM } from '../models/export-models';
 * where NameM is the name of the instance.
 */
const AlertM = new AlertModel();
const AuthLoadingM = new AuthLoadingModel();
const BikeM = new BikeModel();
const HomeM = new HomeModel();
const LoginM = new LoginModel();
const MapM = new MapModel();
const ProfileM = new ProfileModel();
const SignUpM = new SignUpModel();


export {
	AlertM,
	AuthLoadingM,
	BikeM, 
	HomeM,
	LoginM,
	MapM,
	SignUpM,
	ProfileM
};