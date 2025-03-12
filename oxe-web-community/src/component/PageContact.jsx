import React from "react";
import "./PageContact.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../utils/request.jsx";
import FormLine from "./form/FormLine.jsx";
import Loading from "./box/Loading.jsx";
import Message from "./box/Message.jsx";
import Request from "./item/Request.jsx";

export default class PageContact extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.submitRequest = this.submitRequest.bind(this);
		this.afterDelete = this.afterDelete.bind(this);
		this.changeState = this.changeState.bind(this);
		this.filterRequests = this.filterRequests.bind(this);

		this.state = {
			text: "",
			requests: null,
			filteredRequests: null,
			statusFilter: "ALL",
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			requests: null,
			filteredRequests: null,
		});

		getRequest.call(this, "private/get_my_requests?global_only=true", (data) => {
			this.setState({
				requests: data,
				filteredRequests: data,
			}, this.filterRequests);
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitRequest() {
		const params = {
			request: this.state.text,
		};

		postRequest.call(this, "private/add_request", params, () => {
			this.refresh();
			this.props.getNotifications();
			this.setState({
				text: "", // Clear the textbox by setting text to an empty string
			});
			nm.info("The request has been submitted");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	afterDelete() {
		this.refresh();
		this.props.getNotifications();
	}

	changeState(field, value) {
		this.setState({ [field]: value }, this.filterRequests);
	}

	filterRequests() {
		const { requests, statusFilter } = this.state;
		let filteredRequests = [...requests];

		if (statusFilter !== "ALL") {
			filteredRequests = filteredRequests.filter(r => r.status === statusFilter);
		}

		this.setState({ filteredRequests });
	}

	render() {
		return (
			<div id={"PageContact"} className={"page max-sized-page"}>
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						 <h1 className="dashboard-header">Contact us</h1>
					</div>

					<div className="col-md-12 message-container">
						<h2>Send us a message</h2>

						<FormLine
							label={"Message"}
							type={"textarea"}
							fullWidth={true}
							value={this.state.text}
							onChange={(v) => this.setState({ text: v })}
						/>

						<div className="right-buttons">
							<button
								className="submit-button"
								onClick={this.submitRequest}
								disabled={this.state.text === null || this.state.text.length === 0}>
								<i className="fas fa-paper-plane"/> Submit message
							</button>
						</div>
					</div>
				</div>

				<div className={"row row-spaced current-messages-container"}>
					<div className="col-md-9">
						<h2>Your current messages</h2>
					</div>

					<div className="col-md-3 top-title-menu">
						<button
							onClick={this.refresh}>
							<i className="fas fa-redo-alt"/>
						</button>
					</div>

					<div className="col-md-3">
						<select
							value={this.state.statusFilter}
							onChange={(e) => this.changeState("statusFilter", e.target.value)}
						>
							<option value="ALL">All Status</option>
							<option value="NEW">New</option>
							<option value="IN PROCESS">In Process</option>
						</select>
					</div>

					{this.state.filteredRequests !== null && this.state.filteredRequests.length === 0
						&& <div className="col-md-12">
							<Message
								text={"No message found"}
								height={150}
							/>
						</div>
					}
					{this.state.filteredRequests !== null && this.state.filteredRequests.length > 0
						&& this.state.filteredRequests.map((r) => (
							<div className="col-md-12" key={r.id}>
								<Request
									info={r}
									afterDelete={this.afterDelete}
								/>
							</div>
						))
					}
					{this.state.filteredRequests === null
						&& <div className="col-md-12">
							<Loading
								height={150}
							/>
						</div>
					}
				</div>

				<div className={"row row-spaced"}>
					{this.props.settings !== null && this.props.settings.EMAIL_ADDRESS !== undefined
						&& <div className="col-lg-6 col-xl-4">
							<h2>Email</h2>

							<Message
								text={this.props.settings.EMAIL_ADDRESS}
								height={150}
							/>
						</div>
					}

					{this.props.settings !== null && this.props.settings.POSTAL_ADDRESS !== undefined
						&& <div className="col-lg-6 col-xl-4">
							<h2>Postal address</h2>

							<Message
								text={this.props.settings.POSTAL_ADDRESS}
								height={150}
							/>
						</div>
					}

					{this.props.settings !== null && this.props.settings.PHONE_NUMBER !== undefined
						&& <div className="col-lg-6 col-xl-4">
							<h2>Phone</h2>

							<Message
								text={this.props.settings.PHONE_NUMBER}
								height={150}
							/>
						</div>
					}
				</div>
			</div>
		);
	}
}
