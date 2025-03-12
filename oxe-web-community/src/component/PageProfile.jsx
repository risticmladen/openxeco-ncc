import React from "react";
import "./PageProfile.css";
import vCard from "vcf";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getApiURL } from "../utils/env.jsx";
import Info from "./box/Info.jsx";
import FormLine from "./form/FormLine.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import {
	validatePassword, validateTelephoneNumber, validateNotNull, validateName,
} from "../utils/re.jsx";
import Loading from "./box/Loading.jsx";
import Message from "./box/Message.jsx";
import UpdateProfile from "./pageprofile/UpdateProfile.jsx";
import DialogConfirmation from "./dialog/DialogConfirmation.jsx";

export default class PageProfile extends React.Component {
	constructor(props) {
		super(props);

		this.refreshProfile = this.refreshProfile.bind(this);
		this.changePassword = this.changePassword.bind(this);
		this.generateHandle = this.generateHandle.bind(this);
		this.updateUser = this.updateUser.bind(this);
		this.updateProfile = this.updateProfile.bind(this);
		this.setProfileValues = this.setProfileValues.bind(this);
		this.updateDetails = this.updateDetails.bind(this);
		this.uploadProfileImage = this.uploadProfileImage.bind(this);
		this.deleteUserAfterCheck = this.deleteUserAfterCheck.bind(this);
		this.deleteUser = this.deleteUser.bind(this);
		this.fetchCheckUsers = this.fetchCheckUsers.bind(this);
		this.getCheckEntityUsers = this.getCheckEntityUsers.bind(this);
		
		this.state = {
			currentUser: null,
			dbVcard: null,
			currentVcard: null,
			userChanged: false,
			profileChanged: false,
			userProfile: null,
			socialEmpty: true,
			password: "",
			newPassword: "",
			newPasswordConfirmation: "",
			fullName: "",
			title: "",
			email: "",
			entityToDelete: "",
			passwordForDelete: "",
			countries: [],
			professions: [],
			profilePic: null, // New state variable
		};
	}

