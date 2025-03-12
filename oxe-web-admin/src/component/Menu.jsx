import React from "react";
import "./Menu.css";
import { NotificationManager as nm } from "react-notifications";
import SideNav, {
	Toggle, Nav, NavItem, NavIcon, NavText,
} from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import { Link } from "react-router-dom";
import { getRequest } from "../utils/request.jsx";
import { getSettingValue } from "../utils/setting.jsx";

export default class Menu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			notifications: null,
		};
	}

	componentDidMount() {
		this.getNotifications();
	}

	componentDidUpdate(prevProps) {
		if (this.props.selectedMenu !== prevProps.selectedMenu
			&& this.props.selectedMenu === "task") {
			this.getNotifications();
		}
	}

	getNotifications() {
		this.setState({ notifications: null });

		getRequest.call(this, "notification/get_notifications", (data) => {
			this.setState({
				notifications: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getTaskNotificationBlock() {
		if (this.state.notifications === null
			|| this.state.notifications.new_requests === undefined
			|| this.state.notifications.data_control === undefined
			|| this.state.notifications.new_requests + this.state.notifications.data_control === 0) {
			return "";
		}

		return <Link to="/task">
			<div className={"Menu-notification"}>
				{this.state.notifications.new_requests + this.state.notifications.data_control}
			</div>
		</Link>;
	}

	getFormNotificationBlock() {
		if (this.state.notifications === null
			|| this.state.notifications.form_responses === undefined
			|| this.state.notifications.form_responses === 0) {
			return "";
		}

		return <Link to="/form">
			<div className={"Menu-notification"}>
				{this.state.notifications.form_responses}
			</div>
		</Link>;
	}

	render() {
		return (
			<SideNav
				className={"fade-in"}
				onSelect={(selected) => {
					if (selected === "disconnect") {
						this.props.logout();
					} else {
						this.props.changeMenu(selected);
					}
				}}
			>
				<Toggle />
				<Nav defaultSelected={this.props.selectedMenu}>
					<NavItem
						eventKey=""
						active={!this.props.selectedMenu}
						onClick={() => this.props.history.push("/")}>
						<NavIcon>
							<i className="fa fa-tachometer-alt" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Dashboard
						</NavText>
					</NavItem>
					<div className="Menu-divider"/>
					<NavItem
						eventKey="entities"
						active={this.props.selectedMenu === "entities"}
						onClick={() => this.props.history.push("/entities")}>
						<NavIcon>
							<i className="fas fa-shapes" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Entities
						</NavText>
					</NavItem>
					<NavItem
						eventKey="articles"
						active={this.props.selectedMenu === "articles"}
						onClick={() => this.props.history.push("/articles")}>
						<NavIcon>
							<i className="fas fa-feather-alt" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Articles
						</NavText>
					</NavItem>
					<NavItem
						eventKey="taxonomy"
						active={this.props.selectedMenu === "taxonomy"}
						onClick={() => this.props.history.push("/taxonomy")}>
						<NavIcon>
							<i className="fas fa-project-diagram" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Taxonomies
						</NavText>
					</NavItem>
					{getSettingValue(this.props.settings, "SHOW_NETWORK_PAGE") === "TRUE"
						&& <NavItem
							eventKey="network"
							active={this.props.selectedMenu === "network"}
							onClick={() => this.props.history.push("/network")}>
							<NavIcon>
								<i className="fas fa-globe-europe" style={{ fontSize: "1.75em" }} />
							</NavIcon>
							<NavText>
								Network
							</NavText>
						</NavItem>
					}
					<div className="Menu-divider"/>
					{getSettingValue(this.props.settings, "SHOW_CAMPAIGN_PAGE") === "TRUE"
						&& <NavItem
							eventKey="campaign"
							active={this.props.selectedMenu === "campaign"}
							onClick={() => this.props.history.push("/campaign")}>
							<NavIcon>
								<i className="fas fa-mail-bulk" style={{ fontSize: "1.75em" }} />
							</NavIcon>
							<NavText>
								Email Campaigns
							</NavText>
						</NavItem>
					}
					{getSettingValue(this.props.settings, "SHOW_FORM_PAGE") === "TRUE"
						&& <NavItem
							eventKey="form"
							active={this.props.selectedMenu === "form"}
							onClick={() => this.props.history.push("/form")}>
							<NavIcon>
								<i className="fas fa-poll-h" style={{ fontSize: "1.75em" }} />
							</NavIcon>
							<NavText>
								Forms
							</NavText>
							{this.getFormNotificationBlock()}
						</NavItem>
					}
					<NavItem
						eventKey="media"
						active={this.props.selectedMenu === "media"}
						onClick={() => this.props.history.push("/media")}>
						<NavIcon>
							<i className="fas fa-photo-video" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Images & Documents
						</NavText>
					</NavItem>
					<div className="Menu-divider"/>
					<NavItem
						eventKey="/forum"
						active={this.props.selectedMenu === "forum"}
						onClick={() => this.props.history.push("/forum")}>
						<NavIcon>
							<i
								className={"fas fa-comments "
									+ (this.props.selectedMenu !== "/forum"
									&& "Menu-highlight")}
								style={{ fontSize: "1.75em" }}
							/>
						</NavIcon>
						<NavText>
							Forum
						</NavText>
					</NavItem>
					<NavItem
						eventKey="task"
						active={this.props.selectedMenu === "task"}
						onClick={() => this.props.history.push("/task")}>
						<NavIcon>
							<i className="fas fa-tasks" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Tasks
						</NavText>
						{this.getTaskNotificationBlock()}
					</NavItem>
					<NavItem
						eventKey="users"
						active={this.props.selectedMenu === "users"}
						onClick={() => this.props.history.push("/users")}>
						<NavIcon>
							<i className="fas fa-user-friends" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Groups & Users
						</NavText>
					</NavItem>
					<NavItem
						eventKey="activities"
						active={this.props.selectedMenu === "activities"}
						onClick={() => this.props.history.push("/activities")}>
						<NavIcon>
							<i className="fas fa-calendar" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Schedule
						</NavText>
					</NavItem>
					<NavItem
						eventKey="settings"
						active={this.props.selectedMenu === "settings"}
						onClick={() => this.props.history.push("/settings")}>
						<NavIcon>
							<i className="fas fa-cogs" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Settings
						</NavText>
					</NavItem>
					<div className="Menu-divider" />
					<NavItem
						eventKey="audit"
						active={this.props.selectedMenu === "audit"}
						onClick={() => this.props.history.push("/audit")}>
						<NavIcon>
							<i className="fas fa-file-alt" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Audit Logs
						</NavText>
					</NavItem>
					<NavItem
						eventKey="user_requests"
						active={this.props.selectedMenu === "user_requests"}
						onClick={() => this.props.history.push("/user_requests")}>
						<NavIcon>
							<i className="fas fa-file-alt" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							User Requests
						</NavText>
					</NavItem>
					<NavItem
						eventKey="profile"
						active={this.props.selectedMenu === "profile"}
						className="Menu-profile-nav-item"
						onClick={() => this.props.history.push("/profile")}>
						<NavIcon>
							<i className="fas fa-user-circle" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Profile
						</NavText>
					</NavItem>
					<NavItem
						className="Menu-log-out-nav-item"
						eventKey="disconnect">
						<NavIcon>
							<i className="fas fa-door-open" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Log out
						</NavText>
					</NavItem>
				</Nav>
			</SideNav>
		);
	}
}
