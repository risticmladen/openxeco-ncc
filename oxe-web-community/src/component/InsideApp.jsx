import React from "react";
import "./InsideApp.css";
import { NotificationManager as nm } from "react-notifications";
import { Route, Switch } from "react-router-dom";
import Menu from "./Menu.jsx";
import PageHome from "./PageHome.jsx";
import PageForm from "./PageForm.jsx";
import PageArticles from "./PageArticles.jsx";
import PageLogoGenerator from "./PageLogoGenerator.jsx";
// import PageAddEntity from "./PageAddEntity.jsx";
import PageEntity from "./PageEntity.jsx";
import PageProfile from "./PageProfile.jsx";
import PageAddProfile from "./PageAddProfile.jsx";
import PageContact from "./PageContact.jsx";
import { getRequest } from "../utils/request.jsx";
import Announcements from "./AnnouncementsPage.jsx";
import News from "./NewsPage.jsx";
import Faqs from "./FaqsPage.jsx";
import SingleArticle from "./SingleArticle.jsx";
// import Contact from "./ContactPage.jsx";
import Forum from "./Forum.jsx";
import ForumDetail from "./forum/ForumDetail.jsx";
import Posts from "./forum/Posts.jsx";
// import HeaderContainer from "./forum/HeaderContainer.jsx";
// import FooterContainer from "./forum/footer/index.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import PageUser from "./PageUser.jsx";
import ActivityBoard from "./ActivityBoard.jsx";

export default class InsideApp extends React.Component {
	constructor(props) {
		super(props);

		this.changeState = this.changeState.bind(this);
		this.getNotifications = this.getNotifications.bind(this);
		this.getMyEntities = this.getMyEntities.bind(this);
		this.changeMenu = this.changeMenu.bind(this);

		this.state = {
			selectedMenu: window.location.pathname.replace(/\//, ""),
			notifications: null,
			myEntities: null,
		};
	}

	componentDidMount() {
		this.getNotifications();
		this.getMyEntities();
		this.getMyUser();

		window.onfocus = () => {
			this.getMyEntities();
		};
	}

	getNotifications() {
		getRequest.call(this, "private/get_my_notifications", (data) => {
			this.setState({
				notifications: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getMyEntities() {
		if (this.props.isLoggedIn() === true) {
			getRequest.call(this, "private/get_my_entities", (data) => {
				if (!this.state.myEntities
					|| JSON.stringify(this.state.myEntities.map((e) => e.id))
						!== JSON.stringify(data.map((e) => e.id))) {
					this.setState({
						myEntities: data,
					});
				}
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	getMyUser() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({
				user: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeMenu(menu) {
		this.setState({ selectedMenu: menu });
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="InsideApp" className={"fade-in"}>
				<Route render={(props) => <Menu
					selectedMenu={this.state.selectedMenu}
					changeMenu={this.changeMenu}
					myEntities={this.state.myEntities}
					notifications={this.state.notifications}
					settings={this.props.settings}
					logout={this.props.logout}
					{...props}
				/>}/>
				<div id="InsideApp-content">
					<Header/>
					<Switch>
						<Route
							path="/profile"
							render={(props) => <PageProfile {...props}
								logout={this.props.logout}
								getMyEntities={this.getMyEntities}
								myEntities={this.state.myEntities} />} />
						{/* {this.props.settings !== undefined
							&& this.props.settings !== null
							&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE === "TRUE"
							&& <Route path="/articles" render={(props) => <PageArticles
								myEntities={this.state.myEntities}
								notifications={this.state.notifications}
								getNotifications={this.getNotifications}
								settings={this.props.settings}
								changeMenu={this.changeMenu}
								{...props}
							/>}/>
						} */}
						<Route path="/articles" render={(props) => <PageArticles
							myEntities={this.state.myEntities}
							notifications={this.state.notifications}
							getNotifications={this.getNotifications}
							settings={this.props.settings}
							changeMenu={this.changeMenu}
							{...props}
						/>}/>
						<Route path="/board" render={() => <ActivityBoard
							
							// changeMenu={this.changeMenu}
							// {...props}
						/>}/>
						<Route path="/announcements" render={() => <Announcements
							// myEntities={this.state.myEntities}
							// notifications={this.state.notifications}
							// getNotifications={this.getNotifications}
							// settings={this.props.settings}
							// changeMenu={this.changeMenu}
							// {...props}
						/>}/>
						<Route path="/news" render={() => <News
							// myEntities={this.state.myEntities}
							// notifications={this.state.notifications}
							// getNotifications={this.getNotifications}
							// settings={this.props.settings}
							// changeMenu={this.changeMenu}
							// {...props}
						/>}/>
						<Route path="/faqs" render={() => <Faqs
							// myEntities={this.state.myEntities}
							// notifications={this.state.notifications}
							// getNotifications={this.getNotifications}
							// settings={this.props.settings}
							// changeMenu={this.changeMenu}
							// {...props}
						/>}/>
						{/* <Route path="/contact" render={() => <Contact
							// myEntities={this.state.myEntities}
							// notifications={this.state.notifications}
							// getNotifications={this.getNotifications}
							// settings={this.props.settings}
							// changeMenu={this.changeMenu}
							// {...props}
						/>}/> */}
						<Route exact path="/forum" render={(props) => <Forum
							settings={this.props.settings}
							myEntities={this.state.myEntities}
							{...props}
						/>}/> {/* Updated Forum route */}
						<Route exact path="/forum/:id" render={(props) => <ForumDetail {...props} />} /> {/* Added ForumDetail route */}
						<Route path="/forum/:forumId/thread/:threadId" render={(props) => <Posts {...props} />} /> {/* Added Post route */}
						<Route path="/entity/:id?" render={(props) => <PageEntity
							key={Date.now()}
							myEntities={this.state.myEntities}
							notifications={this.state.notifications}
							getNotifications={this.getNotifications}
							changeMenu={this.changeMenu}
							{...props}
						/>}/>
						<Route path="/form" render={(props) => <PageForm
							settings={this.props.settings}
							{...props}
						/>}/>
						{/* <Route path="/add_entity" render={(props) => <PageAddEntity
							getNotifications={this.getNotifications}
							myEntities={this.state.myEntities}
							settings={this.props.settings}
							changeMenu={this.changeMenu}
							{...props}
						/>}/> */}
						<Route path="/article/:id" render={(props) => <SingleArticle
							// myEntities={this.state.myEntities}
							// notifications={this.state.notifications}
							// getNotifications={this.getNotifications}
							// settings={this.props.settings}
							// changeMenu={this.changeMenu}
							{...props}
						/>}/>
						<Route path="/add_profile" render={(props) => <PageAddProfile
							changeMenu={this.changeMenu}
							{...props}
						/>} />
						<Route path="/members" render={(props) => <PageUser {...props} />}/>
						<Route path="/generator" render={(props) => <PageLogoGenerator
							settings={this.props.settings}
							myEntities={this.state.myEntities}
							{...props}
						/>}/>
						<Route path="/contact" render={(props) => <PageContact
							settings={this.props.settings}
							getNotifications={this.getNotifications}
							{...props}
						/>}/>
						<Route path="/" render={(props) => <PageHome
							settings={this.props.settings}
							changeMenu={this.changeMenu}
							myEntities={this.state.myEntities}
							email={this.props.email}
							{...props}
						/>}/>
					</Switch>
					<Footer/>
				</div>
			</div>
		);
	}
}
