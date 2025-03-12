import React, { Component } from "react";
// import "./RequestEntityAdd.css";
import"./RequestIndividualAccountAdd.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";

export default class RequestIndividualAccountAdd extends Component {
	constructor(props) {
		super(props);

		this.insertEntity = this.insertEntity.bind(this);
		this.rejectEntity = this.rejectEntity.bind(this);

		this.state = {
			expertise: "",
			industry: "",
			country: "",
			profession: "",
			domain: "",
		};
	}

	componentDidMount() {
		this.fetchData("public/get_public_countries", "country", this.props.data.nationality_id);
		this.fetchData("public/get_public_professions", "profession", this.props.data.profession_id);
		this.fetchData("public/get_public_industries", "industry", this.props.data.industry_id);
		this.fetchData("public/get_public_expertise", "expertise", this.props.data.expertise_id);
	}

	fetchData(endpoint, stateKey, id) {
		getRequest.call(this, endpoint, (data) => {
			this.setState({
				[stateKey]: RequestIndividualAccountAdd.getById(data, id),
			});
		}, (error) => nm.warning(error.message), (error) => nm.error(error.message));
	}

	static getById(list, id) {
		const item = list.find((a) => a.id === id);
		return item ? item.name : "";
	}

	insertEntity() {
		if (!this.props.data) {
			nm.warning("Data to be inserted not found");
			return;
		}
		if (this.props.data.id !== undefined) {
			nm.warning("Cannot add an entity with an ID");
			return;
		}

		const params = { user_id: this.props.userId, data: this.props.data };
		postRequest.call(this, "account/add_profile", params, 
			() => nm.info("The profile has been created"),
			(response) => nm.warning(response.statusText),
			(error) => nm.error(error.message)
		);
	}

	rejectEntity() {
		const params = { id: this.props.userId, status: "REJECTED" };
		postRequest.call(this, "user/update_user", params, 
			() => nm.info("The profile has been set to rejected"),
			(response) => nm.warning(response.statusText),
			(error) => nm.error(error.message)
		);
	}

	render() {
		const { data } = this.props;

		return (
			<Popup
				className="Popup-large"
				trigger={<button className="blue-background"><i className="fas fa-tasks" /> Review profile create</button>}
				modal
				closeOnDocumentClick
			>
				{(close) => (
					<div className="popup-container">
						{/* Header */}
						<div className="popup-header">
							<h2>Review profile create</h2>
							<button className="close-button" onClick={close}>
								<i className="far fa-times-circle" />
							</button>
						</div>

						{/* Scrollable Content */}
						<div className="popup-body">
							<div className="FormLine-label font-weight-bold">Organization Details</div>
							<FormLine label="Organization" value={data.entity_name} disabled />
							<FormLine label="Registration number" value={data.vat_number} disabled />

							<div className="FormLine-label font-weight-bold">Contact Details</div>
							<FormLine label="Email" value={data.company_email} disabled />
							<FormLine label="Telephone" value={data.company_phone} disabled />
							<FormLine label="Website" value={data.website} disabled />

							<div className="FormLine-label font-weight-bold">Postal Address</div>
							<FormLine label="Address" value={data.address || ""} type="textarea" disabled />
							<FormLine label="City" value={data.city || ""} disabled />
							<FormLine label="Postal Code" value={data.postal_code || ""} disabled />
							<FormLine label="P.O. Box" value={data.po_box || ""} disabled />
							<FormLine label="Headquarter Address" value={data.headquarter_address || ""} type="textarea" disabled />
							<FormLine label="Headquarter City" value={data.headquarter_city || ""} disabled />
							<FormLine label="Headquarter Postal Code" value={data.headquarter_postal_code || ""} disabled />
							<FormLine label="Headquarter P.O. Box" value={data.headquarter_po_box || ""} disabled />

							<div className="FormLine-label font-weight-bold">Organization Types*</div>
							<FormLine label="Organization Types" value={data.organizations_types} type="textarea" disabled />
							<FormLine label="Other" value={data.other || ""} type="textarea" disabled />
							<FormLine label="Does your organization have subsidiaries in other EU Member States (including EFA/EFTA countries)?" value={data.eu_member || ""} disabled />
							<FormLine label="If yes, please specify in which countries and the sector of activity" value={data.eu_country || ""} type="textarea" disabled />
							<FormLine label="Do you hold the majority of shares of any organizations abroad?" value={data.majority_shares || ""} disabled />
							<FormLine label="If yes, please specify in which countries and the sector of activity" value={data.shares_country || ""} type="textarea" disabled />
							<FormLine label="Does your organization comply to the requirements described in Article 136 of the EU Financial Regulation?" value={data.comply_article_eu || ""} disabled />

							<div className="FormLine-label font-weight-bold">Representative/Contact Person</div>
							<FormLine label="Name" value={data.first_name} disabled />
							<FormLine label="Surname" value={data.last_name} disabled />
							<FormLine label="Position in the Organization" value={data.position_organization || ""} disabled />
							<FormLine label="Phone Number" value={data.telephone || ""} disabled />

							<div className="FormLine-label font-weight-bold">Field of Activity/Expertise</div>
							<FormLine label="Please specify the contact person’s expertise in the field of cybersecurity" value={data.person_expertise} type="textarea" disabled />
							<FormLine label="Your organizations expertise in the field of cybersecurity (according to Article 8 (3)" value={data.field_article_expertise} type="textarea" disabled />
							<FormLine label="Expertise – detailed description" value={data.detail_expertise} type="textarea" disabled />
							<FormLine label="Expertise according to the Cybersecurity Taxonomy" value={data.taxonomy_types} type="textarea" disabled />
							<FormLine label="Other" value={data.taxonomy_other} type="textarea" disabled />
							<FormLine label="What do you seek to achieve by joining the Community?" value={data.achieve_join_community} type="textarea" disabled />
							<FormLine label="How and in what ways can you contribute to the goals and tasks of the Community?" value={data.contribution_community} type="textarea" disabled />

							<div className="FormLine-label font-weight-bold">Consent & Agreement</div>
							<FormLine label="I give my consent to the NCC-CY to use the data provided." value={data.ncc_consent || ""} disabled />
							<FormLine label="Signature (Name and Surname)" value={data.signature || ""} disabled />
						</div>

						{/* Footer */}
						<div className="popup-footer">
							<button className="blue-background" onClick={this.insertEntity}>
								<i className="fas fa-plus" /> Add account
							</button>
							<button className="grey-background" onClick={this.rejectEntity}>
								<i className="fas fa-minus" /> Do not add account
							</button>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
