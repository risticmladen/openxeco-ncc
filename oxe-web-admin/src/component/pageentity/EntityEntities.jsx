import React from "react";
import "./EntityEntities.css";
import { NotificationManager as nm } from "react-notifications";
import Popup from "reactjs-popup";
import Loading from "../box/Loading.jsx";
import EntitySortableTable from "../table/EntitySortableTable.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import Entity from "../item/Entity.jsx";
import Website from "../item/Website.jsx";
import FormLine from "../button/FormLine.jsx";
import DialogEntityFilter from "../dialog/DialogEntityFilter.jsx";
import DialogSendMail from "../dialog/DialogSendMail.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class EntityEntities extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			newEntityName: null,
			entities: null,
			entity: { email: "user@example.com" },
			subject: "Subject of the email",
			email_content: "Content of the email",
			filters: {},
			loading: false,
			allEmails: [],
			emailListKey: 0, // Key to force re-render of DialogSendMail
		};

		this.getEmail = this.getEmail.bind(this);
		this.addEntity = this.addEntity.bind(this);
		this.changeState = this.changeState.bind(this);
		this.applyFilter = this.applyFilter.bind(this);
	}

	applyFilter(filters) {
		// Update the filters state
		this.setState({ filters }, () => {
			// Call the parent's applyFilter function to filter the table data
			if (this.props.applyFilter) {
				this.props.applyFilter(filters);
			}

			// Refresh the emails based on the new filters
			this.getEmail()
				.then((emails) => {
					this.setState((prevState) => ({
						allEmails: emails,
						emailListKey: prevState.emailListKey + 1, // Increment key to force re-render
					}));
				})
				.catch((error) => {
					console.error("Error retrieving emails:", error);
				});
		});
	}

	addEntity(close) {
		const params = {
			name: this.state.newEntityName,
		};

		postRequest.call(
			this,
			"entity/add_entity",
			params,
			() => {
				this.props.refreshEntities();
				this.setState({ newEntityName: "" });
				if (close) {
					close();
				}
				nm.info("The entity has been added");
			},
			(response) => {
				nm.warning(response.statusText);
			},
			(error) => {
				nm.error(error.message);
			},
		);
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	getEmail() {
		this.setState({
			entities: null,
			loading: true,
		});

		const params = dictToURI(this.state.filters || {});

		return new Promise((resolve, reject) => {
			getRequest.call(
				this,
				"entity/get_entities?" + params,
				(data) => {
					const emails = data
						.map((entity) => entity.email)
						.filter((email) => email);
					this.setState({
						entities: data,
						loading: false,
						allEmails: emails,
					});

					resolve(emails);
				},
				(response) => {
					this.setState({ loading: false });
					nm.warning(response.statusText);
					reject(response);
				},
				(error) => {
					this.setState({ loading: false });
					nm.error(error.message);
					reject(error);
				},
			);
		});
	}

	componentDidMount() {
		this.getEmail()
			.then((emails) => {
				this.setState({ allEmails: emails });
			})
			.catch((error) => {
				console.error("Error retrieving emails:", error);
			});
	}

	render() {
		const { allEmails, emailListKey } = this.state;
		const emailList = allEmails.join(", ");
		const columns = [
			{
				Header: "Name",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Entity
						id={value.id}
						name={value.name}
						legalStatus={value.legal_status}
						afterDeletion={() => this.props.refreshEntities()}
						onOpen={() => this.props.history.push("/entities/" + value.id)}
						onClose={() => this.props.history.push("/entities")}
						open={value.id.toString() === this.props.match.params.id}
					/>
				),
			},
			{
				Header: "Website",
				accessor: "website",
				Cell: ({ cell: { value } }) => <Website url={value} />,
			},
		];

		return (
			<div id="EntityEntities">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1 className="common-heading">
							{this.props.entities
								? this.props.entities.length
								: 0}{" "}
							&nbsp;
							Entit
							{this.props.entities && this.props.entities.length > 1 ? "ies" : "y"}
						</h1>
						<div className="col-md-12 row-spaced">
							{emailList ? (
								<DialogSendMail
									key={emailListKey} // Key to force re-render
									trigger={
										<button
											className={"blue-background"}
											id="Request-send-mail-button"
										>
											<i className="fas fa-envelope-open-text" /> Prepare
											email to all...
										</button>
									}
									email={emailList}
									subject={this.state.subject}
									content={this.state.email_content}
								/>
							) : (
							""// <Loading height={50} />
							)}
						</div>
						<div className="top-right-buttons">
							<button onClick={() => this.props.refreshEntities()}>
								<i className="fas fa-redo-alt" />
							</button>
							<Popup trigger={<button><i className="fas fa-plus" /></button>} modal>
								{(close) => (
									<div className={"row row-spaced"}>
										<div className={"col-md-9"}>
											<h2>Add a new entity</h2>
										</div>
										<div className={"col-md-3"}>
											<div className="top-right-buttons">
												<button
													className={"grey-background"}
													data-hover="Close"
													data-active=""
													onClick={close}
												>
													<span>
														<i className="far fa-times-circle" />
													</span>
												</button>
											</div>
										</div>
										<div className="col-md-12">
											<FormLine
												label={"Entity name"}
												value={this.state.newEntityName}
												onChange={(v) => this.changeState("newEntityName", v)}
											/>
											<div className="right-buttons">
												<button
													onClick={() => this.addEntity(close)}
													disabled={this.state.newEntityName
														=== null || this.state.newEntityName.length < 3}
												>
													<i className="fas fa-plus" /> Add a new entity
												</button>
											</div>
										</div>
									</div>
								)}
							</Popup>
							<DialogEntityFilter
								trigger={
									<button className={"blue-background"} data-hover="Filter">
										<i className="fas fa-search" />
									</button>
								}
								filters={this.props.filters}
								applyFilter={this.applyFilter}
							/>
						</div>
					</div>
					<div className="col-md-12 EntityEntities-table">
						{this.props.entities ? (
							<EntitySortableTable
								columns={columns}
								data={this.props.entities.filter(
									(c) => this.props.match.params.id === undefined
									|| this.props.match.params.id === c.id.toString(),
								)}
								showBottomBar={true}
								defaultSortedHeaderId="Name"
							/>
						) : (
							<Loading height={500} />
						)}
					</div>
				</div>
			</div>
		);
	}
}
