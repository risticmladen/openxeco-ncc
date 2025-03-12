import React from "react";
import "./EntityGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getForeignRequest, postRequest, getRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import DialogAddImage from "../../dialog/DialogAddImage.jsx";
import Message from "../../box/Message.jsx";

export default class EntityGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			entityEnums: null,
			sector: "",
			industry: "",
			sectors: [],
			industries: null,
			involvement: "",
			involvements: [],
		};
	}

	componentDidMount() {
		this.getEntityEnums();
		getRequest.call(this, "public/get_public_sectors", (data) => {
			this.setState({
				sectors: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});
		getRequest.call(this, "public/get_public_involvement", (data) => {
			this.setState({
				involvements: data,
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

	setIndustries(name) {
		const sector = this.state.sectors.find(
			(s) => (s.name === name),
		);
		const sectorIndustries = sector.industries.split("|");
		this.changeState("sector", sector.name);
		this.changeState("industries", sectorIndustries);
		this.changeState("industry", "");
		this.forceUpdate();
	}

	handleSectorChange = (v) => {
		this.setIndustries(v);
		this.saveEntityValue("sector", v);
	};

	getEntityEnums() {
		if (this.props.node && this.props.node.api_endpoint) {
			const url = this.props.node.api_endpoint + "/public/get_public_entity_enums";

			getForeignRequest.call(this, url, (data) => {
				this.setState({
					entityEnums: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			getRequest.call(this, "public/get_public_entity_enums", (data) => {
				this.setState({
					entityEnums: data,
				});
				console.log(data);
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	saveEntityValue(prop, value) {
		if (this.props?.entity[prop] !== value) {
			const params = {
				id: this.props.id,
				[prop]: value,
			};

			postRequest.call(this, "entity/update_entity", params, () => {
				this.props.refresh();
				nm.info("The property has been updated");
			}, (response) => {
				this.props.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.props.refresh();
				nm.error(error.message);
			});
		}
	}

	render() {
		if (!this.props?.entity || !this.state.entityEnums) {
			return <Loading height={300} />;
		}

		return (
			<div id="EntityGlobal" className={"row"}>
				{this.props.editable
					&& <div className="Entity-action-buttons-wrapper">
						<div className={"Entity-action-buttons"}>
							<h3>Quick actions</h3>
							<div>
								<DialogAddImage
									trigger={
										<button
											className={"blue-background"}
											data-hover="Filter">
											<i className="fas fa-plus"/> Add image
										</button>
									}
								/>
							</div>
						</div>
					</div>
				}

				<div className="col-md-12">
					<h2>Global</h2>
				</div>

				<div className="col-md-12">
					<h3>Identity</h3>
				</div>

				<div className="col-md-6 row-spaced">
					<FormLine
						type={"image"}
						label={""}
						value={this.props?.entity?.image}
						onChange={(v) => this.saveEntityValue("image", v)}
						height={160}
						disabled={!this.props.editable}
						fullWidth={true}
					/>
				</div>

				<div className="col-md-6">
					<FormLine
						label={"ID"}
						value={this.props?.entity?.id}
						disabled={true}
					/>
					<FormLine
						label={"Status"}
						type={"select"}
						value={this.props?.entity?.status}
						options={this.state.entityEnums === null
							|| typeof this.state.entityEnums.status === "undefined" ? []
							: this.state.entityEnums.status.map((o) => ({ label: o, value: o }))}
						onChange={(v) => this.saveEntityValue("status", v)}
						disabled={!this.props.editable}
					/>
					{/* <FormLine
						label={"Name"}
						value={this.props?.entity?.name}
						onBlur={(v) => this.saveEntityValue("name", v)}
						disabled={!this.props.editable}
						fullWidth={true}
					/> */}
				</div>

				<div className="col-md-12">
					<h3>Global information</h3>
				</div>

				<div className={"col-md-12 row-spaced"}>
					<FormLine
						label={"Name"}
						value={this.props?.entity?.name}
						// disabled={true}
						onBlur={(v) => this.saveEntityValue("name", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Entity Type"}
						type={"select"}
						value={this.props?.entity?.entity_type}
						options={this.state.entityEnums === null
							|| typeof this.state.entityEnums.entity_type === "undefined" ? []
							: this.state.entityEnums.entity_type.map((o) => ({ label: o, value: o }))}
						onChange={(v) => this.saveEntityValue("entity_type", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"VAT Number"}
						value={this.props?.entity?.vat_number || ""}
						// disabled={true}
						onBlur={(v) => this.saveEntityValue("vat_number", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Website"}
						value={this.props?.entity?.website || ""}
						// disabled={true}
						onBlur={(v) => this.saveEntityValue("website", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Company Email"}
						value={this.props?.entity?.email || ""}
						// disabled={true}
						onBlur={(v) => this.saveEntityValue("email", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Size"}
						type={"select"}
						value={this.props?.entity?.size}
						options={this.state.entityEnums === null
							|| typeof this.state.entityEnums.size === "undefined" ? []
							: this.state.entityEnums.size.map((o) => ({ label: o, value: o }))}
						onChange={(v) => this.saveEntityValue("size", v)}
						disabled={!this.props.editable}
					/>
					{this.state.sectors
						? <FormLine
							label={"Sector *"}
							type={"select"}
							options={this.state.sectors
								? this.state.sectors
									.map((d) => ({ label: d.name, value: d.name }))
								: []
							}
							value={this.props?.entity?.sector}
							// value={this.state.sector}
							// onChange={(v) => this.setIndustries(v)}
							onChange={(v) => this.handleSectorChange(v)}
							// onChange={this.handleSectorChange(v)}
							disabled={false}
						/>
						: <Loading
							height={200}
						/>
					}
					<FormLine
						label={"Industry *"}
						type={"select"}
						options={this.state.industries
							? this.state.industries
								.map((d) => ({ label: d, value: d }))
							: []
						}
						// value={this.state.industry}
						value={this.props?.entity?.industry}
						// onChange={(v) => this.handleIndustryChange(v)}
						onChange={(v) => this.saveEntityValue("industry", v)}
						disabled={!this.props.editable}
					/>
					{/* <FormLine
						label={"Primary involvement"}
						value={this.props?.entity?.involvement || ""}
						// disabled={true}
						disabled={!this.props.editable}
					/> */}
					{this.state.involvements
						? <FormLine
							label={"Primary involvement *"}
							type={"select"}
							options={
								this.state.involvements.map((o) => ({
									label: (
										<>
											<div title={o.description}>{o.name}</div>
										</>
									),
									value: o.name,
								}))
							}
							value={this.props?.entity?.involvement}
							onChange={(v) => this.saveEntityValue("involvement", v)}
							// value={this.state.involvement}
							// onChange={(v) => this.setState({ involvement: v })}
							disabled={false}
						/>
						: <Loading
							height={200}
						/>
					}
					{/* <FormLine
						label="Authorisation by Approved Signatory"
						value={this.props?.entity?.approved_signatory?.filename}
						// disabled={true}
						disabled={!this.props.editable}
					/> */}
				</div>
				<div className="col-md-12">
					<h3>Address</h3>
				</div>
				<div className={"col-md-12 row-spaced"}>
					<FormLine
						label={"Address Line 1"}
						value={this.props?.entityAddress?.address_1}
						disabled={true}
					/>
					<FormLine
						label={"Address Line 2"}
						value={this.props?.entityAddress?.address_2}
						disabled={true}
					/>
					<FormLine
						label={"Postal Code"}
						value={this.props?.entityAddress?.postal_code}
						disabled={true}
					/>
					<FormLine
						label={"City"}
						value={this.props?.entityAddress?.city}
						disabled={true}
					/>
					<FormLine
						label={"Country"}
						value={this.props?.entityAddress?.country}
						disabled={true}
					/>
				</div>

				<div className="col-md-12">
					<h3>Contact</h3>
				</div>
				<div className={"col-md-12 row-spaced"}>
					{this.props.entityContacts !== undefined && this.props.entityContacts !== null
						? <div>
							<FormLine
								label={"Contact Name"}
								value={this.props?.entityContacts?.name}
								disabled={true}
							/>

							<FormLine
								label={"Contact Email"}
								value={this.props?.entityContacts?.work_email}
								disabled={true}
							/>

							<FormLine
								label={"Work Telephone Number"}
								value={this.props?.entityContacts?.work_telephone}
								disabled={true}
							/>

							<FormLine
								label={"Department"}
								value={this.props?.entityContacts?.department}
								disabled={true}
							/>

							<FormLine
								label={"Seniority Level"}
								value={this.props?.entityContacts?.seniority_level}
								disabled={true}
							/>

							<FormLine
								label={"Acknowledged"}
								value={this.props?.entityContacts?.acknowledged}
								disabled={true}
							/>
						</div>
						: <Message
							text={"This entity has no contact"}
							height={50} />
					}
				</div>
			</div>
		);
	}
}
