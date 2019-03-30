import React, {Component} from 'react';

import {Platform, StyleSheet, Text, View, Button, Alert, TouchableOpacity, Dimensions, NativeModules, ScrollView} from 'react-native';

import {Icon} from 'react-native-elements';

import {default as RNMapView} from 'react-native-maps';

import { Marker, Callout, Polygon, Circle } from 'react-native-maps';

import SectionedMultiSelect from 'react-native-sectioned-multi-select';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';



import { styles, colours, map_styles, autocomplete_styles, STATUSBAR_HEIGHT } from './stylesheets/map-styles';



import MapPresenter from '../presenters/map-presenter';

import BaseView from './view';

import SafeArea from './helpers/safearea';

import ProfileButton from './helpers/profilebutton';

import ActionButton from './helpers/ActionButton/ActionButton';

import TimeUtil from '../../util/timeutility';



/**

 * Class for the Map view

 * @extends BaseView

 */

class MapView extends BaseView {



	/**

	* Create an instance of LoginView

	*

	* @constructor

	* @param {Object} props - Component properties

	*/

	constructor(props){

	   super(props);

	   this.MapP = new MapPresenter(this);

 this.resetState();

	}



	/**

	 * Resets the state with default variables

	 */

	resetState = () => {

		this.state = {

			refresh: true,

			circleRadius : 500,

			x: {

				latitude: 44.257424,

				longitude: -76.5231,

			},



			showCircle: false,

			showMarker: false,

			markerCreated:[],

			markers: [],

			markerRefs: {},

			tempMarkers: [],

			tempMarkerRefs: [],

			foundMarker: null,

			foundCalloutOpened: false,

			selectedFilters: [0],

			profileData: {},

		};

	}



	/**

	 * Refreshes the state of the component so new data is fetched.

	 */

	refreshState = () => {

		this.setState({

			refresh: !this.state.refresh

		});

	}



	componentWillMount = () => {

		this._setProfileImage();

		this._setUserLocation();


	}



	/**

	 * Triggers when the component is mounted.

	 */

	componentDidMount = () => {


		this.MapP.forceRequestData();



		this._setMarkers(this.state.selectedFilters);

	};



	/**

	 * Component will receive new properties via the props attribute

	 */

	componentWillReceiveProps = () => {

		const { navigation } = this.props;

		const data = navigation.getParam('data', 'NO-DATA');

		const found = navigation.getParam('found', false);



		if (found) {

			const foundMarker = this._createNewMarker(data);

			this.setState({foundCalloutOpened: true});

			this.state.tempMarkers = [foundMarker]; // We just overwrite because best to only keep track of one

		} else if (data !== 'NO-DATA') {

			// Only set the location if the marker wasn't clicked from the Alerts page

			this._setLocationToMarkerItem(this.state.markerRefs, data, true);

		}

	}



	/**

	 * Component is about to unmount, do any cleanup here.

	 * Call viewUnmounting in base class so it can do any cleanup for the view before calling the presenter destroy method

	 */

	componentWillUnmount = () => {

		this.viewUnmounting(this.MapP);

	}



	/**

	 * Component's state has updated

	 */

	componentDidUpdate = () => {

		if (this.state.tempMarkers.length !== 0 && this.state.foundCalloutOpened) {

			this.setState({foundCalloutOpened: false})

			this._setLocationToMarkerItem(this.state.tempMarkerRefs, this.state.tempMarkers[0].data, true);

		}

	}



	/**

	 * Sets markers according to the filter, if any, that is set.

	 *

	 * @param {List} selectedFilters - A list of selected filters. Indices correspond to places in the list in the 'filters' constant

	 */

	_setMarkers = (selectedFilters) => {

		this.setState({

			markers : this.MapP.filterMarkers(this.MapP.getData(), selectedFilters.length > 0 ? filters[selectedFilters[0]] : null)

		});

	}





	/**

	 * Add the new selected items to the state and update

	 *

	 * @param {List} selectedFilters - List of selected items

	 */

