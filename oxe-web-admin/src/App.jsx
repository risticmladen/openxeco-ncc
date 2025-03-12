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
import { postRequest } from "./utils/request.jsx";
import DialogMessage from "./component/dialog/DialogMessage.jsx";

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			user: null,
			logged: false,
			openMobileDialog: window
				.matchMedia("only screen and (max-width: 760px)")
				.matches,
		};
		this.logoutTimeout = null;
		this.setLogoutTimer = this.setLogoutTimer.bind(this);
	  this.connect = this.connect.bind(this);
		this.logout = this.logout.bind(this);		
	}

	// eslint-disable-next-line class-methods-use-this
	componentDidMount() {
		document.getElementById("favicon").href = getApiURL() + "public/get_public_image/favicon.ico";
	}

	// connect(user) {
	// 	this.setState({
	// 		user,
	// 		logged: true,
	// 	});
	// }

	componentWillUnmount() {
		if (this.logoutTimeout) {
			clearTimeout(this.logoutTimeout);
		}
	}

	connect(user) {
		this.setState({
			user,
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


	logout() {
		postRequest.call(this, "account/logout", null, () => {
			this.setState({
				user: null,
				logged: false,
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
				{this.state.logged
					? <BrowserRouter>
						<InsideApp
							user={this.state.user}
							logout={() => this.logout()}
						/>
					</BrowserRouter>
					: <Login
						connect={() => this.connect()}
						logout={() => this.logout()}
						cookies={this.props.cookies}
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
			</div>
		);
	}
}

export default withCookies(App);
