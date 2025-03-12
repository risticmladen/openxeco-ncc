import React from "react";
import "./App.css";
import "./css/medium-editor.css";
import { NotificationContainer, NotificationManager as nm } from "react-notifications";
import "react-notifications/lib/notifications.css";
import { BrowserRouter } from "react-router-dom";
import { withCookies } from "react-cookie";
import InsideApp from "./component/InsideApp.jsx";
import Login from "./component/Login.jsx";
import { getApiURL } from "./utils/env.jsx";
import { getRequest, postRequest } from "./utils/request.jsx";
import DialogMessage from "./component/dialog/DialogMessage.jsx";
import PageAddProfile from "./component/PageAddProfile.jsx";
// import Header from "./component/Header.jsx";
// import Footer from "./component/Footer.jsx";

class App extends React.Component {
	constructor(props) {
		super(props);

		this.connect = this.connect.bind(this);
		this.getSettings = this.getSettings.bind(this);
		this.setUserStatus = this.setUserStatus.bind(this);
		this.logoutTimeout = null;
		this.setLogoutTimer = this.setLogoutTimer.bind(this);
	
		this.state = {
			settings: null,
			logged: false,
			user_status: "",
			email: null,
			openMobileDialog: window
				.matchMedia("only screen and (max-width: 760px)").matches,
		};
	}

	componentDidMount() {
		document.getElementById("favicon").href = getApiURL() + "public/get_public_image/favicon.ico";
		this.getSettings();
	}

	componentWillUnmount() {
		if (this.logoutTimeout) {
			clearTimeout(this.logoutTimeout);
		}
	}

	getSettings() {
		getRequest.call(this, "public/get_public_settings", (data) => {
			const settings = {};

			data.forEach((d) => {
				settings[d.property] = d.value;
			});

			this.setState({
				settings,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	// connect(email) {
	// 	this.setState({
	// 		logged: true,
	// 		email,
	// 	});
	// }

	connect(email) {
		this.setState({
			email,
			logged: true,
		}, () => {
			this.setLogoutTimer();
		});
	}

	setLogoutTimer() {
		// Clear any existing timeout
		if (this.logoutTimeout) {
			clearTimeout(this.logoutTimeout);
		}

		// Set a new timeout to log out after 4 hours (14400000 milliseconds)
		this.logoutTimeout = setTimeout(() => {
			this.logout();
		}, 14400000); // 4 hours in milliseconds
	}

	setUserStatus(status) {
		this.setState({
			user_status: status,
		});
	}

	isLoggedIn() {
		return this.state.logged;
	}

	logout() {
		postRequest.call(this, "account/logout", null, () => {
			this.setState({
				email: null,
				logged: false,
				user_status: "",
			});
			if (this.logoutTimeout) {
				clearTimeout(this.logoutTimeout);
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<div id="App">
				{/* <ArticlesGrid articles={articles}></ArticlesGrid> */}
				{/* <Header></Header> */}
				{this.state.logged
					? <BrowserRouter>
						{this.state.user_status === "ACCEPTED"
							&& <InsideApp
								settings={this.state.settings}
								email={this.state.email}
								cookies={this.props.cookies}
								isLoggedIn={() => this.isLoggedIn()}
								logout={() => this.logout()}
							/>
						}

						{this.state.user_status === "REJECTED"
							&& <div className="notification-centre">
								Your request to create an account has not been accepted. We have
								sent you an email explaining the reasons.
							</div>
						}

						{this.state.user_status === "REQUESTED"
							&& <div className="notification-centre">
								We will be reviewing your registration. We will contact you shortly
								by email once the account is approved.
							</div>
						}

						{this.state.user_status === "VERIFIED"
							&& <PageAddProfile
								settings={this.state.settings}
								setUserStatus={this.setUserStatus}
								cookies={this.props.cookies}
							/>
						}
					</BrowserRouter>
					: <Login
						settings={this.state.settings}
						connect={this.connect}
						setUserStatus={this.setUserStatus}
						cookies={this.props.cookies}
						logout={() => this.logout()}
					/>
				}

				<NotificationContainer/>

				<DialogMessage
					trigger={""}
					text={<div>
						<h3>We have detected a small screen usage</h3>
						<p>
							This application is a content management platform.
							Hence, the functionalities and the user interfaces
							are not optimized for mobile terminals.
						</p>
						<p>
							For a better experience, please use a computer or a
							tablet with a large screen.
						</p>
					</div>}
					open={this.state.openMobileDialog}
				/>
				{/* <Footer></Footer> */}
			</div>
		);
	}
}

export default withCookies(App);
