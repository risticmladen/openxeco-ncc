import React from "react";
import "./PageArticles.css";
import { NotificationManager as nm } from "react-notifications";
// import { Link } from "react-router-dom";
import { getRequest } from "../utils/request.jsx";
import { getUrlParameter, dictToURI } from "../utils/url.jsx";
// import DynamicTable from "./table/DynamicTable.jsx";
// import ArticleHorizontal from "./item/ArticleHorizontal.jsx";
// import Message from "./box/Message.jsx";
// import Loading from "./box/Loading.jsx";
// import DialogAddArticle from "./dialog/DialogAddArticle.jsx";
// import DialogHint from "./dialog/DialogHint.jsx";
import CheckBox from "./form/CheckBox.jsx";

export default class PageArticles extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.getArticleEnums = this.getArticleEnums.bind(this);
		this.getMyArticles = this.getMyArticles.bind(this);

		this.state = {
			selectedTypes: [],
			articles: null,
			articleEnums: null,

			filters: {
				title: null,
				include_tags: "true",
				per_page: 20,
				page: getUrlParameter("page") !== null ? parseInt(getUrlParameter("page"), 10) : 1,
			},
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps, prevState) {
		if (JSON.stringify(prevProps.myEntities) !== JSON.stringify(this.props.myEntities)) {
			this.refresh();
		}

		if (prevState.selectedTypes !== this.state.selectedTypes) {
			this.getMyArticles();
		}
	}

	refresh() {
		if (this.props.myEntities !== null && this.props.myEntities.length > 0) {
			this.getArticleEnums();
			this.getMyArticles();
		}
	}

	getArticleEnums() {
		getRequest.call(this, "public/get_public_article_enums", (data) => {
			this.setState({
				articleEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getMyArticles(page) {
		this.setState({
			articles: null,
			page: Number.isInteger(page) ? page : this.state.filters.page,
		});

		const params = dictToURI({
			...this.state.filters,
			page: Number.isInteger(page) ? page : this.state.filters.page,
			type: this.state.selectedTypes.join(","),
		});

		const urlParams = dictToURI({
			taxonomy_values: this.state.filters.taxonomy_values,
			page: Number.isInteger(page) ? page : this.state.filters.page,
		});

		// eslint-disable-next-line no-restricted-globals
		history.replaceState(null, null, "?" + urlParams);

		getRequest.call(this, "private/get_my_articles?" + params, (data) => {
			this.setState({
				articles: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	onChangeTypeSelection(type, status) {
		if (status) {
			this.setState({
				selectedTypes: this.state.selectedTypes.concat([type]),
			});
		} else {
			this.setState({
				selectedTypes: this.state.selectedTypes.filter((t) => t !== type),
			});
		}
	}

	render() {
		// Test data
		const testSettings = {
			AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM: "News, Blogs, Reviews",
		};

		const testEntities = ["Entity1", "Entity2", "Entity3"];

		return (
			<div className={"PageArticles page max-sized-page"}>
				<div className={"row"}>
					<div className="col-md-10">
						<h1>My articles</h1>
					</div>

					{/* <div className="col-md-2 top-title-menu">
						<DialogHint
							content={
								<div className="row">
									<div className="col-md-12">
										<h2>What is an article?</h2>

										<p>
											An article is a global name to define different objects
											as the following ones:
										</p>

										<ul>
											{this.props.settings !== null
												&& this.props.settings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM !== undefined
												&& this.props.settings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM
													.split(",")
													.map((t) => <li
														key={t}>
														{t}
													</li>)}
										</ul>

										<p>
											Each of these objects are editable with this webpage
											by creating an article.
										</p>

										<p>
											Every article is edited and published on behalf of an entity.
											If you are not assigned to any entities, please see
											&nbsp;<Link to={"/add_entity"}>this page</Link>.
										</p>

										<h2>How can I create an article</h2>

										<p>
											To create an article, you can select this button
											that is on the current webpage.
										</p>

										<img src="img/hint-create-article-button.png"/>

										<p>
											Then, you will find a dialogue box to choose the title
											and the entity that will be marked as an editor of the article.
											The title must be at least 6 characters long.
										</p>

										<img src="img/hint-create-article-form.png"/>

										<p>
											To finish, you can select the &quot;Add article&quot; button.
											The new article will be visible on the list of the page.
										</p>

										<h2>What is the information shown?</h2>

										<img src="img/hint-article-display.png"/>

										<ul>
											<li>1. The title of the article</li>
											<li>2. The entity assigned to the article</li>
											<li>
												3. The status of the article. To have more
												information about the OFFLINE status,
												click on this button and get the reasons why
												the article is offline
											</li>
											<li>4. The abstract of the article</li>
											<li>5. The publication date of the article</li>
											<li>6. The button to reach the editor mode of the article</li>
										</ul>

										<h2>How can I edit an article?</h2>

										<p>
											You can edit any articles by clicking on the
											&quot;Open editor&quot; button:
										</p>

										<img src="img/hint-open-editor.png"/>
									</div>
								</div>
							}
						/>
					</div> */}
				</div>
				<ul>
					{testSettings !== null
					&& testSettings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM !== undefined
					&& testSettings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM
						.split(",")
						.map((t) => <li
							key={t}>
							{t}
						</li>)}
				</ul>
				{testEntities !== null && testEntities.length > 0
				&& <div className={"row"}>
					<div className="col-md-12 PageArticles-Checkboxes">
						{testSettings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM
							.split(",")
							.map((t) => <CheckBox
								key={t}
								label={t}
								value={this.state.selectedTypes.indexOf(t) >= 0}
								onClick={(v) => this.onChangeTypeSelection(t, v)}
							/>)}
					</div>
					{/* ... */}
				</div>
				}
				{/* {this.props.myEntities !== null && this.props.myEntities.length > 0
					&& <div className={"row"}>
						<div className="col-md-8">
							{this.props.settings
								&& this.props.settings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM
								? <div className={"row"}>
									<div className="col-md-12 PageArticles-Checkboxes">
										{this.props.settings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM
											.split(",")
											.map((t) => <CheckBox
												key={t}
												label={t}
												value={this.state.selectedTypes.indexOf(t) >= 0}
												onClick={(v) => this.onChangeTypeSelection(t, v)}
											/>)}
									</div>
								</div>
								: <Loading
									height={100}
								/>
							}
						</div>

						<div className="col-md-4 row-spaced">
							<div className="right-buttons">
								<button
									className="blue-button"
									onClick={this.refresh}
								>
									<i className="fas fa-sync-alt"/>
								</button>
								<DialogAddArticle
									trigger={<button
										className="blue-button"
									>
										<i className="fas fa-plus"/> <i className="fas fa-feather-alt"/>
									</button>}
									myEntities={this.props.myEntities}
									afterConfirmation={this.getMyArticles}
								/>
							</div>
						</div>

						<div className="col-md-12">
							{this.state.articles !== null && this.state.articles.pagination
								&& this.state.articles.pagination.total === 0
								&& <div className="row row-spaced">
									<div className="col-md-12">
										<Message
											text={"No article found"}
											height={200}
										/>
									</div>
								</div>
							}

							{this.state.articles !== null && this.state.articles.pagination
								&& this.state.articles.pagination.total > 0
								&& <DynamicTable
									items={this.state.articles.items}
									pagination={this.state.articles.pagination}
									changePage={(page) => this.getArticles(page)}
									buildElement={(a) => <div className="col-md-12">
										<ArticleHorizontal
											info={a}
											analytics={this.props.analytics}
											myEntities={this.props.myEntities}
											settings={this.props.settings}
											afterDelete={this.refresh}
											onCloseEdition={this.refresh}
										/>
									</div>
									}
								/>
							}

							{(this.state.articles === null
								|| this.state.articles.pagination === undefined
								|| this.state.articles.items === undefined)
								&& <div className="row row-spaced">
									<div className="col-md-12">
										<Loading
											height={200}
										/>
									</div>
								</div>
							}
						</div>
					</div>
				}

				{this.props.myEntities !== null && this.props.myEntities.length === 0
					&& <Message
						text={<div>
							<p>
								You are not assign to any entity. You need to have access to
								an entity to edit articles and publish on behalf of it.
							</p>
							<p>
								Please see the
								<a
									onClick={() => this.props.changeMenu("add_entity")}
								>
									<Link to="/add_entity">&#32;Claim or register an entity&#32;</Link>
								</a>
								page to request for it.
							</p>
						</div>}
						height={200}
					/>
				}

				{this.props.myEntities === null
					&& <Loading
						height={200}
					/>
				} */}
			</div>
		);
	}
}
