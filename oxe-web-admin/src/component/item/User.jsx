import React from "react";
import "./User.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest, getRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Tab from "../tab/Tab.jsx";
import UserGlobal from "./user/UserGlobal.jsx";
import UserEntity from "./user/UserEntity.jsx";
import UserNote from "./user/UserNote.jsx";
import { getUrlParameter } from "../../utils/url.jsx";

import Item from "./Item.jsx";
import DialogSendMail from "../dialog/DialogSendMail.jsx";
import Loading from "../box/Loading.jsx";

export default class User extends Item {
	constructor(props) {
		super(props);
		
		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);
		this.confirmUserDeletion = this.confirmUserDeletion.bind(this);
		this.deleteUser = this.deleteUser.bind(this);
		this.getCheckEntityUsers = this.getCheckEntityUsers.bind(this);
		this.fetchCheckUsers = this.fetchCheckUsers.bind(this);

		this.state = {
			isDetailOpened: false,
			selectedMenu: null,
			tabs: [
				"global",
				"entity",
				"note",
			],
			user: { email: "" , company: props.company, name: props.name },
			currentUser: null,
			subject: "Subject of the email",
			email_content: "Content of the email",
		};
	}

	componentDidMount() {
		if (getUrlParameter("item_tab") !== null && this.state.tabs.indexOf(getUrlParameter("item_tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("item_tab") });
		}
		this.getCurrentUserData();
	}

	componentDidUpdate() {
		if (this.state.selectedMenu !== getUrlParameter("item_tab")
			&& this.state.tabs.indexOf(getUrlParameter("item_tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("item_tab") });
		}
	}

	getCurrentUserData() {
		getRequest.call(this, "user/get_user/" + this.props.id, (userData) => {
			/* eslint-disable new-cap */
			this.setState({
				currentUser: userData,
				
			});
			
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
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

	getCheckEntityUsers(currentUserId, close) {
		getRequest.call(this, "/user/get_user_entities/" + currentUserId, (data) => {
			
			const userEntities = data;
			if(userEntities.length === 0) {
				this.confirmUserDeletion(close);
			}
			
			userEntities.forEach((entity) => {
			const entityId = entity.entity_id;
		
				getRequest.call(this, "entity/get_entity_users/" + entityId, (data) => {
					const entityUsers = data;
					const otherUsersExist = entityUsers.some(user => user.id !== currentUserId);

					console.log('otherUsersExist?: ', otherUsersExist);

					if(!otherUsersExist) {
						nm.warning('You are the only representative of your organization. Please appoint some other member prior account deleting.');
						
					} else {
						// delete user
						this.confirmUserDeletion(close);
					}
				
				}, (response) => {
					nm.warning(response.statusText);
				}, (error) => {
					nm.error(error.message);
				});
			});
		
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

			
			
	}

 	fetchCheckUsers(currentUserId, close){

		getRequest.call(this, "user/get_users", (data) => {
			const users = data.items;
			const isOtherAdminsExist = users.some(user => user.is_admin === 1 && user.id !== currentUserId);
		
			if(!isOtherAdminsExist) {
				nm.warning('You need to appoint another forum admin prior deleting your account.');
				
			} else {
				this.getCheckEntityUsers(currentUserId, close);
			}

		}, (response) => {
			nm.warning(response.statusText);
			
		}, (error) => {
			nm.error(error.message);
		});
	}

	deleteUser(close) {
		const isUserAdmin = this.state.currentUser.is_admin === 1;
		const currentUserId = this.props.id;
		
		if(isUserAdmin){
			//check there is another forum admin then delete if there is any
			this.fetchCheckUsers(currentUserId, close );
		
		} else {
			//check if entities user represents has another member prior deleting
			this.getCheckEntityUsers(currentUserId, close);
		}
		
	}

	render() {
		//console.log('User.jsx props: ', this.props); // Log the users prop
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
							{/* {this.props.email} */}
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
						<h1>
							<i className="fas fa-user"/> 
							{/* {this.props.company} */}
							
							{this.props.email}
						</h1>
						
					</div>

					<div className="col-md-3">
						<div className={"right-buttons"}>
							<DialogConfirmation
								text={"Are you sure you want to delete this user?"}
								trigger={
									<button
										className={"red-background"}
										onClick={() => this.deleteUser()}>
										<i className="fas fa-trash-alt"/>
									</button>
								}
								// afterConfirmation={() => this.confirmUserDeletion(close)}
								afterConfirmation={() => this.deleteUser(close)}
							
							/>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
					</div>
					<div className="col-md-12 row-spaced">
						{this.state.user ? (
							<DialogSendMail
								trigger={
									<button
										className={"blue-background"}
										id="Request-send-mail-button">
										<i className="fas fa-envelope-open-text"/> Prepare email...
									</button>
								}
								email={this.props.email}
								subject={this.state.subject}
								content={this.state.email_content}
							/>
						) : (
							<Loading height={50} />
						)}
					</div>

					<div className="col-md-12">
						<Tab
							labels={["Global", "Entity", "Notes"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<UserGlobal
									key={this.props.id}
									id={this.props.id}
								/>,
								<UserEntity
									key={this.props.id}
									id={this.props.id}
									name={this.props.name}
								/>,
								<UserNote
									key={"note"}
									id={this.props.id}
									user={this.props.user}
								/>,
							]}
						/>
					</div>
				</div>
				}
			</Popup>
		);
	}
}
