import React from "react";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";

export default class MembersProfiles extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			profile: {
				first_name: "",
				last_name: "",
				email: "",
				telephone: "",
				// domains_of_interest: "",
				organizations_types: "",
				taxonomy_types: "",
				address: "",
				city: "",
				postal_code: "",
				po_box: "",
				headquarter_address: "",
				headquarter_city: "",
				headquarter_postal_code: "",
				comply_article_eu: "",
				headquarter_po_box: "",
				taxonomy_other: "",
				achieve_join_community: "",
				contribution_community: "",
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
				ncc_consent: "No",
				signature: "",
			},

			// selected_domains: [],
			selected_types: [],
			selected_taxonomy: [],

			// expertise: [],
			// industries: [],
			// countries: [],
			// professions: [],
			// domains: [],
			types: [],
			typesTax: [],
		};
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
		});

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

		// getRequest.call(this, "public/get_public_domains", (data) => {
		// 	this.setState({
		// 		domains: data,
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

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	changeProfileState(field, value) {
		const tempProfile = this.state.profile;
		tempProfile[field] = value;
		this.changeState("profile", tempProfile);
		this.props.setProfileValues(this.state.profile);
	}

	// setRole(value) {
	// 	this.changeProfileState("profession_id", value);
	// 	const role = this.state.professions.find(
	// 		(p) => (p.id === value),
	// 	);
	// 	if (role !== undefined && (role.name === "Student" || role.name === "Retired")) {
	// 		this.changeProfileState("sector", null);
	// 		this.changeProfileState("industry_id", null);
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
	// 	if (this.state.profile.domains_of_interest !== null) {
	// 		domains = this.state.profile.domains_of_interest.split(" | ");
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
	// 	this.changeState("selected_domains", domains);
	// 	this.changeProfileState("domains_of_interest", domains.length >
	// 0 ? domains.join(" | ") : null);
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
					label="Organization"
					value={this.state.profile.entity_name}
					disabled={true}
				/>
				<FormLine
					label="Registration number"
					value={this.state.profile.vat_number}
					disabled={true}
				/>
				<FormLine
					label="Email"
					value={this.state.profile.company_email}
					disabled={true}
				/>
				<FormLine
					label="Telephone"
					value={this.state.profile.company_phone}
					disabled={true}
				/>
				<FormLine
					label="Website *"
					value={this.state.profile.website}
					disabled={true}
				/>
				{/* <div className="FormLine-label font-weight-bold">Postal Address</div>
				<FormLine
					label="Address"
					value={this.state.profile.address}
					disabled={true}
				/>
				<FormLine
					label="City"
					value={this.state.profile.city}
					disabled={true}
				/>
				<FormLine
					label="Postal Code"
					value={this.state.profile.postal_code}
					disabled={true}
				/>
				<FormLine
					label="P.O. Box"
					value={this.state.profile.po_box}
					disabled={true}
				/>
				<FormLine
					label="Headquarter Address"
					value={this.state.profile.headquarter_address}
					disabled={true}
				/>
				<FormLine
					label="Headquarter City"
					value={this.state.profile.headquarter_city}
					disabled={true}
				/>
				<FormLine
					label="Headquarter Postal Code"
					value={this.state.profile.headquarter_postal_code}
					disabled={true}
				/>
				<FormLine
					label="Headquarter P.O. Box"
					value={this.state.profile.headquarter_po_box}
					disabled={true}
				/> */}
				<div className="FormLine-label font-weight-bold">Organization Types*</div>
				{this.state.types !== null
					? this.state.types
						.map((c) => (
							<FormLine
								key={c.id}
								label={c.name}
								type={"checkbox"}
								value={this.state.selected_types.includes(c.name)}
								disabled={true}
							/>
						))
					: <Loading height={200} />
				}
				<FormLine
					label="Other"
					value={this.state.profile.other}
					disabled={true}
					type="textarea"
				/>
				{/* <FormLine
					label="Does your organization have subsidiaries in other EU Member States (including EFA/EFTA countries)?"
					value={this.state.profile.eu_member}
					disabled={true}
				/>
				<FormLine
					label="Countries and sector of activity"
					value={this.state.profile.eu_country}
					disabled={true}
				/>
				<FormLine
					label="Do you hold the majority of shares of any organizations abroad?"
					value={this.state.profile.majority_shares}
					disabled={true}
				/>
				<FormLine
					label="Countries and sector of activity"
					value={this.state.profile.shares_country}
					disabled={true}
				/>
				<FormLine
					label="Does your organization comply to the requirements described in Article 136 of the EU Financial Regulation?"
					value={this.state.profile.comply_article_eu}
					disabled={true}
				/> */}
				{/* <div className="FormLine-label font-weight-bold">Representative/Contact Person</div>
				<FormLine
					label="Name"
					value={this.state.profile.first_name}
					disabled={true}
				/>
				<FormLine
					label="Surname"
					value={this.state.profile.last_name}
					disabled={true}
				/>
				<FormLine
					label="Position that you hold in the Organization"
					value={this.state.profile.position_organization}
					disabled={true}
				/>
				<FormLine
					label="Phone Number"
					value={this.state.profile.telephone}
					disabled={true}
				/>
				<FormLine
					label="Email"
					value={this.state.profile.email}
					disabled={true}
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
					disabled={true}
				/> */}
				{/* <div className="FormLine-label font-weight-bold">Field of Activity/Expertise</div>
				<FormLine
					label="Please specify the contact person’s expertise in the field of cybersecurity"
					value={this.state.profile.person_expertise}
					disabled={true}
				/>
				<FormLine
					label="Your organization&apos;s expertise in the field of cybersecurity (according to Article 8 (3) *"
					value={this.state.profile.field_article_expertise}
					disabled={true}
				/>
				<FormLine
					label="Expertise – detailed description"
					value={this.state.profile.detail_expertise}
					disabled={true}
				/> */}
				<div className="FormLine-label font-weight-bold">Expertise according to the Cybersecurity Taxonomy</div>
				{this.state.typesTax !== null
					? this.state.typesTax
						.map((c) => (
							<FormLine
								key={c.id}
								label={c.name}
								type={"checkbox"}
								value={this.state.selected_taxonomy.includes(c.name)}
								disabled={true}
							/>
						))
					: <Loading height={200} />
				}
				<FormLine
					label="Other"
					value={this.state.profile.taxonomy_other}
					disabled={true}
					type="textarea"
				/>
				{/* <FormLine
					label="What do you seek to achieve by joining the Community?"
					value={this.state.profile.achieve_join_community}
					disabled={true}
				/>
				<FormLine
					label="How and in what ways can you contribute to the goals and tasks of the Community?"
					value={this.state.profile.contribution_community}
					disabled={true}
				/>
				<FormLine
					label="I give my consent to the NCC-CY to use the data provided."
					value={this.state.profile.ncc_consent}
					disabled={true}
				/>
				<FormLine
					label="Signature (Name and Surname) "
					value={this.state.profile.signature}
					disabled={true}
				/> */}
				{/* <FormLine
					label="Mobile Number"
					value={this.state.profile.mobile}
					disabled={true}
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
					value={this.state.profile.profession_id}
					disabled={true}
				/>
				<FormLine
					label="Sector *"
					type="select"
					options={[
						{ value: null, label: "-" },
						{ value: "Private", label: "Private" },
						{ value: "Public", label: "Public" },
					]}
					value={this.state.profile.sector}
					disabled={true}
				/> */}

				{/* <FormLine
					label="Industry *"
					type="select"
					options={[{ value: null, label: "-" }].concat(
						this.state.industries.map((o) => ({ label: o.name, value: o.id })),
					)}
					value={this.state.profile.industry_id}
				/>
				<FormLine
					label="Nationality *"
					type="select"
					options={[{ value: null, label: "-" }].concat(
						this.state.countries.map((o) => ({ label: o.name, value: o.id })),
					)}
					value={this.state.profile.nationality_id}
					disabled={true}
				/>
				<FormLine
					label="Residency (Location) *"
					value={this.state.profile.residency}
					disabled={true}
				/>
				<FormLine
					label="Years of professional experience in/related to cybersecurity *"
					value={this.state.profile.experience}
					disabled={true}
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
					value={this.state.profile.expertise_id}
					disabled={true}
				/>
				<div className="FormLine-label font-weight-bold">Domains of interest *</div>
				{this.state.domains !== null
					? this.state.domains
						.map((c) => (
							<FormLine
								key={c.id}
								label={c.name}
								type={"checkbox"}
								value={this.state.selected_domains.includes(c.name)}
								disabled={true}
							/>
						))
					: <Loading height={200} />
				} */}
			</div>
		);
	}
}