	_onSelectedItemsChange = (selectedFilters) => {

		this.setState({ selectedFilters });

		this._setMarkers(selectedFilters);

	}



	/**

	 * Creates a new marker from the data.

	 *

	 * @param {Object} data - The data from the marker to be created

	 * @return {Object} A new marker object with data, key and coordinate properties

	 */

	_createNewMarker = (data) => {

		const newMarker = {

				data: data,

				key: data.id,

				coordinate: {

					latitude: data.found_latitude,

					longitude: data.found_longitude,

				}

		}



		return newMarker;

	}



	/**

	 * Sets the location of the map to the marker's position and open its callout.

	 *

	 * @param {List} refs - A list of marker references

	 * @param {Object} item - The marker's data

	 * @param {Boolean} shouldReshowCallout - If the callout should be triggered twice on a delay. default=false

	 */

	_setLocationToMarkerItem = (refs, item, shouldReshowCallout=false) => {

		if (item.hasOwnProperty('longitude') && item.hasOwnProperty('latitude')) {

			const location = {

				latitude: item.latitude,

				longitude: item.longitude,

				latitudeDelta: 0.0922,

				longitudeDelta: 0.0421,

			};

			this.onRegionChange(location);

			refs[item.id].showCallout();



			// Sometimes the callouts don't popup immediately so we have to call it again after 50 milliseconds

			if (shouldReshowCallout) {

				setTimeout(() => {refs[item.id].showCallout();}, 50);

			}

		}

	}



	/**

	 * Sets the user's location to their current location.

	 */

	_setUserLocation = () => {

		this.MapP.getUserLocation().then(position => {

			if (position) {

				const location = {

					latitude: position.coords.latitude,

					longitude: position.coords.longitude,

					latitudeDelta: 0.0922,

					longitudeDelta: 0.0421,

				};

				this.setState({

					x: location,

					user: location,

					region: location

				});

			}

		});

	}



	/**

	 * Render "save/delete" button after clicking "create lost report" button

	 */

	// renderSDButton(){

	// 	if (this.state.showButton){

	// 		return(

	// 		<View style={map_styles.saveDeleteButton}>

	// 			<View style={map_styles.Buttons}>

	// 			<Button

	// 				onPress={()=>{this.sendNewMarker()}}

	// 				title="save"/></View>

	// 			   <View style={map_styles.Buttons}>

	// 			<Button

	// 				onPress={()=>{

	// 					this.deleteItem()

	// 				}}

	// 				title="delete"/></View>

	// 		</View>

	// 		)

	// 	}

	// }



/**

	* Render a searchbar for user to search location after clicking "search location" button

	*/

