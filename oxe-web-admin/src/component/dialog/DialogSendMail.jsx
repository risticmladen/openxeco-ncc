import React from "react";
import "./DialogSendMail.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import FormLine from "../button/FormLine.jsx";
import { validateEmail } from "../../utils/re.jsx";
import { postRequest } from "../../utils/request.jsx";
import DialogAddAttachment from "./DialogAddAttachment.jsx";

const toolbarOptions = [
	[{ font: [] }],
	[{ header: [1, 2, false] }],
	["bold", "italic", "underline", "strike"],
	[{ color: [] }, { background: [] }],
	[{ script: "sub" }, { script: "super" }],
	[{ list: "ordered" }, { list: "bullet" }],
	[{ indent: "-1" }, { indent: "+1" }],
	[{ direction: "rtl" }],
	[{ align: [] }],
	["clean"],
];

const modules = {
	toolbar: toolbarOptions,
};

export default class DialogSendMail extends React.Component {
	constructor(props) {
		super(props);

		this.defaultState = {
			email: props.email ? props.email : "",
			subject: props.subject ? props.subject : null,
			content: props.content ? props.content : null,
			userAsCc: true,
			attachment: null,
		};

		this.state = { ...this.defaultState };
	}

	resetState() {
		this.setState({ ...this.defaultState });
	}

	renderAttachment() {
		if (this.state.attachment) {
			return (
				<div className="attachment-info" style={{ marginLeft: "10px" }}>
					<span><i className="fas fa-paperclip" /> {this.state.attachment.filename}</span>
				</div>
			);
		}
		return null;
	}

	addAttachment(attachment) {
		this.setState({ attachment });
	}

	sendMail(close) {
		const emailList = this.state.email.split(",").map((email) => email.trim());
		// Iterate over each email and send a separate request for each
		const emailCount = emailList.length;
		emailList.forEach((email) => {
			const params = {
				address: email,
				subject: this.state.subject,
				content: this.state.content.replaceAll("\n", "<br/>"),
				user_as_cc: this.state.userAsCc,
			};
			if (this.state.attachment) {
				params.attachment_filename = this.state.attachment.filename;
				params.attachment_data = this.state.attachment.document;
			}
			postRequest.call(this, "mail/send_mail", params, () => {
				// Do something after successfully sending the email
				// For example, you can show a notification
			}, (response) => {
				// Handle errors if the email fails to send
				nm.warning("Failed to send email to " + email + ": " + response.statusText);
			}, (error) => {
				// Handle other types of errors
				nm.error("Error sending email to " + email + ": " + error.message);
			});
		});
		if (emailCount === 1) {
			nm.info("Email sent to " + emailList[0]);
		} else {
			nm.info("Email sent to all");
		}
		// Close the popup after attempting to send emails
		close();
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				trigger={this.props.trigger}
				modal
				closeOnDocumentClick
				onOpen={() => this.resetState()}
				className={"DialogSendMail"}
				contentStyle={{ height: "68%" }}
			>
				{(close) => (
					<div className={"row DialogSendMail-wrapper"}>
						<div className={"col-md-12"}>
							<h2>Send mail</h2>
						</div>

						<div className={"col-md-12"} style={{ marginBottom: "50px" }}>
							<FormLine
								label={"Recipient"}
								value={this.state.email}
								onChange={(v) => this.changeState("email", v)}
								format={(emails) => emails.split(",").every((email) => validateEmail(email.trim()))}
							/>
							<FormLine
								label={"Set my user address as CC"}
								type={"checkbox"}
								value={this.state.userAsCc}
								onChange={() => this.changeState("userAsCc", !this.state.userAsCc)}
							/>
							<FormLine
								label={"Subject"}
								value={this.state.subject}
								onChange={(s) => this.changeState("subject", s)}
							/>
							<div className={"form-line"} style={{ marginLeft: "10px" }}>
								<label>Mail content</label>
								<ReactQuill
									value={this.state.content}
									onChange={(v) => this.changeState("content", v)}
									modules={modules}
									style={{ height: "200px" }}
								/>
							</div>
						</div>
						<div className={"col-md-12"}>
							<div className={"left-buttons"} style={{ marginLeft: "10px", display: "flex", alignItems: "center" }}>
								<DialogAddAttachment
									trigger={
										<button
											className={"blue-background"}
											data-hover="Filter">
											<span><i className="fas fa-plus"/> Add Attachment</span>
										</button>
									}
									onAddAttachment={this.addAttachment.bind(this)}
									afterValidate={this.refresh}
								/>
								{this.renderAttachment()}
							</div>
							<div className={"right-buttons"}>
								<button
									data-hover="Send mail"
									data-active=""
									onClick={() => this.sendMail(close)}
									disabled={!validateEmail(this.state.email)}>
									<span><i className="far fa-paper-plane"/> Send email</span>
								</button>
								<button
									className={"grey-background"}
									data-hover="Cancel"
									data-active=""
									onClick={close}>
									<span><i className="far fa-times-circle"/> Cancel</span>
								</button>
							</div>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
