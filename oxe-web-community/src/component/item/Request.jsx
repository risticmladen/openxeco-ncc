import React, { Component } from "react";
import "./Request.css";
import { NotificationManager as nm } from "react-notifications";
import dompurify from "dompurify";
import { postRequest } from "../../utils/request.jsx";

export default class Request extends Component {
	constructor(props) {
		super(props);

		this.delete = this.delete.bind(this);

		this.state = {
		};
	}

	delete() {
		const params = {
			id: this.props.info.id,
		};

		postRequest.call(this, "private/delete_my_request", params, () => {
			if (this.props.afterDelete !== undefined) {
				this.props.afterDelete();
			}

			nm.info("The request has been deleted");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	static getPrettyRequestContent(input) {
		let output = "";

		Object.keys(input).map((k) => {
			output += k + ": " + input[k] + "<br/>";
			return "";
		});

		return dompurify.sanitize(
			output,
		);
	}

	render() {
		const { info } = this.props;
		return (
			<div className="Request card">
				<div className="card-horizontal">
					<div className="card-body">
						<div className="card-date">
							{info.submission_date ? info.submission_date.replace("T", " ") : "NO DATE FOUND"}
						</div>
						<div className="card-type">
							STATUS: {info.status}
						</div>
						{info.type !== null ? (
							<div>
								<b>{info.type}</b>
							</div>
						) : (
							""
						)}
						{info.request !== null ? (
							<p className="card-text">{info.request}</p>
						) : (
							""
						)}
						{info.data !== null && typeof info.data === "object" && !Array.isArray(info.data) ? (
							<div
								dangerouslySetInnerHTML={{
									__html: Request.getPrettyRequestContent(info.data),
								}}
							/>
						) : (
							"    "
						)}
						{info.image !== null ? (
							<div>
								<img src={"data:image/png;base64," + info.image} alt="Request" />
							</div>
						) : (
							""
						)}
						{info.status === "NEW" ? (
							<button
								className="red-background"
								onClick={this.delete}
								disabled={info.link === null}
							>
								<i className="fas fa-trash-alt" /> Delete
							</button>
						) : (
							<div className="hidden-placeholder"></div>
						)}
					</div>
				</div>
			</div>
		);
	}
}
