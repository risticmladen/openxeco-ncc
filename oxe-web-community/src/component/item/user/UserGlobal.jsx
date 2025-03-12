import React from "react";
import "./UserGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import Loading from "../../box/Loading.jsx";
import MembersProfiles from "./MembersProfiles.jsx";
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
				email: "", // Added email field here
				telephone: "",
				// domains_of_interest: null,
				organizations_types: null,
				// experience: null,
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
		};
	}

	componentDidMount() {
		this.refresh();

		// getRequest.call(this, "public/get_public_countries", (data) => {
		// 	this.setState({
		// 		countries: data,
		// 	});
		// }, (error) => {
		// 	nm.warning(error.message);
		// }, (error) => {
		// 	nm.error(error.message);
		// });

		// getRequest.call(this, "public/get_public_professions", (data) => {
		// 	this.setState({
		// 		professions: data,
		// 	});
		// }, (error) => {
		// 	nm.warning(error.message);
		// }, (error) => {
		// 	nm.error(error.message);
		// });
	}

	refresh() {
		this.setState({
			fetchingProfile: true,
		});
		getRequest.call(this, "user/get_user/" + this.props.id, (data) => {
			this.setState({
				user: data,
				userProfile: {
					...this.state.userProfile,
					email: data.email, // Set email field in userProfile
				},
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "user/get_user_profile/" + this.props.id, (data) => {
			this.setState({
				userProfile: {
					...data,
					email: this.state.user?.email || "", // Ensure email field is set if available
				},
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
			|| this.state.userProfile.organization_types === null
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
		// 		nm.warning("The account is only available to Cypriot or Cypriot
		// residents or Cypriot nationals");
		// 		valid = false;
		// 	}
		// }
		return valid;
	}

	updateProfile() {
		postRequest.call(this, "public/update_profile", {
			user_id: this.props.id,
			data: this.state.userProfile,
		}, () => {
			nm.info("The information has been updated");
		}, (response) => {
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
				{this.state.user !== null
					? <div className="col-md-12">
						<h2 className="dashboard-header" style={{ color: 'black' }}>User Profile</h2>
						{this.state.fetchingProfile === false
							&& <MembersProfiles
								userProfile={this.state.userProfile}
								setProfileValues={this.setProfileValues}
							/>
						}
					</div>
					: <Loading/>
				}
			</div>
		);
	}
}
