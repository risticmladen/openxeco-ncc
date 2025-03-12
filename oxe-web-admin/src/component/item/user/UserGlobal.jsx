import React from "react";
import "./UserGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import UpdateProfile from "./UpdateProfile.jsx";
// import { validateNotNull, validateTelephoneNumber, validateName } from "../../../utils/re.jsx";
import { validateTelephoneNumber } from "../../../utils/re.jsx";

export default class UserGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.saveUserValue = this.saveUserValue.bind(this);
		this.updateProfile = this.updateProfile.bind(this);
		this.setProfileValues = this.setProfileValues.bind(this);

		this.state = {
			user: null,
			userProfile: {
				first_name: "",
				last_name: "",
				telephone: "",
				// domains_of_interest: null,
				organizations_types: "",
				taxonomy_types: "",
				experience: null,
				// expertise_id: null,
				gender: null,
				// how_heard: null,
				// industry_id: null,
				// mobile: "",
				// nationality_id: null,
				// profession_id: null,
				// residency: null,
				// sector: null,
				public: false,
				user_id: null,
			},
			fetchingProfile: true,
			// countries: [],
			// professions: [],
		};
	}

	componentDidMount() {
		this.refresh();

	}

	refresh() {
		this.setState({
			fetchingProfile: true,
		});
		getRequest.call(this, "user/get_user/" + this.props.id, (data) => {
			this.setState({
				user: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "user/get_user_profile/" + this.props.id, (data) => {
			this.setState({
				userProfile: data,
				fetchingProfile: false,
			});
		}, (response) => {
			this.setState({
				fetchingProfile: false,
			});
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	saveUserValue(prop, value) {
		if (this.state.user[prop] !== value) {
			const params = {
				id: this.props.id,
				[prop]: value,
			};

			postRequest.call(this, "user/update_user", params, () => {
				const user = { ...this.state.user };

				user[prop] = value;
				this.setState({ user });
				nm.info("The property has been updated");
			}, (response) => {
				this.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.refresh();
				nm.error(error.message);
			});
		}
	}



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

		// if (cyprus === undefined
		if (this.state.userProfile.first_name === ""
			|| this.state.userProfile.last_name === ""
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

		return valid;
	}

	//	i have duplicate private/update_profile
	updateProfile() {
		postRequest.call(this, "public/update_profile", {
			user_id: this.props.id,
			data: this.state.userProfile,
		}, () => {
			nm.info("The information has been updated");
		}, (response) => {
			// console.log(this.state);
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	setProfileValues(newProfile) {
		this.setState({
			userProfile: newProfile,
		});
		if (this.isProfileFormValid()) {
			this.updateProfile();
		}
	}

	render() {
		return (
			<div className={"row"}>
				<div className="col-md-12">
					<h2>Global</h2>
				</div>

				{this.state.user !== null
					? <div className="col-md-12">
						<FormLine
							label={"ID"}
							value={this.state.user.id}
							disabled={true}
						/>
						<FormLine
							label={"Email"}
							value={this.state.user.email}
							disabled={true}
						/>

						{/* <FormLine
							label={"First name"}
							value={this.state.user.first_name}
							onBlur={(s) => this.saveUserValue("first_name", s)}
						/>
						// <FormLine
						// 	label={"Last name"}
						// 	value={this.state.user.last_name}
						// 	onBlur={(s) => this.saveUserValue("last_name", s)}
						// /> */}
						<br/>
						{/* <FormLine
							label="Is admin"
							type={"checkbox"}
							value={this.state.user.is_admin}
							onChange={(s) => this.saveUserValue("is_admin", s)}
						/> */}
						<FormLine
							label="Is active"
							type={"checkbox"}
							value={this.state.user.is_active}
							onChange={(s) => this.saveUserValue("is_active", s)}
						/>
						<br/>
						<FormLine
							label="Accept to receive communications"
							type={"checkbox"}
							value={this.state.user.accept_communication}
							disabled={true}
						/>
						<FormLine
							label="Accept to receive request notifications (only for active admins)"
							type={"checkbox"}
							value={this.state.user.accept_request_notification}
							disabled={true}
						/>
						<h2>User Profile</h2>
						{this.state.fetchingProfile === false
							&& <UpdateProfile
								userProfile={this.state.userProfile}
								setProfileValues={this.setProfileValues} />
						}
					</div>
					: <Loading/>
				}
			</div>
		);
	}
}