	componentDidMount() {
		this.refreshProfile();

		getRequest.call(this, "public/get_public_countries", (countriesData) => {
			this.setState({
				countries: countriesData,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_professions", (professionsData) => {
			this.setState({
				professions: professionsData,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});
	}

	refreshProfile(forceImageRefresh = false) {
		this.setState({
			userProfile: null,
			profileChanged: false,
			userChanged: false,
		});

		getRequest.call(this, "private/get_my_user", (userData) => {
			/* eslint-disable new-cap */
			this.setState({
				currentUser: userData,
				dbVcard: userData.vcard ? new vCard().parse(userData.vcard) : new vCard(),
				currentVcard: userData.vcard ? new vCard().parse(userData.vcard) : new vCard(),
			});
			/* eslint-enable new-cap */
			// console.log("User data fetched:", userData);
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "private/get_my_profile", (profileData) => {
			this.setState({
				userProfile: profileData,
			});
			if (forceImageRefresh || !this.state.profilePic) {
				const timestamp = new Date().getTime(); // Generate a unique timestamp
				const imageUrl = `${getApiURL()}account/get_profile_image/${this.state.userProfile.user_id}?t=${timestamp}`;
				fetch(imageUrl)
					.then((response) => response.json())
					.then((imageData) => {
						if (imageData.image) {
							this.setState({ profilePic: imageData.image });
						} else {
							this.setState({ profilePic: null });
						}
					})
					.catch(() => {
						this.setState({ profilePic: null });
					});
			}
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changePassword(close) {
		const params = {
			password: this.state.password,
			new_password: this.state.newPassword,
		};

		postRequest.call(this, "account/change_password", params, () => {
			this.setState({
				password: "",
				newPassword: "",
				newPasswordConfirmation: "",
			});
			nm.info("The password has been changed");

			if (close) {
				close();
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getVcardValue(key) {
		if (this.state.currentVcard && this.state.currentVcard.get(key)) {
			if (key === "socialprofile" && !Array.isArray(this.state.currentVcard.get(key))) {
				return [this.state.currentVcard.get(key)];
			}
			return this.state.currentVcard.get(key);
		}

		return null;
	}

	updateCurrentVcard(key, value, params) {
		if (this.state.currentVcard) {
			this.state.currentVcard.set(key, value && value.length > 0 ? value : null, params);
			this.setState({ userChanged: true });
			this.forceUpdate();
		}
	}

	updateSocialeProfilePlatform(pos, value) {
		let properties = this.state.currentVcard.get("socialprofile");
		let loop = 0;

		if (!Array.isArray(this.state.currentVcard.get("socialprofile"))) {
			properties = [properties];
		}

		properties.forEach((p, i) => {
			if (loop === 0) {
				this.state.currentVcard.set("socialprofile", p.valueOf(), { type: pos === i ? value : p.type });
				loop++;
			} else {
				this.state.currentVcard.add("socialprofile", p.valueOf(), { type: pos === i ? value : p.type });
			}
		});

		this.setState({ userChanged: true });
		this.forceUpdate();
	}

	updateSocialeProfileLink(pos, value) {
		let properties = this.state.currentVcard.get("socialprofile");
		let loop = 0;

		if (!Array.isArray(this.state.currentVcard.get("socialprofile"))) {
			properties = [properties];
		}

		properties.forEach((p, i) => {
			if (loop === 0) {
				this.state.currentVcard.set("socialprofile", pos === i ? value : p.valueOf(), { type: p.type });
				loop++;
			} else {
				this.state.currentVcard.add("socialprofile", pos === i ? value : p.valueOf(), { type: p.type });
			}
		});
		this.setState({ userChanged: true });
		this.forceUpdate();
	}

	addCurrentVcardSocialeProfile() {
		this.state.currentVcard.add("socialprofile", "", { type: "Personal website" });
		this.setState({ userChanged: true });
		this.forceUpdate();
	}

	deleteSocialeProfile(pos) {
		let properties = this.state.currentVcard.get("socialprofile");
		let loop = 0;
		if (!Array.isArray(this.state.currentVcard.get("socialprofile"))) {
			properties = [properties];
		}

		if (this.state.currentVcard && this.state.currentVcard.data
			&& this.state.currentVcard.data.socialprofile) {
			delete this.state.currentVcard.data.socialprofile;
		}

		properties.filter((p, i) => i !== pos).forEach((p) => {
			if (loop === 0) {
				this.state.currentVcard.set("socialprofile", p.valueOf(), { type: p.type });
				loop++;
			} else {
				this.state.currentVcard.add("socialprofile", p.valueOf(), { type: p.type });
			}
		});

		this.forceUpdate();
	}

	updateUser() {
		if (this.state.currentUser.telephone !== "" && validateTelephoneNumber(this.state.currentUser.telephone) === false) {
			return;
		}
		const params = {
			handle: this.state.currentUser.handle,
			last_name: this.state.currentUser.last_name,
			first_name: this.state.currentUser.first_name,
			telephone: this.state.currentUser.telephone,
			accept_communication: this.state.currentUser.accept_communication,
			is_vcard_public: this.state.currentUser.is_vcard_public,
			vcard: this.state.currentVcard.toString("4.0"),
		};

		postRequest.call(this, "private/update_my_user", params, () => {
			this.refreshProfile();
			nm.info("The information has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	// isStudentOrRetired() {
	// 	const role = this.state.professions.find(
	// 		(p) => (p.id === this.state.userProfile.profession_id),
	// 	);
	// 	if (role === undefined) {
	// 		return false;
	// 	}
	// 	return role.name === "Student" || role.name === "Retired";
	// }

	isProfileFormValid() {
		let valid = true;
		// const cyprus = this.state.countries.find(
		// 	(country) => (country.name === "Cyprus"),
		// );

		if (this.state.userProfile.telephone !== "" && !validateTelephoneNumber(this.state.userProfile.telephone)) {
			valid = false;
			nm.warning("Telephone number is not valid");
		}

		// if (this.state.userProfile.mobile !== "" &&
		// !validateTelephoneNumber(this.state.userProfile.mobile)) {
		// 	valid = false;
		// 	nm.warning("Mobile number is not valid");
		// }

		if (this.state.userProfile.first_name !== "" && !validateName(this.state.userProfile.first_name)) {
			valid = false;
			nm.warning("Name is not valid");
		}

		if (this.state.userProfile.last_name !== "" && !validateName(this.state.userProfile.last_name)) {
			valid = false;
			nm.warning("Surname is not valid");
		}

		// if (cyprus === undefined
		if (this.state.userProfile.first_name === ""
			|| this.state.userProfile.last_name === ""
			|| this.state.userProfile.entity_name === ""
			|| this.state.userProfile.website === ""
			|| this.state.userProfile.company_email === ""
			|| this.state.userProfile.company_phone === ""
			|| this.state.userProfile.position_organization === ""
			|| this.state.userProfile.address === ""
			|| this.state.userProfile.city === ""
			|| this.state.userProfile.postal_code === ""
			|| this.state.userProfile.person_expertise === ""
			|| this.state.userProfile.detail_expertise === ""
			|| this.state.userProfile.contribution_community === ""
			// || this.state.userProfile.domains_of_interest === null
			// || this.state.userProfile.experience === null
			// || this.state.userProfile.expertise_id === null
			|| this.state.userProfile.gender === null
			// || this.state.userProfile.how_heard === null
			// || this.state.userProfile.nationality_id === null
			// || this.state.userProfile.profession_id === null
			// || this.state.userProfile.residency === null
			// || (
			// 	this.isStudentOrRetired() === false
			// 	&& (this.state.userProfile.sector === null || this.state.userProfile.industry_id === null)
			// )
		) {
			nm.warning("Please fill in all of the required fields");
			valid = false;
		}
		// if (cyprus !== undefined) {
		// 	if (
		// 		this.state.nationality_id !== null
		// 		&& this.state.userProfile.nationality_id !== cyprus.id
		// 		&& this.state.userProfile.residency !== ""
		// 		&& this.state.residency !== "Nicosia"
		// 		&& this.state.residency !== "Limassol"
		// 		&& this.state.residency !== "Larnaca"
		// 		&& this.state.residency !== "Pafos"
		// 	) {
		// 		nm.warning("The account is only available to Maltese or
		// Gozo residents or Maltese nationals");
		// 		valid = false;
		// 	}
		// }
		return valid;
	}

	updateProfile() {
		postRequest.call(this, "account/update_my_profile", { data: this.state.userProfile }, () => {
			nm.info("The information has been updated");
			this.refreshProfile();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateDetails() {
		if (this.state.profileChanged && this.state.userProfile !== null && this.isProfileFormValid()) {
			this.updateProfile();
		}

		if (this.state.userChanged) {
			this.updateUser();
		}
	}

	deleteUserAfterCheck() {
		postRequest.call(this, "private/delete_my_user", {}, () => {			
			nm.info("The account has been deleted");
			// Close the dialog after user is deleted
			//this.dialogRef.current.closePopup();
			this.props.logout();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});	
	}

	getCheckEntityUsers(currentUserId) {
		const userEntities = this.props.myEntities;
		// console.log('userEntities: ', userEntities);
		if(userEntities.length === 0) {
			return this.deleteUserAfterCheck();
		}
		userEntities.forEach((entity) => {
		const entityId = entity.id;
		
			getRequest.call(this, "entity/get_entity_users/" + entityId, (data) => {
					// console.log('getRequest.call and entityId : ', entityId );
					const entityUsers = data;
					// console.log('getRequest.call entityUsers: ', entityUsers);
					const otherUsersExist = entityUsers.some(user => user.id !== currentUserId);

					// console.log('otherUsersExist?: ', otherUsersExist);

					if(!otherUsersExist) {
						nm.warning('You are the only representative of ' + entity.name + '. Please appoint some other member prior account deleting.');
						
					} else {
						// delete user
						this.deleteUserAfterCheck();
					}
				
				}, (response) => {
					nm.warning(response.statusText);
				}, (error) => {
					nm.error(error.message);
				});
			});			
	}

	fetchCheckUsers(currentUserId){

		getRequest.call(this, "user/get_users", (data) => {
			const users = data.items;
			const isOtherAdminsExist = users.some(user => user.is_admin === 1 && user.id !== currentUserId);
		
			
			if(!isOtherAdminsExist) {
				nm.warning('You need to appoint another forum admin prior deleting your account.');
				
			} else {
				this.getCheckEntityUsers(currentUserId);
			}

		}, (response) => {
			nm.warning(response.statusText);
			console.info('get all users response:', response);
		}, (error) => {
			nm.error(error.message);
		});
	}

	deleteUser() {
		const isUserAdmin = this.state.currentUser?.is_admin === 1;
		const currentUserId = this.state.currentUser.id;
		
			if(isUserAdmin){
			//check there is another forum admin then delete if there is any
			this.fetchCheckUsers(currentUserId );
		
		} else {
			//check if entities user represents has another member prior deleting
			this.getCheckEntityUsers(currentUserId);
		}
		
	}

	setProfileValues(newProfile) {
		this.setState({
			userProfile: newProfile,
			profileChanged: true,
		});
	}

	generateHandle(property, value) {
		const params = {
			[property]: value,
		};

		postRequest.call(this, "private/generate_my_user_handle", params, () => {
			this.refreshProfile();
			nm.info("The information has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	updateUserDetail(field, value) {
		const user = this.state.currentUser;
		if (user[field] !== value) {
			user[field] = value;
			this.setState({ currentUser: user });
			this.setState({ userChanged: true });
		}
	}

	disassociateFromEntity(close) {
		const params = {
			entity_id: this.state.entityToDelete,
			password: this.state.passwordForDelete,
		};

		postRequest.call(this, "private/disassociate_from_entity", params, () => {
			this.setState({
				entityToDelete: "",
				passwordForDelete: "",
			});
			nm.info("You have been disassociated from the entity");
			this.props.getMyEntities();
			if (close) {
				close();
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	uploadProfileImage(close) {
		if (!this.state.profilePic) {
			nm.warning("Please select an image to upload.");
			return; // Exit function early if no image is selected
		}
		const imageData = {
			image: this.state.profilePic,
			user_id: this.state.currentUser.id, // Include the currentUser ID
		};
		// Make a POST request to upload the image data to the backend
		postRequest.call(this, "account/upload_profile_image", imageData, () => {
			// Reset the state and display success message
			nm.info("The profile picture has been uploaded successfully.");
			this.refreshProfile(true); // Pass a parameter to force image refresh
			if (close) {
				close();
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		// console.log(this.state.profilePic);
		if (!this.state.currentUser) {
			return (
				<div id={"PageProfile"} className={"page max-sized-page"}>
					<Loading height={300} />
				</div>
			);
		}

		return (
			<div id={"PageProfile"} className={"page max-sized-page"}>
				<div className={"row row-spaced"}>
					<div className="col-md-4">
						<div className={"row"}>
							<div className="col-md-12">
								<div className="PageProfile-white-box">
									<div className="PageProfile-upload-photo centered">
										<label htmlFor="file-upload" className="upload-container" onClick={() => this.fileInput.click()}>
											{this.state.profilePic ? (
												<img
													src={this.state.profilePic}
													alt="Profile"
													className="uploaded-image"
												/>
											) : (
												<i className="fas fa-user-circle fa-5x" />
											)}
											<input
												id="file-upload"
												type="file"
												accept="image/*"
												ref={(input) => { this.fileInput = input; }}
												onChange={(e) => {
													const file = e.target.files[0];
													if (file) {
														const reader = new FileReader();
														reader.onload = (event) => {
															// console.log("FileReader result:", event.target.result);
															this.setState({ profilePic: event.target.result }, () => {
																this.uploadProfileImage();
															});
														};
														reader.onerror = (error) => {
															console.error("FileReader error:", error);
														};
														reader.readAsDataURL(file);
													}
												}}
												style={{ display: "none" }} // Hide the file input element
											/>
										</label>
									</div>
									<FormLine
										label={"Full name"}
										value={this.state.currentUser.first_name + " " + this.state.currentUser.last_name}
										fullWidth={true}
										disabled={true}
									/>
								</div>
							</div>

							<div className="col-md-12">
								<div className="PageProfile-white-box PageProfile-actions">
									<h3>Actions</h3>

									<Popup
										className="Popup-small-size"
										trigger={
											<button className="blue-button"
												onClick={this.resetPassword}
											>
												Change password
											</button>
										}
										onClose={() => {
											this.setState({
												password: "",
												newPassword: "",
												newPasswordConfirmation: "",
											});
										}}
										modal
										closeOnDocumentClick
									>
										{(close) => <div className="row">
											<div className="col-md-12">
												<h2>Reset password</h2>

												<div className={"top-right-buttons"}>
													<button
														className={"grey-background"}
														data-hover="Close"
														data-active=""
														onClick={close}>
														<span><i className="far fa-times-circle" /></span>
													</button>
												</div>
											</div>
											<div className="col-md-12">
												<FormLine
													label={"Current password"}
													value={this.state.password}
													onChange={(v) => this.changeState("password", v)}
													type={"password"}
												/>
												<Info
													content={
														<div>
															The password must:<br />
															<li>contain at least 1 lowercase alphabetical character</li>
															<li>contain at least 1 uppercase alphabetical character</li>
															<li>contain at least 1 numeric character</li>
															<li>contain at least 1 special character being !@#$%^&*</li>
															<li>be between 10 and 30 characters long</li>
															<li>not contain any part of a name, surname or both</li>
														</div>
													}
												/>
												<FormLine
													label={"New password"}
													value={this.state.newPassword}
													onChange={(v) => this.changeState("newPassword", v)}
													format={validatePassword}
													type={"password"}
												/>
												<FormLine
													label={"New password confirmation"}
													value={this.state.newPasswordConfirmation}
													onChange={(v) => this.changeState("newPasswordConfirmation", v)}
													format={validatePassword}
													type={"password"}
												/>
											</div>
											<div className="col-md-12">
												<div className="right-buttons">
													<button
														onClick={() => this.changePassword(close)}
														disabled={!validatePassword(this.state.newPassword)
															|| !validatePassword(this.state.newPasswordConfirmation)
															|| this.state.newPassword !== this.state.newPasswordConfirmation}>
														Change password
													</button>
												</div>
											</div>
										</div>}
									</Popup>

									<Popup
										className="Popup-full-size"
										trigger={
											<button className="blue-button">
												Disassociate from Entity
											</button>
										}
										onClose={() => {
											this.setState({
												entityToDelete: "",
											});
										}}
										modal
										closeOnDocumentClick
									>
										{(close) => <div className="row">
											<div className="col-md-12">
												<h2>Disassociate from Entity</h2>

												<div className={"top-right-buttons"}>
													<button
														className={"grey-background"}
														data-hover="Close"
														data-active=""
														onClick={close}>
														<span><i className="far fa-times-circle" /></span>
													</button>
												</div>
											</div>
											{this.props.myEntities !== null && this.props.myEntities.length > 0
												? <div className="col-md-12">
													<div>
														<FormLine
															label="Select Entity"
															type="select"
															options={[{ value: "", label: "-" }].concat(
																this.props.myEntities.map((e) => ({
																	label: (
																		<>
																			<div title={e.name}>{e.name}</div>
																		</>
																	),
																	value: e.id,
																})),
															)}
															fullWidth={true}
															value={this.state.entityToDelete}
															onChange={(v) => this.changeState("entityToDelete", v)}
															format={validateNotNull}
														/>
														{this.state.entityToDelete !== ""
															&& <FormLine
																label="Please enter your password to confirm"
																fullWidth={true}
																value={this.state.passwordForDelete}
																onChange={(v) => this.changeState("passwordForDelete", v)}
																format={validateNotNull}
																type="password"
															/>
														}
													</div>
													<div>
														<div className="right-buttons">
															<button
																onClick={() => this.disassociateFromEntity(close)}
																disabled={!validateNotNull(this.state.entityToDelete)
																	|| this.state.passwordForDelete === ""}>
																Disassociate
															</button>
														</div>
													</div>
												</div>
												: <div className="col-md-12">You are not associated with any entities</div>
											}
										</div>}
									</Popup>

									<DialogConfirmation
										text={"Are you sure you want to delete this account? The data related to the account won't be retrievable."}
										trigger={
											<button
												className={"red-background"}>
												Delete account...
											</button>
										}
										afterConfirmation={() => this.deleteUser()}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="col-md-8">
						<div className={"row row-spaced"}>
							{/* <div className="col-md-12 PageProfile-white-box">
								<h3>Communication</h3>
								<br />
								<FormLine
									label={"Would you like to receive communications from the NCC?"}
									type={"checkbox"}
									value={this.state.currentUser.accept_communication}
									onChange={(v) => this.updateUserDetail("accept_communication", v)}
								/>
							</div> */}
							{/* <div className="col-md-12 PageProfile-white-box">
								<h3>Accessibility</h3>
								<br />

								<FormLine
									label={"Make my profile public"}
									type={"checkbox"}
									value={this.state.currentUser.is_vcard_public}
									onChange={(v) => this.updateUserDetail("is_vcard_public", v)}
								/>
							</div> */}
							<div className="col-md-12 PageProfile-white-box">
								<h3>Contact</h3>
								<br />
								<FormLine
									label={"Email"}
									value={this.state.currentUser.email}
									onChange={(v) => this.updateUserDetail("email", v)}
									disabled={true}
								/>
								{/* <FormLine
									label={"Include email in my public profile"}
									type={"checkbox"}
									value={this.getVcardValue("email") !== null}
									onChange={(v) => this.updateCurrentVcard("email", v ? this.state.currentUser.email : null)}
								/>
								<FormLine
									label={"Include telephone in my public profile"}
									type={"checkbox"}
									value={this.getVcardValue("tel") !== null}
									onChange={(v) => this.updateCurrentVcard("tel", v ? this.state.currentUser.telephone : null)}
								/> */}
							</div>
							<div className="col-md-12 PageProfile-white-box">
								<h3>Details</h3>
								<h4>*To change any of your details please contact admin using the Contacts Us button.</h4>
								<br />
								{this.state.userProfile != null
									&& <UpdateProfile
										userProfile={this.state.userProfile}
										setProfileValues={this.setProfileValues} />
								}
							</div>
							<div className="col-md-12 PageProfile-white-box">
								<h3>Social media and website</h3>
								<br />

								{this.getVcardValue("socialprofile")
									? [].concat(this.getVcardValue("socialprofile")).map((s, i) => (
										<div
											className="row row-spaced"
											key={i}>
											<div className="col-md-6">
												<FormLine
													label={"Platform"}
													type={"select"}
													options={[
														{ label: "Personal website", value: "Personal website" },
														{ label: "LinkedIn", value: "LinkedIn" },
														{ label: "Twitter", value: "Twitter" },
														{ label: "Instragram", value: "Instragram" },
														{ label: "Medium", value: "Medium" },
														{ label: "GitHub", value: "GitHub" },
														{ label: "Other", value: "Other" },
													]}
													value={s.type}
													onChange={(v) => this.updateSocialeProfilePlatform(i, v)}
													fullWidth={true}
												/>
											</div>
											<div className="col-md-6">
												<FormLine
													label={"Link"}
													value={s.valueOf() ? s.valueOf() : ""}
													onChange={(v) => this.updateSocialeProfileLink(i, v)}
													fullWidth={true}
												/>
											</div>
											<div className="col-md-12">
												<div className="right-buttons">
													<button
														className={"red-background"}
														onClick={() => this.deleteSocialeProfile(i)}>
														<i className="fas fa-trash-alt" />
													</button>
												</div>
											</div>
										</div>
									))
									: <Message
										text={"No social media provided"}
										height={100}
									/>
								}

								<div className="right-buttons">
									<button
										onClick={() => this.addCurrentVcardSocialeProfile()}>
										<i className="fas fa-plus" /> Add
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{(this.state.userChanged || this.state.profileChanged)
					&& <div className="PageProfile-save-button">
						<div className="row">
							<div className="col-md-6">
								<button
									className={"red-background"}
									onClick={this.refreshProfile}>
									<i className="far fa-times-circle" /> Discard changes
								</button>
							</div>
							<div className="col-md-6">
								<button
									onClick={this.updateDetails}>
									<i className="fas fa-save" /> Save profile
								</button>
							</div>
						</div>
					</div>
				}
			</div>
		);
	}
}
