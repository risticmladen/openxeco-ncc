import React from "react";
import { NotificationManager as nm } from "react-notifications";
import _ from "lodash";
import { getRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import { validateNotNull, validateTelephoneNumber } from "../../../utils/re.jsx";

export default class UpdateProfile extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			profile: {
				first_name: "",
				last_name: "",
				telephone: "",
				// domains_of_interest: "",
				organizations_types: "",
				taxonomy_types: "",
				experience: "",
				// expertise_id: "",
				gender: "null",
				// how_heard: null,
				// industry_id: null,
				// mobile: "",
				position_organization: "",
				address: "",
				headquarter_address: "",
				city: "",
				headquarter_city: "",
				postal_code: "",
				headquarter_postal_code: "",
				po_box: "",
				headquarter_po_box: "",
				// nationality_id: null,
				// profession_id: null,
				// residency: null,
				// sector: null,
				// public: false,
				user_id: null,
				entity_name: "",
				vat_number: "",
				website: "",
				company_email: "",
				company_phone: "",
				other: "",
				eu_member: "No", // State variable for EU member status
				eu_country: "", // State variable for EU country info
				majority_shares: "No", // State variable for EU member status
				shares_country: "", // State variable for EU country info
				person_expertise: "",
				field_article_expertise: "",
				detail_expertise: "",
				taxonomy_other: "",
				achieve_join_community: "",
				contribution_community: "",
				article_compy_regulation: "No",
				comply_article_eu: "No",
				signature: "",
				ncc_consent: "No",
				registration_date: "",
			},

			// selected_domains: [],
			selected_types: [],
			selected_taxonomy: [],

			expertise: [],
			industries: [],
			countries: [],
			professions: [],
			// domains: [],
			types: [],
			typesTax: [],
			originalProfile: {}, // Store the original profile for discard changes
		};

		this.debouncedChangeProfileState = _.debounce(this.changeProfileState.bind(this), 500);
	}

	componentDidMount() {
		// let selectedDomains = [];
		let selectedTypes = [];
		let selectedTaxonomyTypes = [];

		// if (this.props.userProfile.domains_of_interest !== null) {
		// 	selectedDomains = this.props.userProfile.domains_of_interest.split(" | ");
		// }

		if (this.props.userProfile.organizations_types !== null) {
			selectedTypes = this.props.userProfile.organizations_types.split(" | ");
		}

		if (this.props.userProfile.taxonomy_types !== null) {
			selectedTaxonomyTypes = this.props.userProfile.taxonomy_types.split(" | ");
		}

		this.setState({
			profile: this.props.userProfile,
			// selected_domains: selectedDomains,
			selected_types: selectedTypes,
			selected_taxonomy: selectedTaxonomyTypes,
			originalProfile: JSON.parse(JSON.stringify(this.props.userProfile)),
		});

		getRequest.call(this, "public/get_public_countries", (data) => {
			this.setState({
				countries: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_professions", (data) => {
			this.setState({
				professions: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_industries", (data) => {
			this.setState({
				industries: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

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

		getRequest.call(this, "public/get_public_expertise", (data) => {
			this.setState({
				expertise: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	changeProfileState(field, value) {
		const tempProfile = this.state.profile;
		tempProfile[field] = value;
		this.changeState("profile", tempProfile);
		this.props.setProfileValues(this.state.profile);
	}

	handleInputChange(field, value) {
		const tempProfile = { ...this.state.profile, [field]: value };
		this.setState({ profile: tempProfile });
		this.debouncedChangeProfileState(field, value);
	}


	agreedToAll() {
		return this.state.agree_code && this.state.agree_privacy;
	}


	setOrganizationType(name, value) {
		let types = [];
		if (this.state.profile.organizations_types !== null) {
			types = this.state.profile.organizations_types.split(" | ");
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
		this.changeState("selected_types", types);
		this.changeProfileState("organizations_types", types.length > 0 ? types.join(" | ") : null);
	}

	setTaxonomyType(name, value) {
		let typesTax = [];
		if (this.state.profile.taxonomy_types !== null) {
			typesTax = this.state.profile.taxonomy_types.split(" | ");
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
		this.changeState("selected_taxonomy", typesTax);
		this.changeProfileState("taxonomy_types", typesTax.length > 0 ? typesTax.join(" | ") : null);
	}

	render() {
		return (
			<div>
				<div className="FormLine-label font-weight-bold">Organization Details</div>
				<FormLine
					label="Organization *"
					value={this.state.profile.entity_name}
					onChange={(v) => this.handleInputChange("entity_name", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
				/>
				<FormLine
					label="Registration number*"
					value={this.state.profile.vat_number}
					onChange={(v) => this.handleInputChange("vat_number", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
				/>
				<FormLine
					label="Email *"
					value={this.state.profile.company_email}
					onChange={(v) => this.handleInputChange("company_email", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
				/>
				<FormLine
					label="Telephone *"
					value={this.state.profile.company_phone}
					onChange={(v) => this.handleInputChange("company_phone", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
				/>
				<FormLine
					label="Website *"
					value={this.state.profile.website}
					onChange={(v) => this.handleInputChange("website", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
				/>
				<div className="FormLine-label font-weight-bold">Postal Address</div>
				<FormLine
					label="Address"
					value={this.state.profile.address}
					onChange={(v) => this.handleInputChange("address", v)}
					onKeyDown={this.onKeyDown}
					format={validateNotNull}
					type="textarea"
				/>
				<FormLine
					label="City"
					value={this.state.profile.city}
					onChange={(v) => this.handleInputChange("city", v)}
					onKeyDown={this.onKeyDown}
					format={validateNotNull}
				/>
				<FormLine
					label="Postal Code"
					value={this.state.profile.postal_code}
					onChange={(v) => this.handleInputChange("postal_code", v)}
					onKeyDown={this.onKeyDown}
					format={validateNotNull}
				/>
				<FormLine
					label="P.O. Box"
					value={this.state.profile.po_box}
					onChange={(v) => this.handleInputChange("po_box", v)}
					onKeyDown={this.onKeyDown}
				/>
				<FormLine
					label="Headquarter Address"
					value={this.state.profile.headquarter_address}
					onChange={(v) => this.handleInputChange("headquarter_address", v)}
					onKeyDown={this.onKeyDown}
					type="textarea"
				/>
				<FormLine
					label="Headquarter City"
					value={this.state.profile.headquarter_city}
					onChange={(v) => this.handleInputChange("headquarter_city", v)}
					onKeyDown={this.onKeyDown}
				/>
				<FormLine
					label="Headquarter Postal Code"
					value={this.state.profile.headquarter_postal_code}
					onChange={(v) => this.handleInputChange("headquarter_postal_code", v)}
					onKeyDown={this.onKeyDown}
				/>
				<FormLine
					label="Headquarter P.O. Box"
					value={this.state.profile.headquarter_po_box}
					onChange={(v) => this.handleInputChange("headquarter_po_box", v)}
					onKeyDown={this.onKeyDown}
				/>
				<div className="FormLine-label font-weight-bold">Organization Types *</div>
				{this.state.types !== null
					? this.state.types
						.map((c) => (
							<FormLine
								key={c.id}
								label={c.name}
								type={"checkbox"}
								value={this.state.selected_types.includes(c.name)}
								onChange={(v) => this.setOrganizationType(c.name, v)}
								
							/>
						))
					: <Loading height={200} />
				}
				<FormLine
					label="Other"
					value={this.state.profile.other}
					onChange={(v) => this.handleInputChange("other", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
					type="textarea"
				/>
				<FormLine
					label="Does your organization have subsidiaries in other EU Member States (including EFA/EFTA countries)?"
					value={this.state.profile.eu_member}
					disabled={true}
				/>
				<FormLine
					label="Specify countries and sector of activity"
					value={this.state.profile.eu_country}
					onChange={(v) => this.handleInputChange("eu_country", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
					type="textarea"
				/>
				<FormLine
					label="Do you hold the majority of shares of any organizations abroad?"
					value={this.state.profile.majority_shares}
					disabled={true}
				/>
				<FormLine
					label="Specify countries and sector of activity"
					value={this.state.profile.shares_country}
					onChange={(v) => this.handleInputChange("shares_country", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
					type="textarea"
				/>
				<FormLine
					label="Does your organization comply to the requirements described in Article 136 of the EU Financial Regulation?"
					value={this.state.profile.comply_article_eu}
					disabled={true}
				/>
				<FormLine
					label="Article 9"
					value={this.state.profile.article_compy_regulation}
					disabled={true}
				/>
				<div className="FormLine-label font-weight-bold">Representative/Contact Person</div>
				<FormLine
					label="Name *"
					value={this.state.profile.first_name}
					onChange={(v) => this.handleInputChange("first_name", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
				/>
				<FormLine
					label="Surname *"
					value={this.state.profile.last_name}
					onChange={(v) => this.handleInputChange("last_name", v)}
					onKeyDown={this.onKeyDown}
				/>
				<FormLine
					label="Position in the Organization"
					value={this.state.profile.position_organization}
					onChange={(v) => this.handleInputChange("position_organization", v)}
					onKeyDown={this.onKeyDown}
					format={validateNotNull}
				/>
				<FormLine
					label="Phone Number"
					value={this.state.profile.telephone}
					onChange={(v) => this.handleInputChange("telephone", v)}
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
					value={this.state.profile.gender}
					onChange={(v) => this.handleInputChange("gender", v)}
					onKeyDown={this.onKeyDown}
					format={validateNotNull}
				/>
				<div className="FormLine-label font-weight-bold">Field of Activity/Expertise</div>
				<FormLine
					label="Please specify the contact person’s expertise in the field of cybersecurity"
					value={this.state.profile.person_expertise}
					onChange={(v) => this.handleInputChange("person_expertise", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
					type="textarea"
				/>
				<FormLine
					label="Your organization&apos;s expertise in the field of cybersecurity (according to Article 8 (3)"
					value={this.state.profile.field_article_expertise}
					onChange={(v) => this.handleInputChange("field_article_expertise", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
					type="textarea"
				/>
				<FormLine
					label="Expertise – detailed description"
					value={this.state.profile.detail_expertise}
					onChange={(v) => this.handleInputChange("detail_expertise", v)}
					autofocus={true}
					type="textarea"
				/>
				<div className="FormLine-label font-weight-bold">Expertise according to the Cybersecurity Taxonomy</div>
				{this.state.typesTax !== null
					? this.state.typesTax
						.map((c) => (
							<FormLine
								key={c.id}
								label={c.name}
								type={"checkbox"}
								value={this.state.selected_taxonomy.includes(c.name)}
								onChange={(v) => this.setTaxonomyType(c.name, v)}
							/>
						))
					: <Loading height={200} />
				}
				<FormLine
					label="Other"
					value={this.state.profile.taxonomy_other}
					onChange={(v) => this.handleInputChange("taxonomy_other", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
					type="textarea"
				/>
				<FormLine
					label="What do you seek to achieve by joining the Community?"
					value={this.state.profile.achieve_join_community}
					onChange={(v) => this.handleInputChange("achieve_join_community", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
					type="textarea"
				/>
				<FormLine
					label="How and in what ways can you contribute to the goals and tasks of the Community?"
					value={this.state.profile.contribution_community}
					onChange={(v) => this.handleInputChange("contribution_community", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
					type="textarea"
				/>
				<FormLine
					label="I give my consent to the NCC-CY to use the data provided."
					value={this.state.profile.ncc_consent}
					disabled={true}
				/>
				<FormLine
					label="Signature (Name and Surname)"
					value={this.state.profile.signature}
					disabled={true}
				/>
				<FormLine
					label="Registration Date"
					value={this.state.profile.registration_date}
					disabled={true}
				/>
			</div>
		);
	}
}
