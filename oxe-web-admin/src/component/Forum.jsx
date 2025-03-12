import React from "react";
import { Link } from "react-router-dom";
import { NotificationManager as nm } from "react-notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { getRequest } from "../utils/request.jsx"; // Updated import path
import Loading from "./box/Loading.jsx";
import "./Forum.css";
// import "./ForumStyles.css";

export default class Forum extends React.Component {
	constructor(props) {
		super(props);

		// this.onDropForm = this.onDropForm.bind(this);

		this.state = {

			forums: [], // Add forums state
			loading: true, // Add loading state
		};
	}

	componentDidMount() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({ primary_contact_name: data.first_name + " " + data.last_name });
			this.setState({ primary_contact_email: data.work_email });
		}, (response2) => {
			nm.warning(response2.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		// getRequest.call(this, "public/get_public_departments", (data) => {
		// 	this.setState({
		// 		departments: data,
		// 	});
		// }, (error) => {
		// 	nm.warning(error.message);
		// }, (error) => {
		// 	nm.error(error.message);
		// });

		// Fetch the forums data
		getRequest.call(this, "forum/get_forum", (data) => {
			this.setState({ forums: data, loading: false });
		}, (response2) => {
			nm.warning(response2.statusText);
		}, (error) => {
			nm.error(error.message);
		});

	}


	render() {
		console.log(this.props);
		return (
			<div id="Forum" className="max-sized-page row-spaced">
				{/* Render forums data */}
				{this.state.loading
					? <Loading height={200} />
					: <div className="forumList">
						<h1 className="dashboard-header">FORUM</h1>
						<div className="forumItemsContainer">
							{this.state.forums.map((forum) => (
								<div key={forum.id} className="forum-item">
									<h3>
										<Link to={`/forum/${forum.id}`}> {/* Updated link */}
											<FontAwesomeIcon icon={faPen} className="icon" />
											{forum.name}
										</Link>
									</h3>
									<p>{forum.description}</p>
								</div>
							))}
						</div>
					</div>
				}
			</div>
		);
	}
}
