import React from "react";
import "./Login.css";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "./button/FormLine.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import { validatePassword, validateOtp } from "../utils/re.jsx";
import Info from "./box/Info.jsx";
import { getUrlParameter } from "../utils/url.jsx";
import { getCookieOptions } from "../utils/env.jsx";
import Version from "./box/Version.jsx";

export default class Login extends React.Component {
	constructor(props) {
		super(props);

		this.getSettings = this.getSettings.bind(this);
		this.login = this.login.bind(this);
		this.requestReset = this.requestReset.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.verifyLogin = this.verifyLogin.bind(this);

		this.state = {
			settings: null,
			email: "",
			password: "",
			passwordConfirmation: "",
			view: getUrlParameter("action") === "reset_password" ? "reset" : "login",
			verifyLogin: false,
			user: null,
		};
	}

	// eslint-disable-next-line class-methods-use-this
	componentDidMount() {
		this.getSettings();

		// Get the token if the user reaches the app though a password reset URL

		if (getUrlParameter("action") === "reset_password") {
			this.props.cookies.set("access_token_cookie", getUrlParameter("token"), getCookieOptions());
		}

		// Log in the user if there is an existing cookie

		if (getUrlParameter("action") !== "reset_password") {
			getRequest.call(this, "private/get_my_user", (data) => {
				if (data.is_admin === 1) {
					this.props.connect(data);
				} else {
					this.props.logout();
					nm.warning("This user is not an admin");
				}
			}, (response2) => {
				if (response2.status !== 401 && response2.status !== 422) {
					nm.warning(response2.statusText);
				}
			}, (error) => {
				nm.error(error.message);
			});
		}

		// This function to notify if the password has been reset correctly

		Login.notifyForPasswordReset();
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

	static async notifyForPasswordReset() {
		if (getUrlParameter("reset_password") === "true") {
			await new Promise((r) => setTimeout(r, 500));
			window.history.replaceState({}, document.title, "/");
			nm.info("The password has been reset with success");
			nm.emitChange();
		}
	}

	login() {
		const params = {
			email: this.state.email,
			password: this.state.password,
		};

		postRequest.call(this, "account/login", params, () => {
			nm.info("Please check your email for the One Time Pin");
			this.setState({ verifyLogin: true });
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	verifyLogin() {
		if (!validateOtp(this.state.otp)) {
			nm.warning("This one time pin is invalid.");
			return;
		}
		const params = {
			email: this.state.email,
			token: this.state.otp,
		};
		postRequest.call(this, "account/verify_login", params, () => {
			// this.props.cookies.set("access_token_cookie", response.access_token, getCookieOptions());
			getRequest.call(this, "private/get_my_user", (data) => {
				if (data.is_admin === 1) {
					this.props.connect(data);
				} else {
					this.props.logout();
					nm.warning("This user is not an admin");
				}
			}, (response2) => {
				nm.warning(response2.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	requestReset() {
		const params = {
			email: this.state.email,
		};

		postRequest.call(this, "account/forgot_password", params, () => {
			nm.info("If that email address is in our database, we will send you an email to reset your password");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	resetPassword() {
		const params = {
			new_password: this.state.password,
		};

		postRequest.call(this, "account/reset_password", params, () => {
			this.props.cookies.remove("access_token_cookie", {});
			document.location.href = "/?reset_password=true";
		}, (response) => {
			console.log(response);
			nm.warning("LINK IS EXPIRED");
		}, (error) => {
			nm.error(error.message);
		});
	}

	backToLogin() {
		this.props.cookies.remove("access_token_cookie", {});
		this.setState({ view: "login" });
		window.history.pushState({ path: "/login" }, "", "/login");
	}

	onKeyDown(event) {
		if (event.key === "Enter" || event.code === "NumpadEnter") {
			if (this.state.view === "login" && !this.state.verifyLogin) this.login();
			if (this.state.view === "login" && this.state.verifyLogin) this.verifyLogin();
			if (this.state.view === "forgot") this.requestReset();
			if (this.state.view === "reset") this.resetPassword();
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="Login" className="background-img">
				{/* <Version/> */}

				<div id="Login-area">

				</div>
				<div id="Login-box" className={"fade-in"}>
					<div id="Login-inner-box">
						{this.state.view === "login"
							&& <div>
								{this.state.verifyLogin === false
									&& <>
										<div className="Login-title">
											<h1>
												{this.state.settings !== null
													&& this.state.settings.ADMIN_PLATFORM_NAME !== undefined
													? "Welcome to " + this.state.settings.ADMIN_PLATFORM_NAME
													: "Welcome"}
												<div className={"Login-title-small"}>
													{this.state.settings !== null
														&& this.state.settings.PROJECT_NAME !== undefined
														? "Administration platform of " + this.state.settings.PROJECT_NAME
														: "Administration platform"}
												</div>
											</h1>
										</div>
										<FormLine
											label="Email"
											fullWidth={true}
											value={this.state.email}
											onChange={(v) => this.changeState("email", v)}
											autofocus={true}
											onKeyDown={this.onKeyDown}
										/>
										<FormLine
											label="Password"
											type={"password"}
											fullWidth={true}
											value={this.state.password}
											onChange={(v) => this.changeState("password", v)}
											onKeyDown={this.onKeyDown}
										/>
										<div className="bottom-right-buttons">
											<button
												className="gold-button"
												onClick={this.login}
											>
												Login
											</button>
										</div>
										<div className="bottom-left-buttons">
											<button
												className="gold-letters"
												onClick={() => this.changeState("view", "forgot")}
											>
												I forgot my password
											</button>
										</div>
									</>
								}
								{this.state.verifyLogin === true
									&& <div className="col-md-12">
										<div className="Login-title">
											<h1>Verify Login</h1>
										</div>
										<FormLine
											label="Please enter the One Time Pin you received via email"
											fullWidth={true}
											value={this.state.otp}
											onChange={(v) => this.changeState("otp", v)}
											autofocus={true}
											onKeyDown={this.onKeyDown}
											format={validateOtp}
										/>

										<div>
											<div className="right-buttons">
												<button
													className="gold-button"
													onClick={this.verifyLogin}
												>
													Submit
												</button>
											</div>
											<div className="left-buttons">
												<button
													className="gold-letters"
													onClick={this.login}
												>
													Resend Code
												</button>
											</div>
											<div className="left-buttons">
												<button
													className="gold-letters"
													onClick={() => this.changeState("verifyLogin", false)}
												>
													Back to login
												</button>
											</div>
										</div>
									</div>
								}
							</div>
						}

						{this.state.view === "forgot"
							&& <div>
								<div className="Login-title">
									<h1>
										Forgot password
									</h1>
								</div>
								<FormLine
									label="Email"
									fullWidth={true}
									value={this.state.email}
									onChange={(v) => this.changeState("email", v)}
									autofocus={true}
									onKeyDown={this.onKeyDown}
								/>
								<div className="bottom-right-buttons">
									<button
										className="gold-button"
										onClick={this.requestReset}
									>
										Reset password
									</button>
								</div>
								<div className="bottom-left-buttons">
									<button
										className="gold-letters"
										onClick={() => this.backToLogin()}
									>
										Back to login
									</button>
								</div>
							</div>
						}

						{this.state.view === "reset"
							&& <div>
								<div className="Login-title">
									<h1>
										Reset password
									</h1>
								</div>
								<Info
									content={
										<div>
											The password must:<br/>
											<li>contain at least 1 lowercase alphabetical character</li>
											<li>contain at least 1 uppercase alphabetical character</li>
											<li>contain at least 1 numeric character</li>
											<li>contain at least 1 special character being !@#$%^&*</li>
											<li>be between 10 and 30 characters long</li>
											<li>not contain any part of a name, surname or both</li>
										</div>
									}
								/>
								<FormLine
									label="New password"
									type={"password"}
									fullWidth={true}
									value={this.state.password}
									onChange={(v) => this.changeState("password", v)}
									format={validatePassword}
									onKeyDown={this.onKeyDown}
									autofocus={true}
								/>
								<FormLine
									label="New password confirmation"
									type={"password"}
									fullWidth={true}
									value={this.state.passwordConfirmation}
									onChange={(v) => this.changeState("passwordConfirmation", v)}
									format={validatePassword}
									onKeyDown={this.onKeyDown}
								/>
								<div className="bottom-right-buttons">
									<button
										className="gold-button"
										onClick={this.resetPassword}
										disabled={!validatePassword(this.state.password)
									|| !validatePassword(this.state.passwordConfirmation)
									|| this.state.password !== this.state.passwordConfirmation
										}
									>
										Change password
									</button>
								</div>
								<div className="bottom-left-buttons">
									<button
										className="gold-letters"
										onClick={() => this.backToLogin()}
									>
										Back to login
									</button>
								</div>
							</div>
						}
					</div>
				</div>
			</div>
		);
	}
}
