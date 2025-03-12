import React from "react";
import "./PageAddProfile.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../utils/request.jsx";
import FormLine from "./form/FormLine.jsx";
import Loading from "./box/Loading.jsx";
import {
	validateNotNull, validateName, validateTelephoneNumber,
	validateEmail, validateWebsite,
} from "../utils/re.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageAddProfile extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);
		this.handleSecondAddressResponse = this.handleSecondAddressResponse.bind(this);
		this.handleSubsidiaryResponse = this.handleSubsidiaryResponse.bind(this);
		this.handleSharesResponse = this.handleSharesResponse.bind(this);

		this.state = {
			first_name: "",
			last_name: "",
			telephone: "",
			// domains_of_interest: null,
			organizations_types: null,
			taxonomy_types: null,
			person_expertise: null,
			field_article_expertise: null,
			taxonomy_other: null,
			detail_expertise: null,
			achieve_join_community: null,
			contribution_community: null,
			// experience: null,
			// expertise_id: null,
			gender: null,
			address: null,
			headquarter_address: null,
			city: null,
			headquarter_city: null,
			postal_code: null,
			headquarter_postal_code: null,
			po_box: null,
			other: null,
			headquarter_po_box: null,
			// how_heard: null,
			// industry_id: null,
			// mobile: "",
			position_organization: "",
			// nationality_id: null,
			// profession_id: null,
			// residency: null,
			// sector: null,
			// public: false,
			user_id: null,
			expertise: [],
			industries: [],
			countries: [],
			professions: [],
			// domains: [],
			types: [],
			typesTax: [], // renamed from types_tax to typesTax

			affiliated: false,
			agree_code: false,
			agree_privacy: false,
			selectedMenu: null,
			entity_name: "",
			vat_number: "",
			website: "",
			company_email: "",
			company_phone: "",
			showSecondAddress: false, // State variable for headquarter address
			showSubsidiaryInfo: false, // State variable for subsidiary information
			showSharesInfo: false,
			eu_member: "No", // State variable for EU member status
			eu_country: "", // State variable for EU country info
			majority_shares: "No", // State variable for EU member status
			shares_country: "", // State variable for EU country info
			comply_article_eu: "No",
			article_compy_regulation: "No",
			ncc_consent: "No",
			signature: "",
		};
	}

	componentDidMount() {
		if (getUrlParameter("tab") !== null && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}

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

		// getRequest.call(this, "public/get_public_industries", (data) => {
		// 	this.setState({
		// 		industries: data,
		// 	});
		// }, (error) => {
		// 	nm.warning(error.message);
		// }, (error) => {
		// 	nm.error(error.message);
		// });

		getRequest.call(this, "public/get_public_organization_types", (data) => {
			this.setState({
				types: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_taxonomy_types", (data) => {
			this.setState({
				typesTax: data, // renamed from types_tax to typesTax
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		// getRequest.call(this, "public/get_public_domains", (data) => {
		// 	this.setState({
		// 		domains: data,
		// 	});
		// }, (error) => {
		// 	nm.warning(error.message);
		// }, (error) => {
		// 	nm.error(error.message);
		// });

		// getRequest.call(this, "public/get_public_expertise", (data) => {
		// 	this.setState({
		// 		expertise: data,
		// 	});
		// }, (error) => {
		// 	nm.warning(error.message);
		// }, (error) => {
		// 	nm.error(error.message);
		// });
	}

	onMenuClick(m) {
		window.history.pushState({}, "", "?tab=" + m);
		this.setState({ selectedMenu: m });
	}

	handleSecondAddressResponse(response) {
		this.setState({ showSecondAddress: response === "No" });
	}

	handleSubsidiaryResponse(response) {
		this.setState({
			showSubsidiaryInfo: response === "Yes",
			eu_member: response,
		});
	}

	handleArticleEUResponse(response) {
		this.setState({
			comply_article_eu: response,
		});
	}

	handleArticleComplyResponse(response) {
		this.setState({
			article_compy_regulation: response,
		});
	}

	handleNccConsestResponse(response) {
		this.setState({
			ncc_consent: response,
		});
	}

	handleSharesResponse(response) {
		this.setState({
			showSharesInfo: response === "Yes",
			majority_shares: response,
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	isFormValid() {
		let valid = true;
		// const cyprus = this.state.countries.find(
		// 	(country) => (country.name === "Cyprus"),
		// );
		if (this.state.telephone !== "" && !validateTelephoneNumber(this.state.telephone)) {
			valid = false;
			nm.warning("Telephone number is not valid");
		}
		if (this.state.company_phone !== "" && !validateTelephoneNumber(this.state.company_phone)) {
			valid = false;
			nm.warning("Telephone number is not valid");
		}

		// if (this.state.mobile !== "" && !validateTelephoneNumber(this.state.mobile)) {
		// 	valid = false;
		// 	nm.warning("Mobile number is not valid");
		// }

		if (this.state.first_name !== "" && !validateName(this.state.first_name)) {
			valid = false;
			nm.warning("Name is not valid");
		}
		if (this.state.entity_name !== "" && !validateName(this.state.entity_name)) {
			valid = false;
			nm.warning("Entity Name is not valid");
		}

		if (this.state.last_name !== "" && !validateName(this.state.last_name)) {
			valid = false;
			nm.warning("Surname is not valid");
		}

		// if (cyprus === undefined
		// 	|| this.state.first_name === ""
		if (this.state.last_name === ""
			// || this.state.domains_of_interest === null
			// || this.state.experience === null
			// || this.state.expertise_id === null
			|| this.state.gender === null
			// || this.state.how_heard === null
			// || this.state.nationality_id === null
			// || this.state.profession_id === null
			// || this.state.residency === null
			|| this.state.entity_name === ""
			|| this.state.vat_number === ""
			|| this.state.website === ""
			|| this.state.company_email === ""
			// || (
			// 	(this.state.sector === null || this.state.industry_id === null)
			// )
		) {
			nm.warning("Please fill in all of the required fields");
			valid = false;
		}
		// if (cyprus !== undefined) {
		// 	if (
		// 		this.state.nationality_id !== null
		// 		&& this.state.residency !== ""
		// 		&& this.state.nationality_id !== cyprus.id
		// 		&& this.state.residency !== "Nicosia"
		// 		&& this.state.residency !== "Limassol"
		// 		&& this.state.residency !== "Larnaca"
		// 		&& this.state.residency !== "Pafos"
		// 	) {
		// 		nm.warning("The account is only available to Cypriot or Cypriot
		//      residents or Cypriot nationals");
		// 		valid = false;
		// 	}
		// }
		if (this.agreedToAll() !== true) {
			nm.warning("Please agree to all acknowledgements");
			valid = false;
		}
		return valid;
	}

	// setRole(value) {
	// 	this.changeState("profession_id", value);
	// 	const role = this.state.professions.find(
	// 		(p) => (p.id === value),
	// 	);
	// 	if (role !== undefined && (role.name === "Student" || role.name === "Retired")) {
	// 		this.setState({ sector: null });
	// 		this.setState({ industry_id: null });
	// 	}
	// 	this.forceUpdate();
	// }

	// isStudentOrRetired() {
	// 	const role = this.state.professions.find(
	// 		(p) => (p.id === this.state.profession_id),
	// 	);
	// 	if (role === undefined) {
	// 		return false;
	// 	}
	// 	return role.name === "Student" || role.name === "Retired";
	// }

	agreedToAll() {
		return this.state.agree_code && this.state.agree_privacy;
	}

	// setDomains(name, value) {
	// 	let domains = [];
	// 	if (this.state.domains_of_interest !== null) {
	// 		domains = this.state.domains_of_interest.split(" | ");
	// 	}
	// 	if (value === true && domains.includes(name) === false) {
	// 		domains.push(name);
	// 	}
	// 	if (value === false && domains.includes(name) === true) {
	// 		const index = domains.indexOf(name);
	// 		if (index > -1) {
	// 			domains.splice(index, 1);
	// 		}
	// 	}
	// 	this.changeState("domains_of_interest", domains.length > 0 ? domains.join(" | ") : null);
	// }

	setOrganizationType(name, value) {
		let types = [];
		if (this.state.organizations_types !== null) {
			types = this.state.organizations_types.split(" | ");
		}
		if (value === true && types.includes(name) === false) {
			types.push(name);
		}
		if (value === false && types.includes(name) === true) {
			const index = types.indexOf(name);
			if (index > -1) {
				types.splice(index, 1);
			}
		}
		this.changeState("organizations_types", types.length > 0 ? types.join(" | ") : null);
	}

	setTaxonomyType(name, value) {
		let typesTax = [];
		if (this.state.taxonomy_types !== null) {
			typesTax = this.state.taxonomy_types.split(" | ");
		}
		if (value === true && typesTax.includes(name) === false) {
			typesTax.push(name);
		}
		if (value === false && typesTax.includes(name) === true) {
			const index = typesTax.indexOf(name);
			if (index > -1) {
				typesTax.splice(index, 1);
			}
		}
		this.changeState("taxonomy_types", typesTax.length > 0 ? typesTax.join(" | ") : null);
	}

	submitCreationRequest() {
		if (this.isFormValid() === false) {
			return;
		}
		const params = {
			type: "NEW INDIVIDUAL ACCOUNT",
			request: "The user requests the creation of their profile",
			data: {
				first_name: this.state.first_name,
				last_name: this.state.last_name,
				telephone: this.state.telephone,
				// domains_of_interest: this.state.domains_of_interest,
				organizations_types: this.state.organizations_types,
				person_expertise: this.state.person_expertise,
				contribution_community: this.state.contribution_community,
				taxonomy_types: this.state.taxonomy_types,
				detail_expertise: this.state.detail_expertise,
				achieve_join_community: this.state.achieve_join_community,
				field_article_expertise: this.state.field_article_expertise,
				signature: this.state.signature,
				// experience: this.state.experience,
				// expertise_id: this.state.expertise_id,
				taxonomy_other: this.state.taxonomy_other,
				gender: this.state.gender,
				// how_heard: this.state.how_heard,
				// industry_id: this.state.industry_id,
				// mobile: this.state.mobile,
				position_organization: this.state.position_organization,
				address: this.state.address,
				city: this.state.city,
				postal_code: this.state.postal_code,
				po_box: this.state.po_box,
				other: this.state.other,
				nationality_id: this.state.nationality_id,
				// profession_id: this.state.profession_id,
				// residency: this.state.residency,
				// sector: this.state.sector,
				// public: this.state.public,
				entity_name: this.state.entity_name,
				vat_number: this.state.vat_number,
				website: this.state.website,
				company_email: this.state.company_email,
				company_phone: this.state.company_phone,
				headquarter_address: this.state.headquarter_address,
				headquarter_city: this.state.headquarter_city,
				headquarter_postal_code: this.state.headquarter_postal_code,
				headquarter_po_box: this.state.headquarter_po_box,
				eu_member: this.state.eu_member, // Include EU member status in request
				comply_article_eu: this.state.comply_article_eu,
				article_compy_regulation: this.state.article_compy_regulation,
				ncc_consent: this.state.ncc_consent,
				eu_country: this.state.eu_country, // Include EU country info in request
				majority_shares: this.state.majority_shares, // Include EU member status in request
				shares_country: this.state.shares_country, // Include EU country info in request
			},
		};
		postRequest.call(this, "private/add_request", params, () => {
			nm.info("The request has been sent and will be reviewed");
			this.fetchUser();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchUser() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.props.setUserStatus(data.status);
		}, (response2) => {
			nm.warning(response2.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<div id="PageAddProfile" className="page max-sized-page">
				<h1 className="dashboard-header">Create your profile</h1>
				<div className="row">
					<div className="col-md-6">
						<div className="FormLine-label font-weight-bold">Organization Details</div>
						<FormLine
							label="Organization *"
							fullWidth={true}
							value={this.state.entity_name}
							onChange={(v) => this.changeState("entity_name", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							format={validateName}
						/>
						<FormLine
							label="Registration number (if applicable)"
							fullWidth={true}
							value={this.state.vat_number}
							onChange={(v) => this.changeState("vat_number", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
						<div className="FormLine-label font-weight-bold">Contact Details</div>
						<FormLine
							label="Email *"
							fullWidth={true}
							value={this.state.company_email}
							onChange={(v) => this.changeState("company_email", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							format={validateEmail}
						/>
						<FormLine
							label="Telephone *"
							fullWidth={true}
							value={this.state.company_phone}
							onChange={(v) => this.changeState("company_phone", v)}
							onKeyDown={this.onKeyDown}
							format={validateTelephoneNumber}
						/>
						<FormLine
							label="Website *"
							fullWidth={true}
							value={this.state.website}
							onChange={(v) => this.changeState("website", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							format={validateWebsite}
						/>
						<div className="FormLine-label font-weight-bold">Postal Address</div>
						<FormLine
							label="Address *"
							fullWidth={true}
							value={this.state.address}
							onChange={(v) => this.changeState("address", v)}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
							type="textarea"
						/>
						<FormLine
							label="City*"
							fullWidth={true}
							value={this.state.city}
							onChange={(v) => this.changeState("city", v)}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
						/>
						<FormLine
							label="Postal Code *"
							fullWidth={true}
							value={this.state.postal_code}
							onChange={(v) => this.changeState("postal_code", v)}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
						/>
						<FormLine
							label="P.O. Box"
							fullWidth={true}
							value={this.state.po_box}
							onChange={(v) => this.changeState("po_box", v)}
							onKeyDown={this.onKeyDown}
						/>

						{/* Add the headquarter question for the user */}
						<div className="FormLine-label font-weight-bold">Is this your organization’s headquarter address?</div>
						<button onClick={() => this.handleSecondAddressResponse("Yes")}>Yes</button>
						<button onClick={() => this.handleSecondAddressResponse("No")}>No</button>

						{/* Conditional rendering for the headquarter address fields */}
						{this.state.showSecondAddress && (
							<>
								<FormLine
									label="Headquarter Address *"
									fullWidth={true}
									value={this.state.headquarter_address}
									onChange={(v) => this.changeState("headquarter_address", v)}
									onKeyDown={this.onKeyDown}
									format={validateNotNull}
									type="textarea"
								/>
								<FormLine
									label="Headquarter City *"
									fullWidth={true}
									value={this.state.headquarter_city}
									onChange={(v) => this.changeState("headquarter_city", v)}
									onKeyDown={this.onKeyDown}
									format={validateNotNull}
								/>
								<FormLine
									label="Headquarter Postal Code *"
									fullWidth={true}
									value={this.state.headquarter_postal_code}
									onChange={(v) => this.changeState("headquarter_postal_code", v)}
									onKeyDown={this.onKeyDown}
									format={validateNotNull}
								/>
								<FormLine
									label="Headquarter P.O. Box"
									fullWidth={true}
									value={this.state.headquarter_po_box}
									onChange={(v) => this.changeState("headquarter_po_box", v)}
									onKeyDown={this.onKeyDown}
								/>
							</>
						)}
						<div className="FormLine-label font-weight-bold">Organization Types *</div>
						{this.state.types !== null
							? this.state.types
								.map((c) => (
									<FormLine
										key={c.id}
										label={c.name}
										type={"checkbox"}
										value={false}
										onChange={(v) => this.setOrganizationType(c.name, v)}
									/>
								))
							: <Loading
								height={200}
							/>
						}
						<FormLine
							label="Other"
							fullWidth={true}
							value={this.state.other}
							onChange={(v) => this.changeState("other", v)}
							onKeyDown={this.onKeyDown}
							type="textarea"
						/>
						{/* Add the subsidiary question for the user */}
						<div className="FormLine-label font-weight-bold">Does your organization have subsidiaries in other EU Member States (including EFA/EFTA countries)? *</div>
						<button onClick={() => this.handleSubsidiaryResponse("Yes")}>Yes</button>
						<button onClick={() => this.handleSubsidiaryResponse("No")}>No</button>

						{/* Conditional rendering for the subsidiary information fields */}
						{this.state.showSubsidiaryInfo && (
							<>
								<FormLine
									label="Please, specify countries and sector of activity"
									fullWidth={true}
									value={this.state.eu_country}
									onChange={(v) => this.changeState("eu_country", v)}
									onKeyDown={this.onKeyDown}
									format={validateNotNull}
									type="textarea"
								/>
							</>
						)}
						{/* Add the subsidiary question for the user */}
						<div className="FormLine-label font-weight-bold">Do you hold the majority of shares of any organizations abroad? *</div>
						<button onClick={() => this.handleSharesResponse("Yes")}>Yes</button>
						<button onClick={() => this.handleSharesResponse("No")}>No</button>

						{/* Conditional rendering for the subsidiary information fields */}
						{this.state.showSharesInfo && (
							<>
								<FormLine
									label="Please, specify in which countries and the sector of activity"
									fullWidth={true}
									value={this.state.shares_country}
									onChange={(v) => this.changeState("shares_country", v)}
									onKeyDown={this.onKeyDown}
									format={validateNotNull}
									type="textarea"
								/>
							</>
						)}
						<div className="FormLine-label font-weight-bold">
							Does your organization comply to the requirements described in Article 136 of the EU
							Financial Regulation? *
							<a href="https://online.ekdd.gr/OnlineWeb/OMNIBUS_1046_2018_EL.pdf" target="_blank" rel="noopener noreferrer" className="red-link">Link</a>
						</div>
						<button onClick={() => this.handleArticleEUResponse("Yes")}>Yes</button>
						<button onClick={() => this.handleArticleEUResponse("No")}>No</button>
						<br></br>
						<div className="FormLine-label font-weight-bold">Representative/Contact Person</div>
						<FormLine
							label="Name *"
							fullWidth={true}
							value={this.state.first_name}
							onChange={(v) => this.changeState("first_name", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							format={validateName}
						/>
						<FormLine
							label="Surname *"
							fullWidth={true}
							value={this.state.last_name}
							onChange={(v) => this.changeState("last_name", v)}
							onKeyDown={this.onKeyDown}
							format={validateName}
						/>
						<FormLine
							label="Position that you hold in the Organization *"
							fullWidth={true}
							value={this.state.position_organization}
							onChange={(v) => this.changeState("position_organization", v)}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
						/>
						<FormLine
							label="Phone Number *"
							fullWidth={true}
							value={this.state.telephone}
							onChange={(v) => this.changeState("telephone", v)}
							onKeyDown={this.onKeyDown}
							format={validateTelephoneNumber}
						/>
						<FormLine
							label="Gender *"
							type="select"
							options={[
								{ value: null, label: "-" },
								{ value: "Male", label: "Male" },
								{ value: "Female", label: "Female" },
								{ value: "Non-binary", label: "Non-binary" },
								{ value: "Other", label: "Other" },
								{ value: "Prefer not to say", label: "Prefer not to say" },
							]}
							fullWidth={true}
							value={this.state.gender}
							onChange={(v) => this.changeState("gender", v)}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
						/>
						<div className="FormLine-label font-weight-bold">Field of Activity/Expertise</div>
						<FormLine
							label="Please specify the contact person’s expertise in the field of cybersecurity *"
							fullWidth={true}
							value={this.state.person_expertise}
							onChange={(v) => this.changeState("person_expertise", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
							type="textarea"
						/>
						{/* <FormLine
							label="Mobile Number"
							fullWidth={true}
							value={this.state.mobile}
							onChange={(v) => this.changeState("mobile", v)}
							onKeyDown={this.onKeyDown}
							format={validateTelephoneNumber}
						/> */}
						{/* <FormLine
							label="Role/Profession *"
							type="select"
							options={[{ value: null, label: "-" }].concat(
								this.state.professions.map((o) => ({
									label: (
										<>
											<div title={o.description}>{o.name}</div>
										</>
									),
									value: o.id,
								})),
							)}
							fullWidth={true}
							value={this.state.profession_id}
							onChange={(v) => this.setRole(v)}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
						/> */}
						{/* <FormLine
							label="Sector *"
							type="select"
							options={[
								{ value: null, label: "-" },
								{ value: "Private", label: "Private" },
								{ value: "Public", label: "Public" },
							]}
							fullWidth={true}
							value={this.state.sector}
							onChange={(v) => this.changeState("sector", v)}
							onKeyDown={this.onKeyDown}
							disabled={this.isStudentOrRetired()}
							format={validateNotNull}
						/> */}
						{/* <FormLine
							label="Industry *"
							type="select"
							options={[{ value: null, label: "-" }].concat(
								this.state.industries.map((o) => ({ label: o.name, value: o.id })),
							)}
							fullWidth={true}
							value={this.state.industry_id}
							onChange={(v) => this.changeState("industry_id", v)}
							onKeyDown={this.onKeyDown}
							disabled={this.isStudentOrRetired()}
							format={validateNotNull}
						/> */}
						{/* <FormLine
							label="Nationality *"
							type="select"
							options={[{ value: null, label: "-" }].concat(
								this.state.countries.map((o) => ({ label: o.name, value: o.id })),
							)}
							fullWidth={true}
							value={this.state.nationality_id}
							onChange={(v) => this.changeState("nationality_id", v)}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
						/> */}
						{/* <FormLine
							label="Residency (Location) *"
							type="select"
							options={[
								{ value: null, label: "-" },
								{ value: "Nicosia", label: "Nicosia" },
								{ value: "Limassol", label: "Limassol" },
								{ value: "Larnaca", label: "Larnaca" },
								{ value: "Pafos", label: "Pafos" },
								{ value: "Outside of Cyprus", label: "Outside of Cyprus" },
							]}
							fullWidth={true}
							value={this.state.residency}
							onChange={(v) => this.changeState("residency", v)}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
						/> */}
						{/* <FormLine
							label="Years of professional experience in/related to cybersecurity *"
							type="select"
							options={[
								{ value: null, label: "-" },
								{ value: "Student", label: "Student" },
								{ value: "0 - 2", label: "0 - 2" },
								{ value: "2 - 5", label: "2 - 5" },
								{ value: "5 - 10", label: "5 - 10" },
								{ value: "10+", label: "10+" },
							]}
							fullWidth={true}
							value={this.state.experience}
							onChange={(v) => this.changeState("experience", v)}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
						/> */}
						{/* <FormLine
							label="Primary area of expertise in/related to cybersecurity *"
							type="select"
							options={[{ value: null, label: "-" }].concat(
								this.state.expertise.map((o) => ({
									label: (
										<>
											<div title={o.description}>{o.name}</div>
										</>
									),
									value: o.id,
								})),
							)}
							fullWidth={true}
							value={this.state.expertise_id}
							onChange={(v) => this.changeState("expertise_id", v)}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
						/> */}
						{/* <FormLine
							label="How did you hear about the Community *"
							type="select"
							options={[
								{ value: null, label: "-" },
								{ value: "Social Media", label: "Social Media" },
								{ value: "TV Advert", label: "TV Advert" },
								{ value: "Friend/Colleague", label: "Friend/Colleague" },
								{ value: "Government Website", label: "Government Website" },
								{ value: "European Commission", label: "European Commission" },
								{ value: "Other", label: "Other" },
							]}
							fullWidth={true}
							value={this.state.how_heard}
							onChange={(v) => this.changeState("how_heard", v)}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
						/> */}
					</div>
					<div className="col-md-6">
						<FormLine
							label={
								<div className="FormLine-label font-weight-bold">
									Your organization&apos;s expertise in the field
									of cybersecurity (according to Article 8 (3) *
									<a
										href="https://eur-lex.europa.eu/legal-content/EL/TXT/PDF/?uri=CELEX:32021R0887"
										target="_blank"
										rel="noopener noreferrer"
										style={{ color: "red", marginLeft: "5px" }}
									>
										Link
									</a>
								</div>
							}
							fullWidth={true}
							value={this.state.field_article_expertise}
							onChange={(v) => this.changeState("field_article_expertise", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
							type="textarea"
						/>
						<FormLine
							label="Expertise – detailed description *"
							fullWidth={true}
							value={this.state.detail_expertise}
							onChange={(v) => this.changeState("detail_expertise", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
							type="textarea"
						/>
						<div className="FormLine-label font-weight-bold">Expertise according to the Cybersecurity Taxonomy*</div>
						{this.state.typesTax !== null
							? this.state.typesTax
								.map((c) => (
									<FormLine
										key={c.id}
										label={c.name}
										type={"checkbox"}
										value={false}
										onChange={(v) => this.setTaxonomyType(c.name, v)}
									/>
								))
							: <Loading
								height={200}
							/>
						}
						<FormLine
							label="Other"
							fullWidth={true}
							value={this.state.taxonomy_other}
							onChange={(v) => this.changeState("taxonomy_other", v)}
							onKeyDown={this.onKeyDown}
							type="textarea"
						/>
						{/* {
							this.state.typesTax !== null
								? this.state.typesTax.map((c) => (
									<FormLine
										key={c.id}
										label={c.name}
										type={"checkbox"}
										value={false}
										onChange={(v) => this.setTaxonomyType(c.name, v)}
										disabled={this.state.taxonomy_other !== ""}
									/>
								))
								: <Loading height={200} />
						}
						<FormLine
							label="Other"
							fullWidth={true}
							value={this.state.taxonomy_other}
							onChange={(v) => this.changeState("taxonomy_other", v)}
							onKeyDown={this.onKeyDown}
						/> */}
						<FormLine
							label="What do you seek to achieve by joining the Community? *"
							fullWidth={true}
							value={this.state.achieve_join_community}
							onChange={(v) => this.changeState("achieve_join_community", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
							type="textarea"
						/>
						<FormLine
							label="How and in what ways can you contribute to the goals and tasks of the Community? *"
							fullWidth={true}
							value={this.state.contribution_community}
							onChange={(v) => this.changeState("contribution_community", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
							type="textarea"
						/>
						<div className="FormLine-label font-weight-bold">
						I hereby that I confirm I will comply with article 9 of the regulation *
							<a href="https://eur-lex.europa.eu/legal-content/EL/TXT/PDF/?uri=CELEX:32021R0887" target="_blank" rel="noopener noreferrer" className="red-link">Link</a>
						</div>
						<button onClick={() => this.handleArticleComplyResponse("Yes")}>Yes</button>
						<button onClick={() => this.handleArticleComplyResponse("No")}>No</button>
						<br></br><br></br>
						<div className="ConsentText">
							I give my consent to the NCC-CY to use the data provided.
							<br></br>
							The NCC will process personal data in accordance with Regulation (EU) 2016/679 and
							the ECCC will process personal data in accordance with Regulation (EU) 2018/1725.
							The legal basis for the processing of personal data is Article 7 and Article 8 of
							Regulation (EU) 2021/887.
							<br></br>
							<br></br>
							***Additional information on the personal data processed, possible processors and
							retention periods is specified on the Privacy Notice - Membership to Cybersecurity
							Community available on www.ncc.cy
							<br></br>
							<br></br>
							The entity hereby confirms that all information provided in the registration form is
							truthful and accurate.
							<br></br>
							<br></br>
							The entity acknowledges and hereby agrees that the information provided in the
							registration process will be shared with the ECCC and other NCCs established by
							each Member State in line with the Regulation.
							<br></br>
							<br></br>
							The entity acknowledges and hereby agrees that the following information will be
							publicly available on the websites of the ECCC and NCCs established by each Member
							State in line with Regulation (EU) 2021/887:
							<ul>
								<li>Organization Name</li>
								<li>Country of establishment</li>
								<li>Website</li>
								<li>Type of organization as foreseen in art. 8 para 3 of Regulation
								(EU) 2021/887</li>
								<li>Fields of activity</li>
							</ul>
						</div>
						<button onClick={() => this.handleNccConsestResponse("Yes")}>Yes</button>
						<button onClick={() => this.handleNccConsestResponse("No")}>No</button>
						<FormLine
							label="Signature (Name and Surname) *"
							fullWidth={true}
							value={this.state.signature}
							onChange={(v) => this.changeState("signature", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							format={validateNotNull}
						/>
						{/* <div className="FormLine-label font-weight-bold">Domains of interest *</div>
						{this.state.domains !== null
							? this.state.domains
								.map((c) => (
									<FormLine
										key={c.id}
										label={c.name}
										type={"checkbox"}
										value={false}
										onChange={(v) => this.setDomains(c.name, v)}
									/>
								))
							: <Loading
								height={200}
							/>
						} */}
						<hr />
						{/* <div className="FormLine-label font-weight-bold">Privacy</div> */}
						{/* <FormLine
							label={"Make my profile public"}
							type={"checkbox"}
							value={this.state.public}
							onChange={(v) => this.setState({ public: v })}
						/> */}
						<hr />
						<div className="FormLine-label font-weight-bold">Acknowledgements *</div>
						<div className={"FormLine"}>
							<div className="row">
								<div className="col-md-12">
									<div className={"FormLine-label"}>
										Please read and agree to the &nbsp;
										<a href='https://ncc.cy/community-code-of-conduct/'>Community&apos; s Code of Conduct</a> &amp;&nbsp;
										<a href='https://ncc.cy/privacy-policy/'>Privacy Policy and Terms of Use</a>.
									</div>
								</div>
							</div>
						</div>
						<FormLine
							label={"I acknowledge and agree to abide with the Community's Code of Conduct"}
							type={"checkbox"}
							value={this.state.agree_code}
							onChange={(v) => this.setState({ agree_code: v })}
						/>
						<FormLine
							label={"I acknowledge and agree with the Privacy Policy and Terms of Use"}
							type={"checkbox"}
							value={this.state.agree_privacy}
							onChange={(v) => this.setState({ agree_privacy: v })}
						/>
						<div className="row">
							<div className="col-md-12">
								<div className="right-buttons">
									<button
										className={"blue-background"}
										onClick={() => this.submitCreationRequest()}
									>
										Save my profile
									</button>
								</div>
							</div>
						</div>
						<br></br><br></br>
					</div>
				</div>
				
			</div>
			
		);
	}
}
