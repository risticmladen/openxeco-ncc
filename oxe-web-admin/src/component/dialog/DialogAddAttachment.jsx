import React from "react";
import "./DialogAddAttachment.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Dropzone from "react-dropzone";
import { Breadcrumb } from "react-bootstrap";

export default class DialogAddAttachment extends React.Component {
	constructor(props) {
		super(props);

		this.initialState = {
			document: null,
			filename: null,
			size: null,
		};

		this.state = {
			...this.initialState,
		};
	}

	onDrop(files) {
		if (files.length === 0) {
			nm.warning("No file has been detected. Please re-check the file extension.");
			this.setState({ ...this.initialState });
		} else {
			const reader = new FileReader();

			reader.onabort = () => nm.error("file reading was aborted");
			reader.onerror = () => nm.error("An error happened while reading the file");
			reader.onload = () => {
				this.setState({
					document: reader.result,
					filename: files[0].name,
					size: files[0].size,
				});
			};

			reader.readAsDataURL(files[0]);
		}
	}

	onValidate(close) {
		const attachment = {
			document: this.state.document,
			filename: this.state.filename,
			size: this.state.size,
		};
		if (this.props.onAddAttachment) {
			this.props.onAddAttachment(attachment);
		}
		nm.info("The attachment has been added");
		this.setState({ ...this.initialState });
		close();
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				className={"DialogAddAttachment"}
				trigger={this.props.trigger}
				modal
				closeOnDocumentClick
			>
				{(close) => (
					<div className={"row"}>
						<div className={"col-md-9"}>
							<h2>Add Attachment</h2>
						</div>

						<div className={"col-md-3"}>
							<div className="top-right-buttons">
								<button
									className={"grey-background"}
									data-hover="Close"
									data-active=""
									onClick={close}>
									<span><i className="far fa-times-circle"/></span>
								</button>
							</div>
						</div>

						<div className={"col-md-12"}>
							<Breadcrumb>
								<Breadcrumb.Item onClick={() => this.setState({ ...this.initialState })}>
									Choose Attachment
								</Breadcrumb.Item>
								&nbsp;&gt;&nbsp;
								<Breadcrumb.Item active={!this.state.document}>
									Upload Attachment
								</Breadcrumb.Item>
							</Breadcrumb>

							{!this.state.document && (
								<div className={"row"}>
									<div className={"col-md-12"}>
										<Dropzone
											accept=".pdf,.mp3,.jpg,.png,.doc,.docx"
											disabled={false}
											onDrop={(f) => this.onDrop(f)}
										>
											{({ getRootProps, getInputProps }) => (
												<div className={"DialogAddAttachment-dragdrop"} {...getRootProps()}>
													<input {...getInputProps()} />
													<div className="DialogAddAttachment-dragdrop-textContent">
														<i className="fas fa-file" />
														<div>Drag and drop the file here</div>
														<div>(must be .pdf, .mp3, .jpg, .png, .doc, .docx)</div>
													</div>
												</div>
											)}
										</Dropzone>
									</div>
									<div className={"col-md-12"}>
										<div className={"right-buttons"}>
											<button
												className={"grey-background"}
												data-hover="Close"
												data-active=""
												onClick={close}>
												<span><i className="far fa-times-circle" /> Close</span>
											</button>
										</div>
									</div>
								</div>
							)}

							{this.state.document && (
								<div className={"row"}>
									<div className={"col-md-12"}>
										<div className="DialogAddAttachment-textContent">
											<i className="fas fa-file" />
											<div>{this.state.filename}</div>
										</div>
									</div>
									<div className={"col-md-12"}>
										<div className={"right-buttons"}>
											<button
												data-hover="Upload"
												data-active=""
												onClick={() => this.onValidate(close)}>
												<span><i className="far fa-check-circle" /> Upload</span>
											</button>
											<button
												className={"grey-background"}
												data-active=""
												onClick={() => this.setState({ ...this.initialState })}>
												<span><i className="far fa-arrow-alt-circle-left" /> Back to attachment selection</span>
											</button>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
