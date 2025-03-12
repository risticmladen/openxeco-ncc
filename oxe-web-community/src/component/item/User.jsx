import React from "react";
import "./User.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../utils/request.jsx";
import UserGlobal from "./user/UserGlobal.jsx";
// import { getUrlParameter } from "../../utils/url.jsx";
import Item from "./Item.jsx";
// import DialogSendMail from "../dialog/DialogSendMail.jsx";

export default class User extends Item {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);
		this.confirmUserDeletion = this.confirmUserDeletion.bind(this);

		this.state = {
			isDetailOpened: false,
			user: { email: "" },
			subject: "Subject of the email",
			email_content: "Content of the email",
		};
	}

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	onClose() {
		this.setState({ isDetailOpened: false }, () => {
			if (this.props.onClose !== undefined) this.props.onClose();
		});
	}

	onOpen() {
		this.setState({ isDetailOpened: true }, () => {
			if (this.props.onOpen !== undefined) this.props.onOpen();
		});
	}

	confirmUserDeletion(close) {
		const params = {
			id: this.props.id,
		};

		postRequest.call(this, "user/delete_user", params, () => {
			nm.info("The user has been deleted");

			if (close) {
				close();
			}
			if (typeof this.props.afterDeletion !== "undefined") this.props.afterDeletion();
		}, (response) => {
			this.refreshUserData();
			nm.warning(response.statusText);
		}, (error) => {
			this.refreshUserData();
			nm.error(error.message);
		});
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"Item User"}>
						<i className="fas fa-user"/>
						<div className={"name"}>
						{this.props.company}
						{this.props.company && ", "}
						{this.props.name}
							{/* {this.props.email} */}s
							{this.props.primary
								&& <span> (primary)</span>
							}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick
				onClose={this.onClose}
				onOpen={this.onOpen}
			>
				{(close) => <div className="row">
					<div className="col-md-9">
						<h1 className="dashboard-header">
						<i className="fas fa-user" style={{ color: 'black' }}/> <span style={{ color: 'black' }}>{this.props.email}</span>
						</h1>
					</div>

					<div className="col-md-3">
						<div className={"right-buttons"}>
							<button
								className={"red-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
					</div>
					<div className="col-md-12">
						<UserGlobal
							key={this.props.id}
							id={this.props.id}
						/>
					</div>
				</div>
				}
			</Popup>
		);
	}
}
