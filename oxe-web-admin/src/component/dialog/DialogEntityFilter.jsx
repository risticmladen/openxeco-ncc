import React from "react";
import "./DialogEntityFilter.css";
import Popup from "reactjs-popup";
import _ from "lodash";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "../button/FormLine.jsx";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";

export default class DialogEntityFilter extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
		this.onOpen = this.onOpen.bind(this);
		this.afterConfirmation = this.afterConfirmation.bind(this);
		this.changeState = this.changeState.bind(this);
		this.getNumberOfFilter = this.getNumberOfFilter.bind(this);
		this.eraseFilters = this.eraseFilters.bind(this);
		this.applyFilter = this.applyFilter.bind(this);
		this.fetchTaxonomyData = this.fetchTaxonomyData.bind(this);
		this.fetchEntityEnums = this.fetchEntityEnums.bind(this);
		this.fetchEntityEmails = this.fetchEntityEmails.bind(this);

		this.initialState = {
			allowedFilters: ["name", "startup_only", "status", "legal_status", "email"],

			...this.props.filters,

			categories: null,
			taxonomy_values: null,

			entityEnums: null,
			entityEmmails: null,
		};

		this.state = _.cloneDeep(this.initialState);
	}

	onOpen() {
		this.fetchTaxonomyData();
		this.fetchEntityEnums();
		this.fetchEntityEmails();
	}

	fetchTaxonomyData() {
		getRequest.call(this, "taxonomy/get_taxonomy_categories", (data) => {
			this.setState({
				categories: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "taxonomy/get_taxonomy_values", (data) => {
			this.setState({
				taxonomy_values: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchEntityEnums() {
		getRequest.call(this, "public/get_public_entity_enums", (data) => {
			this.setState({
				entityEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchEntityEmails() {
		getRequest.call(this, "entity/get_entities?", (email) => {
			this.setState({
				entityEmmails: email,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	afterConfirmation() {
		this.props.afterConfirmation();
		document.elementFromPoint(100, 0).click();
	}

	static cancel() {
		document.elementFromPoint(100, 0).click();
	}

	eraseFilters() {
		this.setState({ ...this.initialState }, () => {
			this.fetchTaxonomyData();
		});
	}

	getNumberOfFilter() {
		let n = 0;

		this.state.allowedFilters.forEach((filter) => {
			if (typeof this.state[filter] === "boolean" && this.state[filter]) n += 1;
			if (typeof this.state[filter] === "string" && this.state[filter].length > 0) n += 1;
			if (Array.isArray(this.state[filter]) && this.state[filter] > 0) {
				n += this.state[filter].length;
			}
		});

		if (this.state.categories !== null) {
			for (let i = 0; i < this.state.categories.length; i++) {
				if (Array.isArray(this.state[this.state.categories[i].name])) {
					n += this.state[this.state.categories[i].name].length;
				}
			}
		}

		return n;
	}

	applyFilter() {
		const filters = Object.keys(this.state)
			.filter((key) => this.state.allowedFilters.includes(key))
			.reduce((obj, key) => {
				// eslint-disable-next-line no-param-reassign
				obj[key] = this.state[key];
				return obj;
			}, {});

		let values = [];

		for (let i = 0; i < this.state.categories.length; i++) {
			if (Array.isArray(this.state[this.state.categories[i].name])) {
				values = values.concat(this.state[this.state.categories[i].name]);
			}
		}

		filters.taxonomy_values = values;

		if (this.state.email) {
			filters.email = this.state.email;
		}

		this.props.applyFilter(filters);
		DialogEntityFilter.cancel();
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				trigger={
					<div className={"DialogEntityFilter-button"}>
						{this.props.trigger}
						{this.getNumberOfFilter() > 0
							? <div className="Badge">
								{this.getNumberOfFilter()}
							</div>
							: ""}
					</div>
				}
				modal
				onOpen={this.onOpen}
				closeOnDocumentClick
				className={"slide-in DialogEntityFilter"}
			>
				<div className={"DialogEntityFilter-form"}>
					<h2>Filter entities</h2>
					{/* <button
						className={"link-button"}
						data-hover="Cancel"
						data-active=""
						onClick={this.eraseFilters}
						disabled={this.getNumberOfFilter() === 0}>
						<span><i className="fas fa-eraser"/> Erase filters</span>
					</button> */}
					<FormLine
						label="Entity name"
						fullWidth={true}
						value={this.state.name}
						onChange={(v) => this.changeState("name", v)}
						autofocus={true}
					/>
					{this.state.entityEnums !== null
						? <FormLine
							label={"Status"}
							type={"select"}
							value={this.state.status}
							options={this.state.entityEnums === null
                                || typeof this.state.entityEnums.status === "undefined" ? []
								: [{ value: null, label: "-" }].concat(
									this.state.entityEnums.status.map((o) => ({ label: o, value: o })),
								)}
							onChange={(v) => this.changeState("status", v)}
						/>
						: <Loading
							height={50}
						/>
					}
					{this.state.entityEnums !== null
						? <FormLine
							label={"Legal status"}
							type={"select"}
							value={this.state.legal_status}
							options={this.state.entityEnums === null
                                || typeof this.state.entityEnums.legal_status === "undefined" ? []
								: [{ value: null, label: "-" }].concat(
									this.state.entityEnums.legal_status.map((o) => ({ label: o, value: o })),
								)}
							onChange={(v) => this.changeState("legal_status", v)}
						/>
						: <Loading
							height={50}
						/>
					}
					<FormLine
						label="Only startups"
						type={"checkbox"}
						value={this.state.startup_only}
						onChange={(v) => this.changeState("startup_only", v)}
					/>
					{this.state.categories !== null && this.state.taxonomy_values !== null
						? this.state.categories
							.filter((c) => c.active_on_entities)
							.map((c) => (
								<FormLine
									key={c.name}
									label={c.name}
									type={"multiselect"}
									fullWidth={true}
									value={this.state[c.name] === undefined ? [] : this.state[c.name]}
									options={this.state.taxonomy_values
										.filter((v) => v.category === c.name)
										.map((v) => ({ label: v.name, value: v.id }))}
									onChange={(v) => this.changeState(c.name, v)}
								/>
							))
						: <Loading
							height={200}
						/>
					}
					{/* <FormLine
						label="Entity email"
						fullWidth={true}
						value={this.state.email}
						onChange={(v) => this.changeState("email", v)}
					/> */}
				</div>
				<div className={"bottom-right-buttons"}>
					<button
						className={"grey-background"}
						data-hover="Close"
						data-active=""
						onClick={DialogEntityFilter.cancel}>
						<span><i className="far fa-times-circle"/> Close</span>
					</button>
					<button
						data-hover="Apply"
						data-active=""
						onClick={this.applyFilter}>
						<span><i className="far fa-check-circle"/> Apply</span>
					</button>
				</div>
			</Popup>
		);
	}
}
