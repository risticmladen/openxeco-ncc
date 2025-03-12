import React from "react";
import "./Login.css";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "./form/FormLine.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import { validatePassword, validateEmail, validateOtp } from "../utils/re.jsx";
import Info from "./box/Info.jsx";
import { getUrlParameter } from "../utils/url.jsx";
import { getCookieOptions } from "../utils/env.jsx";
// import { getCookieOptions, getGlobalAppURL, getApiURL } from "../utils/env.jsx";
import Version from "./box/Version.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default class Login extends React.Component {
	constructor(props) {
		super(props);

		this.login = this.login.bind(this);
		this.createAccount = this.createAccount.bind(this);
		this.requestReset = this.requestReset.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.verifyLogin = this.verifyLogin.bind(this);

		let view = null;

		switch (getUrlParameter("action")) {
		case "reset_password":
			view = "reset";
			break;
		case "create_account":
			view = "create";
			break;
		case "verify_account":
			view = "verify";
			break;
		default:
			view = "login";
		}

		this.state = {
			email: "",
			createAccountEmail: "",
			password: "",
			passwordConfirmation: "",
			view,
			partOfEntity: false,
			entity: "",
			entityDepartment: "",
			otp: "",
			checkedVerified: false,
			verified: false,
			verifyLogin: false,
		};
	}

	// eslint-disable-next-line class-methods-use-this
	componentDidMount() {
		// Get the token if the user reaches the app though a password reset URL

		if (getUrlParameter("action") === "reset_password") {
			this.props.cookies.set("access_token_cookie", getUrlParameter("token"), getCookieOptions());
		}

		// Get the token if the user reaches the app though acount verification URL

		if (getUrlParameter("action") === "verify_account") {
			getRequest.call(this, "account/verify_account/" + getUrlParameter("token"), () => {
				this.setState({
					checkedVerified: true,
					verified: true,
				});
			}, (response2) => {
				nm.warning(response2.statusText);
				this.changeState("view", "login");
			}, (error) => {
				nm.error(error.message);
				this.changeState("view", "login");
			});
		}

		// Log in the user if there is an existing cookie
		if (getUrlParameter("action") !== "reset_password" && getUrlParameter("action") !== "verify_account") {
			this.fetchUser();
		}

		// This function to notify if the password has been reset correctly
		Login.notifyForPasswordReset();
	}

	fetchUser() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.props.connect(data.email);
			this.props.setUserStatus(data.status);
		}, (response2) => {
			if (response2.status !== 401 && response2.status !== 422) {
				nm.warning(response2.statusText);
			}
		}, (error) => {
			nm.error(error.message);
		});
	}

	componentDidUpdate(_, prevState) {
		if (prevState.partOfEntity && !this.state.partOfEntity) {
			this.setState({
				entity: "",
				entityDepartment: null,
			});
		}
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
			this.fetchUser();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	createAccount() {
		if (
			!validateEmail(this.state.createAccountEmail)
			|| !validatePassword(this.state.password)
		) {
			nm.warning("Email address or password is invalid");
			return;
		}

		const params = {
			email: this.state.createAccountEmail,
			password: this.state.password,
			entity: this.state.entity && this.state.entity.length > 0 ? this.state.entity : null,
			department: this.state.entityDepartment ? this.state.entityDepartment : null,
		};

		postRequest.call(this, "account/create_account", params, () => {
			nm.info("An email has been sent to your mailbox with a verification link");
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
		if (this.state.password !== this.state.passwordConfirmation
			|| validatePassword(this.state.password) === false
			|| validatePassword(this.state.passwordConfirmation) === false
		) {
			return;
		}
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
			if (this.state.view === "create") this.createAccount();
			if (this.state.view === "forgot") this.requestReset();
			if (this.state.view === "reset") this.resetPassword();
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="Login">
				{/* <Version /> */}
				<Header />
				{/* <div className="top-right-buttons">
					<div>
						<a
							className="link-button"
							href={getGlobalAppURL()}
						>
							Go to&nbsp;
							{this.props.settings !== null && this.props.settings.PROJECT_NAME !== undefined
								? this.props.settings.PROJECT_NAME
								: "the"
							}
							&nbsp;portal <i className="fa fa-shield-alt"/>
						</a>
					</div>

					{this.props.settings !== null && this.props.settings.EMAIL_ADDRESS !== undefined
						&& <div>
							<a
								className="link-button"
								href={"mailto:" + this.props.settings.EMAIL_ADDRESS}
							>
								Contact via email <i className="fas fa-envelope-open-text"/>
							</a>
						</div>
					}
				</div> */}
				<div className="login-box-container">
					<div id="Login-box" className={"fade-in"}>
						<div id="Login-inner-box">

							{this.state.view === "login"
								&& <div className="row">

									{this.state.verifyLogin === false
										&& <>
											<div className="col-md-12">
												<div className="Login-title">
													{this.props.settings !== null
														&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
														? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
														: "NCC SPACE"
													}

													{this.props.settings !== null
														&& this.props.settings.PROJECT_NAME !== undefined
														&& <div className={"Login-title-small"}>
															{this.props.settings.PROJECT_NAME} private space
														</div>
													}
												</div>
											</div>
											<div className="col-md-12">
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

												<div>
													<div className="right-buttons">
														<button
															className="gold-button"
															onClick={this.login}
														>
															Login
														</button>
													</div>
													<div className="left-buttons">
														<button
															className="gold-letters"
															onClick={() => this.changeState("view", "create")}
														>
															I want to create an account
														</button>
													</div>
													<div className="left-buttons">
														<button
															className="gold-letters"
															onClick={() => this.changeState("view", "forgot")}
														>
															I forgot my password
														</button>
													</div>
												</div>
											</div>
										</>
									}

									{this.state.verifyLogin === true
										&& <div className="col-md-12">
											<div className="Login-title">
												Verify Login
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

							{this.state.view === "create"
								&& <div className="row">
									<div className="col-md-12">
										<div className="Login-title">
											{this.props.settings !== null
												&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
												? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
												: "NCC SPACE"
											}

											{this.props.settings !== null
												&& this.props.settings.PROJECT_NAME !== undefined
												&& <div className={"Login-title-small"}>
													{this.props.settings.PROJECT_NAME} private space
												</div>
											}
										</div>
									</div>

									<div className="col-md-12">
										<FormLine
											label="Email"
											fullWidth={true}
											value={this.state.createAccountEmail}
											onChange={(v) => this.changeState("createAccountEmail", v)}
											autofocus={true}
											onKeyDown={this.onKeyDown}
											format={validateEmail}
										/>
										<FormLine
											label="Password"
											fullWidth={true}
											type={"password"}
											value={this.state.password}
											onChange={(v) => this.changeState("password", v)}
											autofocus={true}
											onKeyDown={this.onKeyDown}
											format={validatePassword}
										/>
										<br />
										{!validatePassword(this.state.password)
											&& <>
												<div className="Password-prompt">
													The password must:<br />
													<li>contain at least 1 lowercase alphabetical character</li>
													<li>contain at least 1 uppercase alphabetical character</li>
													<li>contain at least 1 numeric character</li>
													<li>contain at least 1 special character being !@#$%^&*</li>
													<li>be between 10 and 30 characters long</li>
													<li>not contain any part of a name, surname or both</li>
												</div>
												<br />
											</>
										}
										<div className="right-buttons">
											<button
												className="gold-button"
												onClick={this.createAccount}
												disabled={
													!validateEmail(this.state.createAccountEmail)
													|| !validatePassword(this.state.password)
													|| (this.state.partOfEntity
														&& (
															!this.state.entity
															|| this.state.entity.length === 0
															|| !this.state.entityDepartment
														)
													)
												}
											>
												Create account
											</button>
										</div>
										<div className="left-buttons">
											<button
												className="gold-letters"
												onClick={() => this.backToLogin()}
											>
												Back to login
											</button>
										</div>
									</div>
								</div>
							}

							{this.state.view === "forgot"
								&& <div>
									<div className="Login-title">
										Forgot password
									</div>

									<FormLine
										label="Email"
										fullWidth={true}
										value={this.state.email}
										onChange={(v) => this.changeState("email", v)}
										autofocus={true}
										onKeyDown={this.onKeyDown}
									/>

									<div className="right-buttons">
										<button
											className="gold-button"
											onClick={this.requestReset}
										>
											Reset password
										</button>
									</div>
									<div className="left-buttons">
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
										Reset password
									</div>

									<Info
										content={
											<div>
												The password must:<br />
												<li>contain at least 1 lowercase alphabetical character</li>
												<li>contain at least 1 uppercase alphabetical character</li>
												<li>contain at least 1 numeric character</li>
												<li>contain at least 1 special character being !@#$%^&*</li>
												<li>be between 8 and 30 characters long</li>
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
										format={() => this.state.password === this.state.passwordConfirmation}
										onKeyDown={this.onKeyDown}
									/>
									{this.state.password !== this.state.passwordConfirmation
										&& this.state.passwordConfirmation !== ""
										&& <div className="validation-error">
											Passwords do not match
										</div>
									}
									<div className="right-buttons">
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
									<div className="left-buttons">
										<button
											className="gold-letters"
											onClick={() => this.backToLogin()}
										>
											Back to login
										</button>
									</div>
								</div>
							}

							{this.state.view === "verify"
								&& <div className="row">

									<div className="col-md-12">
										<div className="Login-title">
											{this.props.settings !== null
												&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
												? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
												: "NCC SPACE"
											}

											{this.props.settings !== null
												&& this.props.settings.PROJECT_NAME !== undefined
												&& <div className={"Login-title-small"}>
													{this.props.settings.PROJECT_NAME} private space
												</div>
											}
										</div>
									</div>

									{this.state.checkedVerified === false
										&& <div className="col-md-12">
											<div className="left-buttons pl-2">
												Verifying Account...
											</div>
										</div>
									}

									{this.state.verified === true
										&& <div className="col-md-12">
											<div className="left-buttons pl-2">
												Account Verified Successfully!
												<br />
												<button
													className="gold-letters"
													onClick={() => window.location.replace("/")}
												>
													Back to login
												</button>
											</div>
										</div>
									}

									{this.state.checkedVerified === true && this.state.verified === false
										&& <div className="col-md-12">
											<div className="left-buttons pl-2">
												Account Verification Failed!
												<button
													className="gold-letters"
													onClick={() => window.location.replace("/")}
												>
													Back to login
												</button>
											</div>
										</div>
									}
								</div>
							}

							{this.state.view === "add_profile"
								&& <div className="row">
									Add Profile
								</div>
							}
						</div>
					</div>
				</div>
				<Footer />
			</div>
		);
	}
}

// import React from "react";
// import "./Login.css";
// import { NotificationManager as nm } from "react-notifications";
// import FormLine from "./form/FormLine.jsx";
// import { getRequest, postRequest } from "../utils/request.jsx";
// import { validatePassword, validateEmail, validateOtp } from "../utils/re.jsx";
// import Info from "./box/Info.jsx";
// import { getUrlParameter } from "../utils/url.jsx";
// import { getCookieOptions } from "../utils/env.jsx";
// import Version from "./box/Version.jsx";
// import Header from "./Header.jsx";
// import Footer from "./Footer.jsx";

// export default class Login extends React.Component {
//     constructor(props) {
//         super(props);

//         this.login = this.login.bind(this);
//         this.createAccount = this.createAccount.bind(this);
//         this.requestReset = this.requestReset.bind(this);
//         this.resetPassword = this.resetPassword.bind(this);
//         this.onKeyDown = this.onKeyDown.bind(this);
//         this.verifyLogin = this.verifyLogin.bind(this);
//         this.fetchUser = this.fetchUser.bind(this); // Added fetchUser binding

//         let view = null;

//         switch (getUrlParameter("action")) {
//             case "reset_password":
//                 view = "reset";
//                 break;
//             case "create_account":
//                 view = "create";
//                 break;
//             case "verify_account":
//                 view = "verify";
//                 break;
//             default:
//                 view = "login";
//         }

//         this.state = {
//             email: "",
//             createAccountEmail: "",
//             password: "",
//             passwordConfirmation: "",
//             view,
//             partOfEntity: false,
//             entity: "",
//             entityDepartment: "",
//             otp: "",
//             checkedVerified: false,
//             verified: false,
//             verifyLogin: false,
//         };
//     }

//     componentDidMount() {
//         // Get the token if the user reaches the app through a password reset URL
//         if (getUrlParameter("action") === "reset_password") {
//             this.props.cookies.set("access_token_cookie", getUrlParameter("token"), getCookieOptions());
//         }

//         // Get the token if the user reaches the app through account verification URL
//         if (getUrlParameter("action") === "verify_account") {
//             getRequest.call(this, "account/verify_account/" + getUrlParameter("token"), () => {
//                 this.setState({
//                     checkedVerified: true,
//                     verified: true,
//                 });
//             }, (response2) => {
//                 nm.warning(response2.statusText);
//                 this.changeState("view", "login");
//             }, (error) => {
//                 nm.error(error.message);
//                 this.changeState("view", "login");
//             });
//         }

//         // Notify if the password has been reset correctly
//         Login.notifyForPasswordReset();
//     }

//     fetchUser() {
//         getRequest.call(this, "private/get_my_user", (data) => {
//             this.props.connect(data.email);
//             this.props.setUserStatus(data.status);
//         }, (response2) => {
//             if (response2.status !== 401 && response2.status !== 422) {
//                 nm.warning(response2.statusText);
//             }
//         }, (error) => {
//             nm.error(error.message);
//         });
//     }

//     static async notifyForPasswordReset() {
//         if (getUrlParameter("reset_password") === "true") {
//             await new Promise((r) => setTimeout(r, 500));
//             window.history.replaceState({}, document.title, "/");
//             nm.info("The password has been reset with success");
//             nm.emitChange();
//         }
//     }

//     login() {
//         const params = {
//             email: this.state.email,
//             password: this.state.password,
//         };

//         postRequest.call(this, "account/login", params, () => {
//             nm.info("Please check your email for the One Time Pin");
//             this.setState({ verifyLogin: true });
//         }, (response) => {
//             nm.warning(response.statusText);
//         }, (error) => {
//             nm.error(error.message);
//         });
//     }

//     verifyLogin() {
//         if (!validateOtp(this.state.otp)) {
//             nm.warning("This one time pin is invalid.");
//             return;
//         }
//         const params = {
//             email: this.state.email,
//             token: this.state.otp,
//         };
//         postRequest.call(this, "account/verify_login", params, () => {
//             // Call fetchUser after successful login verification
//             this.fetchUser();
//         }, (response) => {
//             nm.warning(response.statusText);
//         }, (error) => {
//             nm.error(error.message);
//         });
//     }

//     createAccount() {
//         if (!validateEmail(this.state.createAccountEmail) || !validatePassword(this.state.password)) {
//             nm.warning("Email address or password is invalid");
//             return;
//         }

//         const params = {
//             email: this.state.createAccountEmail,
//             password: this.state.password,
//             entity: this.state.entity && this.state.entity.length > 0 ? this.state.entity : null,
//             department: this.state.entityDepartment ? this.state.entityDepartment : null,
//         };

//         postRequest.call(this, "account/create_account", params, () => {
//             nm.info("An email has been sent to your mailbox with a verification link");
//         }, (response) => {
//             nm.warning(response.statusText);
//         }, (error) => {
//             nm.error(error.message);
//         });
//     }

//     requestReset() {
//         const params = {
//             email: this.state.email,
//         };

//         postRequest.call(this, "account/forgot_password", params, () => {
//             nm.info("If that email address is in our database, we will send you an email to reset your password");
//         }, (response) => {
//             nm.warning(response.statusText);
//         }, (error) => {
//             nm.error(error.message);
//         });
//     }

//     resetPassword() {
//         if (this.state.password !== this.state.passwordConfirmation || validatePassword(this.state.password) === false || validatePassword(this.state.passwordConfirmation) === false) {
//             return;
//         }
//         const params = {
//             new_password: this.state.password,
//         };

//         postRequest.call(this, "account/reset_password", params, () => {
//             this.props.cookies.remove("access_token_cookie", {});
//             document.location.href = "/?reset_password=true";
//         }, (response) => {
//             nm.warning("LINK IS EXPIRED");
//         }, (error) => {
//             nm.error(error.message);
//         });
//     }

//     backToLogin() {
//         this.props.cookies.remove("access_token_cookie", {});
//         this.setState({ view: "login" });
//         window.history.pushState({ path: "/login" }, "", "/login");
//     }

//     onKeyDown(event) {
//         if (event.key === "Enter" || event.code === "NumpadEnter") {
//             if (this.state.view === "login" && !this.state.verifyLogin) this.login();
//             if (this.state.view === "login" && this.state.verifyLogin) this.verifyLogin();
//             if (this.state.view === "create") this.createAccount();
//             if (this.state.view === "forgot") this.requestReset();
//             if (this.state.view === "reset") this.resetPassword();
//         }
//     }

//     changeState(field, value) {
//         this.setState({ [field]: value });
//     }

//     render() {
//         return (
//             <div id="Login">
//                 <Header />
//                 <div className="login-box-container">
//                     <div id="Login-box" className={"fade-in"}>
//                         <div id="Login-inner-box">
//                             {this.state.view === "login" && (
//                                 <div className="row">
//                                     {this.state.verifyLogin === false && (
//                                         <>
//                                             <div className="col-md-12">
//                                                 <div className="Login-title">
//                                                     {this.props.settings !== null && this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined ? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME : "NCC SPACE"}
//                                                 </div>
//                                             </div>
//                                             <div className="col-md-12">
//                                                 <FormLine
//                                                     label="Email"
//                                                     fullWidth={true}
//                                                     value={this.state.email}
//                                                     onChange={(v) => this.changeState("email", v)}
//                                                     autofocus={true}
//                                                     onKeyDown={this.onKeyDown}
//                                                 />
//                                                 <FormLine
//                                                     label="Password"
//                                                     type={"password"}
//                                                     fullWidth={true}
//                                                     value={this.state.password}
//                                                     onChange={(v) => this.changeState("password", v)}
//                                                     onKeyDown={this.onKeyDown}
//                                                 />
//                                                 <div>
//                                                     <div className="right-buttons">
//                                                         <button className="gold-button" onClick={this.login}>
//                                                             Login
//                                                         </button>
//                                                     </div>
//                                                     <div className="left-buttons">
//                                                         <button className="gold-letters" onClick={() => this.changeState("view", "create")}>
//                                                             I want to create an account
//                                                         </button>
//                                                     </div>
//                                                     <div className="left-buttons">
//                                                         <button className="gold-letters" onClick={() => this.changeState("view", "forgot")}>
//                                                             I forgot my password
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </>
//                                     )}

//                                     {this.state.verifyLogin === true && (
//                                         <div className="col-md-12">
//                                             <div className="Login-title">Verify Login</div>
//                                             <FormLine
//                                                 label="Please enter the One Time Pin you received via email"
//                                                 fullWidth={true}
//                                                 value={this.state.otp}
//                                                 onChange={(v) => this.changeState("otp", v)}
//                                                 autofocus={true}
//                                                 onKeyDown={this.onKeyDown}
//                                                 format={validateOtp}
//                                             />
//                                             <div>
//                                                 <div className="right-buttons">
//                                                     <button className="gold-button" onClick={this.verifyLogin}>
//                                                         Submit
//                                                     </button>
//                                                 </div>
//                                                 <div className="left-buttons">
//                                                     <button className="gold-letters" onClick={this.login}>
//                                                         Resend Code
//                                                     </button>
//                                                 </div>
//                                                 <div className="left-buttons">
//                                                     <button className="gold-letters" onClick={() => this.changeState("verifyLogin", false)}>
//                                                         Back to login
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {this.state.view === "create" && (
//                                 <div className="row">
//                                     <div className="col-md-12">
//                                         <div className="Login-title">
//                                             {this.props.settings !== null && this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
//                                                 ? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
//                                                 : "NCC SPACE"}

//                                             {this.props.settings !== null && this.props.settings.PROJECT_NAME !== undefined && (
//                                                 <div className={"Login-title-small"}>
//                                                     {this.props.settings.PROJECT_NAME} private space
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                     <div className="col-md-12">
//                                         <FormLine
//                                             label="Email"
//                                             fullWidth={true}
//                                             value={this.state.createAccountEmail}
//                                             onChange={(v) => this.changeState("createAccountEmail", v)}
//                                             autofocus={true}
//                                             onKeyDown={this.onKeyDown}
//                                             format={validateEmail}
//                                         />
//                                         <FormLine
//                                             label="Password"
//                                             fullWidth={true}
//                                             type={"password"}
//                                             value={this.state.password}
//                                             onChange={(v) => this.changeState("password", v)}
//                                             autofocus={true}
//                                             onKeyDown={this.onKeyDown}
//                                             format={validatePassword}
//                                         />
//                                         <br />
//                                         {!validatePassword(this.state.password) && (
//                                             <>
//                                                 <div className="Password-prompt">
//                                                     The password must:
//                                                     <br />
//                                                     <li>contain at least 1 lowercase alphabetical character</li>
//                                                     <li>contain at least 1 uppercase alphabetical character</li>
//                                                     <li>contain at least 1 numeric character</li>
//                                                     <li>contain at least 1 special character being !@#$%^&*</li>
//                                                     <li>be between 10 and 30 characters long</li>
//                                                     <li>not contain any part of a name, surname or both</li>
//                                                 </div>
//                                                 <br />
//                                             </>
//                                         )}
//                                         <div className="right-buttons">
//                                             <button
//                                                 className="gold-button"
//                                                 onClick={this.createAccount}
//                                                 disabled={!validateEmail(this.state.createAccountEmail) || !validatePassword(this.state.password)}
//                                             >
//                                                 Create account
//                                             </button>
//                                         </div>
//                                         <div className="left-buttons">
//                                             <button className="gold-letters" onClick={() => this.backToLogin()}>
//                                                 Back to login
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {this.state.view === "forgot" && (
//                                 <div>
//                                     <div className="Login-title">Forgot password</div>

//                                     <FormLine
//                                         label="Email"
//                                         fullWidth={true}
//                                         value={this.state.email}
//                                         onChange={(v) => this.changeState("email", v)}
//                                         autofocus={true}
//                                         onKeyDown={this.onKeyDown}
//                                     />

//                                     <div className="right-buttons">
//                                         <button className="gold-button" onClick={this.requestReset}>
//                                             Reset password
//                                         </button>
//                                     </div>
//                                     <div className="left-buttons">
//                                         <button className="gold-letters" onClick={() => this.backToLogin()}>
//                                             Back to login
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}

//                             {this.state.view === "reset" && (
//                                 <div>
//                                     <div className="Login-title">Reset password</div>

//                                     <Info
//                                         content={
//                                             <div>
//                                                 The password must:
//                                                 <br />
//                                                 <li>contain at least 1 lowercase alphabetical character</li>
//                                                 <li>contain at least 1 uppercase alphabetical character</li>
//                                                 <li>contain at least 1 numeric character</li>
//                                                 <li>contain at least 1 special character being !@#$%^&*</li>
//                                                 <li>be between 8 and 30 characters long</li>
//                                                 <li>not contain any part of a name, surname or both</li>
//                                             </div>
//                                         }
//                                     />
//                                     <FormLine
//                                         label="New password"
//                                         type={"password"}
//                                         fullWidth={true}
//                                         value={this.state.password}
//                                         onChange={(v) => this.changeState("password", v)}
//                                         format={validatePassword}
//                                         onKeyDown={this.onKeyDown}
//                                         autofocus={true}
//                                     />
//                                     <FormLine
//                                         label="New password confirmation"
//                                         type={"password"}
//                                         fullWidth={true}
//                                         value={this.state.passwordConfirmation}
//                                         onChange={(v) => this.changeState("passwordConfirmation", v)}
//                                         format={() => this.state.password === this.state.passwordConfirmation}
//                                         onKeyDown={this.onKeyDown}
//                                     />
//                                     {this.state.password !== this.state.passwordConfirmation && this.state.passwordConfirmation !== "" && (
//                                         <div className="validation-error">Passwords do not match</div>
//                                     )}
//                                     <div className="right-buttons">
//                                         <button
//                                             className="gold-button"
//                                             onClick={this.resetPassword}
//                                             disabled={
//                                                 !validatePassword(this.state.password) ||
//                                                 !validatePassword(this.state.passwordConfirmation) ||
//                                                 this.state.password !== this.state.passwordConfirmation
//                                             }
//                                         >
//                                             Change password
//                                         </button>
//                                     </div>
//                                     <div className="left-buttons">
//                                         <button className="gold-letters" onClick={() => this.backToLogin()}>
//                                             Back to login
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//                 <Footer />
//             </div>
//         );
//     }
// }

