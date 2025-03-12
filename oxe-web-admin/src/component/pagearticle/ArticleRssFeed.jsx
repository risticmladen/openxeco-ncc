import React from "react";
import "./ArticleRssFeed.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../box/Loading.jsx";
import Warning from "../box/Warning.jsx";
import Table from "../table/Table.jsx";
import { getRequest, postRequest, getRssFeed } from "../../utils/request.jsx";
import { validateUrl } from "../../utils/re.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import DialogSelectEntity from "../dialog/DialogSelectEntity.jsx";
import Entity from "../item/Entity.jsx";
import FormLine from "../button/FormLine.jsx";
import RssArticle from "../item/RssArticle.jsx";

export default class ArticleRssFeed extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.addRssFeed = this.addRssFeed.bind(this);
		this.deleteRssFeed = this.deleteRssFeed.bind(this);

		this.state = {
			rssFeedField: "",
			articleFilterField: "",
			rssFeeds: null,
			rssArticles: null,
			requestMessages: [],
			rssFeedEntities: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(_, prevState) {
		if (prevState.rssFeeds !== this.state.rssFeeds) {
			this.fetchRssFeeds();
		}
	}

	refresh() {
		this.setState({
			rssFeeds: null,
			rssFeedEntities: null,
		}, () => {
			getRequest.call(this, "rss/get_rss_feeds", (data) => {
				this.setState({
					rssFeeds: data,
				}, () => {
					const entityIds = data
						.map((f) => f.entity_id)
						.filter((f) => f);

					if (entityIds.length > 0) {
						getRequest.call(this, "public/get_public_entities?ids="
							+ entityIds.join(","), (data2) => {
							this.setState({
								rssFeedEntities: data2,
							});
						}, (response) => {
							nm.warning(response.statusText);
						}, (error) => {
							nm.error(error.message);
						});
					} else {
						this.setState({ rssFeedEntities: [] });
					}
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	addRssFeed(close) {
		const params = {
			url: this.state.rssFeedField,
		};

		postRequest.call(this, "rss/add_rss_feed", params, () => {
			this.refresh();
			if (close) {
				close();
			}
			nm.info("The RSS feed has been added");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	deleteRssFeed(value) {
		const params = {
			url: value,
		};

		postRequest.call(this, "rss/delete_rss_feed", params, () => {
			this.refresh();
			nm.info("The RSS feed has been deleted");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateRssFeed(url, newValues) {
		const params = {
			url,
			...newValues,
		};

		postRequest.call(this, "rss/update_rss_feed", params, () => {
			this.refresh();
			nm.info("The RSS feed has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchRssFeeds() {
		if (this.state.rssFeeds) {
			this.setState({ rssArticles: null, requestMessages: [] }, () => {
				Promise.all(this.state.rssFeeds.map(ArticleRssFeed.fetchRssFeed)).then((data) => {
					let rssArticles = [];
					const requestMessages = [];

					data.forEach((d, i) => {
						if (d && d.items) {
							if (d.feed && d.feed.title) {
								d.items.forEach((o) => {
									// eslint-disable-next-line no-param-reassign
									o.source = d.feed.title;
									// eslint-disable-next-line no-param-reassign
									o.entity_id = this.state.rssFeeds[i].entity_id;
								});
							}

							rssArticles = rssArticles.concat(d.items);
						}

						if (d === "ERROR") {
							requestMessages.push("Error while fetching: " + this.state.rssFeeds[i].url);
						}
					});

					rssArticles.sort((a, b) => (a.pubDate < b.pubDate ? 1 : -1));

					this.setState({ rssArticles, requestMessages });
				});
			});
		}
	}

	static fetchRssFeed(rssFeed) {
		return new Promise((resolve) => getRssFeed(rssFeed.url, (data) => {
			resolve(data);
		}, () => {
			resolve("ERROR");
		}, () => {
			resolve("ERROR");
		}));
	}

	filterRssFeedArticles() {
		if (!this.state.articleFilterField || this.state.articleFilterField.length === 0) {
			return this.state.rssArticles;
		}

		const words = this.state.articleFilterField.split(" ")
			.filter((w) => w.length > 0)
			.map((w) => w.toLowerCase());

		function containWords(ws, c) {
			for (let i = 0; i < ws.length; i++) {
				if (!c.includes(ws[i])) {
					return false;
				}
			}

			return true;
		}

		return this.state.rssArticles
			.filter((a) => containWords(words, (a.title + a.description).toLowerCase()));
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		const columns = [
			{
				Header: "URL",
				accessor: "url",
				width: 200,
			},
			{
				Header: "Entity",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => {
					if (!value.entity_id) {
						return <div className="ArticleRssFeed-feed-entity">
							<span>No entity assigned</span>
						</div>;
					}

					return <Entity
						id={value.entity_id}
						name={this.state.rssFeedEntities
							&& this.state.rssFeedEntities.filter((c) => value.entity_id === c.id).length > 0
							? this.state.rssFeedEntities.filter((c) => value.entity_id === c.id)[0].name
							: "Loading..."}
						afterDeletion={() => this.refresh()}
					/>;
				},
				width: 200,
			},
			{
				Header: "Action",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div>
						<DialogConfirmation
							text={"Are you sure you want to delete this RSS feed?"}
							trigger={
								<button
									className={"small-button red-background Table-right-button"}
									title={"Delete the RSS feed"}>
									<i className="fas fa-trash-alt"/>
								</button>
							}
							afterConfirmation={() => this.deleteRssFeed(value.url)}
						/>

						{value.entity_id
							? <DialogConfirmation
								text={"Are you sure you want to remove the entity assignment?"}
								trigger={
									<button
										className={"small-button red-background"}
										title={"Assign an entity to the feed"}>
										<i className="fas fa-times"/>
										&nbsp;
										<i className="fas fa-building"/>
									</button>
								}
								afterConfirmation={() => this.updateRssFeed(value.url, { entity_id: null })}
							/>
							: <DialogSelectEntity
								trigger={
									<button
										className={"small-button"}
										title={"Assign an entity to the RSS feed"}>
										<i className="fas fa-plus"/>
										&nbsp;
										<i className="fas fa-building"/>
									</button>
								}
								onConfirmation={(id) => this.updateRssFeed(value.url, { entity_id: id })}
							/>
						}
					</div>
				),
				width: 45,
			},
		];

		return (
			<div id="ArticleRssFeed" className="max-sized-page fade-in article-container">
				<div className={"row row-spaced"}>
					<div className="col-md-9">
						<h1 className="article-heading">RSS Feeds</h1>
					</div>

					<div className="col-md-3">
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<Popup
								trigger={
									<button>
										<i className="fas fa-plus"/>
									</button>
								}
								modal
							>
								{(close) => <div className={"row row-spaced"}>
									<div className={"col-md-9"}>
										<h2>Add a new RSS feed</h2>
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

									<div className="col-md-12">
										<FormLine
											label={"Add a RSS Feed"}
											value={this.state.rssFeedField}
											onChange={(v) => this.changeState("rssFeedField", v)}
										/>

										<div className="right-buttons row-spaced">
											<button
												className={"blue-background"}
												onClick={() => this.addRssFeed(close)}
												disabled={!validateUrl(this.state.rssFeedField)}>
												<i className="fas fa-plus"/> Add RSS Feed
											</button>
										</div>
									</div>
								</div>}
							</Popup>
						</div>
					</div>

					<div className="col-md-12">
						{this.state.rssFeeds
							? <Table
								columns={columns}
								data={this.state.rssFeeds}
							/>
							: <Loading
								height={300}
							/>
						}
					</div>
				</div>

				{this.state.requestMessages.length > 0
					&& <div className={"row row-spaced"}>
						<div className="col-md-12">
							{this.state.requestMessages.map((m, i) => <Warning
								key={i}
								content={m}
							/>)}
						</div>
					</div>
				}

				<div className="row import-news-container">
					<div className="col-md-12">
						<h1 className="article-heading">Import news</h1>
					</div>

					<div className="col-md-12 row-spaced common-background">
						<FormLine
							label={"Filter by words"}
							value={this.state.articleFilterField}
							onChange={(v) => this.changeState("articleFilterField", v)}
						/>
					</div>

					{this.filterRssFeedArticles()
						? <div className={"row"}>
							{this.filterRssFeedArticles().map((a, i) => <div
								className="col-md-12"
								key={i}>
								<RssArticle
									info={a}
									entity={this.state.rssFeedEntities
										&& this.state.rssFeedEntities.filter((c) => a.entity_id === c.id).length > 0
										? this.state.rssFeedEntities.filter((c) => a.entity_id === c.id)[0]
										: null}
								/>
							</div>)}
						</div>
						: <div className="col-md-12">
							<Loading
								height={300}
							/>
						</div>
					}
				</div>
			</div>
		);
	}
}
