import React from "react";
import "./PageHome.css";
import { Link } from "react-router-dom";
import Loading from "./box/Loading.jsx";
// import DialogHint from "./dialog/DialogHint.jsx";

export default class PageHome extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		return (
			<div className={"PageHome page max-sized-page row-spaced"}>
				<div className={"row"}>
					<div className="col-md-10 mb-5">
						<h1 className="dashboard-header">Dashboard</h1>
					</div>

					{/* <div className="col-md-2 top-title-menu">
						<DialogHint
							content={...}
							validateSelection={(value) => this.onChange(value)}
						/>
					</div> */}

					<div className="col-md-12">
						<Link to="/board" onClick={() => this.props.changeMenu("/board/")}>
							<div className="PageHome-white-block">
								<i className="far fa-calendar" style={{ color: "#f4a404" }} />
								<h3>Activity Board</h3>
							</div>
						</Link>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-6">
						<Link to="/profile" onClick={() => this.props.changeMenu("profile")}>
							<div className="PageHome-white-block">
								<i className="fas fa-user" style={{ color: "#f4a404" }} />
								<h3>Profile: {this.props.email.split("@")[0]}</h3>
							</div>
						</Link>
					</div>

					{this.props.myEntities !== null &&
						this.props.myEntities.length > 0 &&
						this.props.myEntities.map((c) => (
							<div key={c.id} className="col-md-6">
								<Link to={`/entity/${c.id}`} onClick={() => this.props.changeMenu(`/entity/${c.id}`)}>
									<div className="PageHome-white-block">
										<i className="fas fa-building" style={{ color: "#f4a404" }} />
										<h3>{c.name}</h3>
									</div>
								</Link>
							</div>
						))}

					<div className="col-md-6">
						<Link to="/forum" onClick={() => this.props.changeMenu("/forum/")}>
							<div className="PageHome-white-block">
								<i className="fas fa-comments" style={{ color: "#f4a404" }} />
								<h3>Forum</h3>
							</div>
						</Link>
					</div>

					<div className="col-md-6">
						<Link to="/announcements" onClick={() => this.props.changeMenu("/announcements/")}>
							<div className="PageHome-white-block">
								<i className="fas fa-bullhorn" style={{ color: "#f4a404" }} />
								<h3>Announcements</h3>
							</div>
						</Link>
					</div>

					{/* {this.props.settings && this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE === "TRUE" &&
						<div className="col-md-6">
							<Link to="/articles" onClick={() => this.props.changeMenu("articles")}>
								<div className="PageHome-white-block">
									<i className="fas fa-feather-alt" />
									<h3>Read or edit articles</h3>
								</div>
							</Link>
						</div>
					}

					{this.props.settings && this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_FORM === "TRUE" &&
						<div className="col-md-6">
							<Link to="/form" onClick={() => this.props.changeMenu("form")}>
								<div className="PageHome-white-block">
									<i className="fas fa-poll-h" />
									<h3>FORMS</h3>
								</div>
							</Link>
						</div>
					} */}

					<div className="col-md-12">
						{/* <h2>My entities</h2> */}
					</div>

					<div className="col-md-6">
						<Link to="/faqs" onClick={() => this.props.changeMenu("/faqs/")}>
							<div className="PageHome-white-block">
								<i className="far fa-question-circle" style={{ color: "#f4a404" }} />
								<h3>FAQ</h3>
							</div>
						</Link>
					</div>

					<div className="col-md-6">
						<Link to="/news" onClick={() => this.props.changeMenu("/news/")}>
							<div className="PageHome-white-block">
								<i className="fas fa-newspaper" style={{ color: "#f4a404" }} />
								<h3>European News</h3>
							</div>
						</Link>
					</div>

					<div className="col-md-6">
						<Link to="/members" onClick={() => this.props.changeMenu("/members/")}>
							<div className="PageHome-white-block">
								<i className="fas fa-user-friends" style={{ color: "#f4a404" }} />
								<h3>Members</h3>
							</div>
						</Link>
					</div>

					<div className="col-md-6">
						<Link to="/contact" onClick={() => this.props.changeMenu("/contact/")}>
							<div className="PageHome-white-block">
								<i className="fas fa-headset" style={{ color: "#f4a404" }} />
								<h3>Contact Us</h3>
							</div>
						</Link>
					</div>

					{/* {this.props.myEntities === null && <Loading height={150} />} */}

					{/* {this.props.myEntities !== null && this.props.myEntities.length > 0 && this.props.myEntities.map((c) =>
						<div key={c.id} className="col-md-6">
							<Link to={`/entity/${c.id}`} onClick={() => this.props.changeMenu(`/entity/${c.id}`)}>
								<div className="PageHome-white-block">
									<i className="fas fa-building" />
									<h3>{c.name}</h3>
								</div>
							</Link>
						</div>
					)} */}
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						{/* <h2>My entities</h2> */}
					</div>

					{this.props.myEntities === null && <Loading height={150} />}
				</div>
			</div>
		);
	}
}