	renderSearchbar = () => {

		if (this.state.showSearchbar){

			return (

				<GooglePlacesAutocomplete

						placeholder='Enter location'

						minLength={2} // minimum length of text to search

						autoFocus={false}

						returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype

						listViewDisplayed='true'     // true/false/undefined

						fetchDetails={true}

						onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true

							console.log(data, details);

							this.setState({

								showSearchbar:false,

								region: {

									latitude: details.geometry.location.lat,

									longitude: details.geometry.location.lng,

									latitudeDelta: 0.0922,

									longitudeDelta: 0.0421,

								}

							});

						}}

						getDefaultValue={() => ''}

						query={{

							// available options: https://developers.google.com/places/web-service/autocomplete

							key: 'AIzaSyCS9j9HB64sW9w8LgvtxVET6LqoET78OcA',

							language: 'en', // language of the results

						}}

						styles={autocomplete_styles}

						debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.

					  />



			);

		}

	}



	/**

	 *  Save data of created marker or circle after clicking save button

	 */

	saveItem(){

		if (this.state.showCircle){

			this.saveCircle();

			this.setState({

				showCircle: false,

				showMarker: false

			});

		}

		if (this.state.showMarker){

			this.sendNewMarker();

			this.setState({

				showCircle: false,

				showMarker: false

			});

		}

	}



	/**

	 * Delete created marker or circle after clicking delete button

	 */

	deleteItem(){

		this.setState()

		if (this.state.showCircle){

			this.setState({

				x:{

					latitude: 44.257424,

					longitude: -76.5231,

				},

				circleRadius: 500,

				showCircle: false,

				showMarker: false

			});

		} else if (this.state.showMarker) {

			this.setState({showMarker:false, showCircle: false, markerCreated:[]})

		}



	}



	/**

	 * Render buttons that can adjust circle's radius

	 */

	// renderForCircle(){

	// 	if (this.state.showCircle){

	// 		return(

	// 		<View style={map_styles.circleRadiusButton}>

	// 			<View style={map_styles.Buttons}>

	// 			<Button

	// 				onPress={()=>{this.setState({circleRadius: this.state.circleRadius+200})}}

	// 				title="more"/></View>

	// 			   <View style={map_styles.Buttons}>

	// 			<Button

	// 				onPress={()=>{if (this.state.circleRadius>200){this.setState({circleRadius: this.state.circleRadius-200})}}}

	// 				title="less"/></View>

	// 		</View>

	// 		)

	// 	}

	// }



	/**

	 * Render a circle to set notification receiving area

	 */

	renderCircle(){

		if (this.state.showCircle){

			return (

				<Circle

					center = {{latitude:this.state.x.latitude,longitude:this.state.x.longitude}}

					radius = {this.state.circleRadius}

					strokeColor = "#4F6D7A"

					strokeWidth = { 2 }

					fillColor = 'rgba(200,0,0,0.5)'/>

			)

		}

	}



	/**

	 * Save data of circle to notification settings

	 */

	saveCircle(){

		//nothing

		newData = {

			data: {

				circleLatitude: this.state.x.latitude,

				circleLongitude: this.state.x.longitude,

				radius: this.state.circleRadius,

			}

		}

		// console.log(newData);

	}



	/**

	 * Save data of created marker to report lost page

	 */

	sendNewMarker() {

		newData={

			data:

				{

					latitude: this.state.markerCreated[0].coordinate.latitude,

					longitude: this.state.markerCreated[0].coordinate.longitude,

				}

		}

		this.navigate('ReportLost', newData);

	}



	/**

	 *  Long press the map to change the coordinate of circle

	 *

	 * @param {Event} The event of long press on the map

	 */

	setCircleLat(e) {

		let cor = e.nativeEvent.coordinate;

		if (this.state.showCircle){

			this.setState({

				x: {

					latitude: cor.latitude,

					longitude: cor.longitude,

				}



			})

		}

	}



	/**

	 * handle click event after clicking "create marker" button

	 */

	_onPinMarkerPress=()=> {

		if (this.state.showMarker) {

			this.setState({

				showMarker: false,

				showCircle: false,

				markerCreated: []

			});

			this.circleABRef.reset();

		} else {

			this.setState({

				showMarker: true,

				showCircle: false,

				markerCreated:  [this.newMarker(this.state.region.latitude,this.state.region.longitude)],

			});

			this.circleABRef.reset();

		}

	}



	/**

	 * helper function of _onPinMarkerPress

	 *

	 * @param {Integer} latitude and longitude of a marker

	 */

	newMarker = (lat,long) => {

		const key = this.state.markers.length-1

		return({key, coordinate: {latitude: lat,longitude: long}});

	};



	/**

	 *  Change region state as moving the map

	 *

	 * @param {region} A presenter class instance

	 */

	onRegionChange = (region) => {

	  this.setState({region: region });

	};



	/**

	 * Sets the state to the profile data retrieved from the model.

	 */

	_setProfileImage = () => {

		this.MapP.getProfileImage((result) => this.setState({profileData: result}));

	}



	/**

	 * Get the string to display from the colours list.

	 *

	 * @param {List} colours - A list of colours

	 * @return {string} A string obtained from the colours in the list

	 */

	_getColourString = (colours) => {

		let colourString = '';

		if (colours != null && colours != undefined) {

			colourString = 'Colour';

			colourString = colourString + ((colours.length > 1) ? "s: " : ": ") + colours.join(', ');

		}

		return colourString

	}



	/**

	 * Renders the callout for a marker.

	 *

	 * @param {Object} item - The data to display for a marker

	 */

	_renderCallout = (item) => (

		<Callout onPress={() => {this.navigate('BikeDetails', item.data)}}>

			<ScrollView>

				<ScrollView horizontal>

					<View style={map_styles.calloutColumn}>

						<View style={map_styles.calloutRow}>

							<Text style={map_styles.modelText} numberOfLines={1} ellipsizeMode ={'tail'}>

								{item.data.model == undefined || item.data.model === '' ? 'Model Unknown' : item.data.model}

							</Text>

							<Text numberOfLines={1} ellipsizeMode={'tail'}>

							{'   '}

							</Text>

							<View style={map_styles.timeago}>

								<Text style={[map_styles.mapText, map_styles.timeagoText]} numberOfLines={1} ellipsizeMode ={'tail'}>

									{item.data.timeago}

								</Text>

							</View>

						</View>

						{

							item.data.brand != undefined && item.data.brand !== '' &&

							<Text style={map_styles.mapText}>

								{item.data.brand != '' ? "Brand: " + item.data.brand : ''}

							</Text>

						}

						{

							item.data.colour != undefined && item.data.colour.length !== 0 &&

							<Text style={map_styles.mapText}>

								{this._getColourString(item.data.colour)}

							</Text>

						}

					</View>

				</ScrollView>

			</ScrollView>

		</Callout>

	);



	_renderSaveActionButton = () => (

		<ActionButton.Item

			onPress={()=>{this.saveItem(); this.circleABRef.reset(); this.pinABRef.reset();}}

			buttonColor={colours.ppPinGreen}

			style={map_styles.iconButton}

			title="Save">

			<Icon name="check" type="font-awesome" size={22} color={colours.ppWhite} />

		</ActionButton.Item>

	);



	_renderCancelActionButton = () => (

		<ActionButton.Item

			onPress={()=>{this.deleteItem(); this.circleABRef.reset(); this.pinABRef.reset();}}

			buttonColor={colours.ppPinRed}

			style={map_styles.iconButton}

			title="Cancel">

			<Icon name="times" type="font-awesome" size={22} color={colours.ppWhite} />

		</ActionButton.Item>

	);



	_renderActionButtonPinIcon = () => (

		<Icon name="pin-drop" type="MaterialIcons" size={35} color={this.state.showMarker ? colours.ppWhite : colours.ppBlue} />

	);



	_renderActionButtonAddIcon = () => (

		<Icon name="add-circle" type="MaterialIcons" size={35} color={this.state.showCircle ? colours.ppWhite : colours.ppBlue}/>

	);



	_toggleCircle = () => {

		if (this.state.showCircle) {

			this.setState({

				showCircle: false, showMarker: false

			});

			this.pinABRef.reset();

		} else {

			this.setState({showCircle: true, showMarker:false, markerCreated:[]});

			this.pinABRef.reset();

		}

	}



	/**

	 * Navigate to a page with a title.

	 * This method is used over the commented out line below because successive touches of a bike item

	 * would not add the data because data is only received in process in the componentWillMount function.

	 * So adding the 'key' property to navigate makes it see that the new page is unique.

	 *

	 * @param {string} screen - The route to navigate to. See navigation.js stacks and screens

	 */

	navigate = (screen, data) => {

		this.props.navigation.navigate({

			routeName: screen,

			params: {

				data: data,

				from: 'Map'

			},

			key: screen + TimeUtil.getDateTime()

		});

	}



	/**

	 * Extract data from the component's view and send an update to the presenter to do any logic before sending it to the model

	 */

	render() {

		const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

		const varTop = windowHeight - 100;

		const highestIcon = 50;

		const hitSlop = {

			top: 15,

			bottom: 15,

			left: 15,

			right: 15,

		}

		let bbStyle = (vheight, start=false) => {

			let style = {

				position: 'absolute',

				top: vheight-20,

				left: start ? 5 : windowWidth-60,

				right: start ? 5 : windowWidth-60,

				width: map_styles.iconButton.width,

				backgroundColor: 'transparent',

				alignItems: start ? 'flex-start' : 'flex-end',

				alignSelf: start ? 'flex-start' : 'flex-end',

			};

			return style;

		}





		return (

				<View style={{ flex: 1 }}>

					{

						this.state.showSearchbar &&

						<SafeArea overrideColour={colours.ppGrey}/>

					}



					<RNMapView

						style={{flex:1}}

						region={this.state.region}

						style={map_styles.map}

						showsUserLocation={true}

						showsMyLocationButton={true}

						rotateEnabled={true}

						onRegionChangeComplete={this.onRegionChange.bind(this)}

						onLongPress = {e => this.setCircleLat(e)}

 onPress = {() => {this.setState({showSearchbar:false})}}>

						{this.state.markers.map(marker => (

							<Marker

								{...marker}

								ref={(ref) => this.state.markerRefs[marker.key] = ref}

								pinColor={marker.data.stolen ? colours.ppPinRed : colours.ppPinGreen}>

								{this._renderCallout(marker)}

							</Marker>

						))}

						{this.state.tempMarkers.map(marker => (

							<Marker

								{...marker}

								ref={(ref) => this.state.tempMarkerRefs[marker.key] = ref}

								pinColor={marker.data.stolen ? colours.ppPinRed : colours.ppPinGreen}>

								{this._renderCallout(marker)}

							</Marker>

						))}

						{this.state.markerCreated.map(marker => (<Marker draggable{...marker} />))}

						{this.renderCircle(this)}

					</RNMapView>



					{this.renderSearchbar()}



					{/* Height of search bar container covers the profile button and the search button so we don't */}

					{/* need to use this.state.showSearchbar to block rendering. If we block rendering with that, then */}

					{/* profile button will re-render and there will be a visible flicker of the profile picture. */}



					<View style={[bbStyle(highestIcon, true), {zIndex: 11, width: map_styles.iconButton.width+2}]}>

						<ProfileButton

							hitSlop={hitSlop}

							profilePicture={this.state.profileData.profilePicture}

							numNotifications={this.MapP.getNotificationCount()}/>

					</View>



					<View style={bbStyle(highestIcon)}>

						<TouchableOpacity

							style={map_styles.iconButton}

							accessibilityLabel="Search"

							hitSlop={hitSlop}

							onPress={() => {this.setState({showSearchbar:true})}}>

							<Icon name="search" type="MaterialIcons" size={35} color={colours.ppBlue} />

						</TouchableOpacity>

					</View>



					<View style={bbStyle(125)}>

						<TouchableOpacity

							style={map_styles.iconButton}

							accessibilityLabel="Filter"

							hitSlop={hitSlop}

							onPress={() => this.sectionedMultiSelect._toggleSelector()}>

							<Icon name="filter-list" type="MaterialIcons" size={35} color={colours.ppBlue} />

						</TouchableOpacity>



						{/* This is hidden */}

						<SectionedMultiSelect

							style={{zIndex: -5}}

							items={filters}

							displayKey='name'

							confirmText='Cancel'

							uniqueKey={'id'}

							colors={{ primary: this.state.selectedFilters.length ? 'forestgreen' : 'crimson' }}

							selectText=''

							hideSelect

							showDropDowns

							single

							showChips={false}

							alwaysShowSelectText={false}

							showCancelButton={false}

							onSelectedItemsChange={this._onSelectedItemsChange}

							selectedItems={this.state.selectedFilters}

							ref={(SectionedMultiSelect) => this.sectionedMultiSelect = SectionedMultiSelect}/>

					</View>



					<View style={[bbStyle(varTop-map_styles.iconButton.height-35), {marginLeft: 10}]}>

						<ActionButton

							active={this.state.showMarker}

							buttonColor={colours.ppWhite}

							btnOutRange={colours.ppBlue}

							style={map_styles.iconButton}

							radius={65}

							autoInactive={false}

							position={'right'}

							startDegree={0}

							refer={(ref) => this.pinABRef = ref}

							size={map_styles.iconButton.width}

							icon={this._renderActionButtonPinIcon()}

							onPress={this._onPinMarkerPress}>

							{this._renderSaveActionButton()}

							{this._renderCancelActionButton()}

						</ActionButton>

					</View>



					<View style={[bbStyle(varTop-map_styles.iconButton.height*2-37*3), {marginLeft: 10}]}>

						<ActionButton

							active={this.state.showCircle}

							buttonColor={colours.ppWhite}

							btnOutRange={colours.ppBlue}

							style={map_styles.iconButton}

							radius={65}

							autoInactive={false}

							position={'right'}

							startDegree={90}

							refer={(ref) => this.circleABRef = ref}

							size={map_styles.iconButton.width}

							icon={this._renderActionButtonAddIcon()}

							onPress={this._toggleCircle}>

							<ActionButton.Item

								onPress={()=>{if (this.state.circleRadius>200){this.setState({circleRadius: this.state.circleRadius-200})}}}

								buttonColor={colours.ppBlue}

								style={map_styles.iconButton}

								title="Less">

								<Icon name="minus" type="font-awesome" size={22} color={colours.ppWhite} />

							</ActionButton.Item>

							<ActionButton.Item

								onPress={()=>{this.setState({circleRadius: this.state.circleRadius+200})}}

								buttonColor={colours.ppBlue}

								style={map_styles.iconButton}

								title="More">

								<Icon name="plus" type="font-awesome" size={22} color={colours.ppWhite} />

							</ActionButton.Item>

							{this._renderSaveActionButton()}

							{this._renderCancelActionButton()}

						</ActionButton>

					</View>



					<View style={bbStyle(varTop)}>

						<TouchableOpacity

							hitSlop={hitSlop}

							accessibilityLabel="Current Location"

							style={map_styles.iconButton}

							onPress={ () => this._setUserLocation() }>

							<Icon name="location-arrow" type="font-awesome" size={20} color={colours.ppBlue} />

						</TouchableOpacity>

					</View>



					{/*this.renderSDButton(this)*/}

					{/*this.renderForCircle(this)*/}

				</View>

		);

	}

}



/* <TouchableOpacity

							style={map_styles.iconButton}

							accessibilityLabel="Lost Report"

							hitSlop={hitSlop}

							onPress={this._onPinMarkerPress}>

							<Icon name="pin-drop" type="MaterialIcons" size={35} color={colours.ppBlue} />

						</TouchableOpacity> */



		/*<TouchableOpacity

							style={map_styles.iconButton}

							accessibilityLabel="Receiving Area"

							hitSlop={hitSlop}

							onPress={()=>{this.setState({showCircle: true,showButton:true,showMarker:false,markerCreated:[]})}}>

							<Icon name="add-circle" type="MaterialIcons" size={35} color={colours.ppBlue} />

						</TouchableOpacity> */



export default MapView;



const filters = [

	{

		id: 0,

		name: 'None'

	},

	{

		id: 1,

		name: '< 1 min ago',

	},

	{

		id: 2,

		name: '< 1 hour ago',

	},

	{

		id: 3,

		name: '< 12 hours ago',

	},

	{

		id: 4,

		name: '< 1 day ago',

	},

	{

		id: 5,

		name: '< 7 days ago',

	},

	{

		id: 6,

		name: '< 1 month ago',

	},

	{

		id: 7,

		name: '< 1 year ago',

	}

]