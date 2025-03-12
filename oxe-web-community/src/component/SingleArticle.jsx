import React from "react";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../utils/request.jsx";
import "./SingleArticle.css";
import { getApiURL } from "../utils/env.jsx";
import { getContentFromBlock } from "../utils/article.jsx";
import Loading from "./box/Loading.jsx";

const defaultImage = "/img/only_ncc.png"; // path to the default image

export default class SingleArticle extends React.Component {
	constructor(props) {
		super(props);

		this.getContent = this.getContent.bind(this);

		this.state = {
			article: null,
			loading: true,
			versions: null,
			selectedVersion: null,
			content: null,
			logs: null,
		};

		this._isMounted = false; // Added to track if component is mounted
	}

	componentDidMount() {
		this._isMounted = true; // Mark component as mounted
		const { id } = this.props.match.params;

		// Get the article details
		getRequest.call(this, `article/get_article/${id}`, (data) => {
			if (this._isMounted) {
				this.setState({
					article: data,
					loading: false,
				});
			}
		}, (response) => {
			this.setState({ loading: false });
			nm.warning(response.statusText);
		}, (error) => {
			this.setState({ loading: false });
			nm.error(error.message);
		});

		// Get the article versions
		getRequest.call(this, `article/get_article_versions/${id}`, (data) => {
			const mainVersions = data.filter((v) => v.is_main);

			this.setState({
				versions: data,
				selectedVersion: mainVersions.length > 0 ? mainVersions[0].id : null,
			}, () => {
				// Get the content of the selected version
				this.getContent(this.state.selectedVersion);
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	componentWillUnmount() {
		this._isMounted = false; // Mark component as unmounted
	}

	getContent(versionId) {
		getRequest.call(this, `article/get_article_version_content/${versionId}`, (data) => {
			if (this._isMounted) {
				this.setState({
					content: data,
				}, () => {
					// Get logs for the selected version
					getRequest.call(this, `log/get_update_article_version_logs/${versionId}`, (data2) => {
						if (this._isMounted) {
							this.setState({
								logs: data2.reverse(),
							});
						}
					}, (response) => {
						nm.warning(response.statusText);
					}, (error) => {
						nm.error(error.message);
					});
				});
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		if (this.state.loading) {
			return <Loading />;
		}

		const isDefaultImage = !this.state.article.image;
		const articleImage = isDefaultImage
			? defaultImage
			: `${getApiURL()}public/get_public_image/${this.state.article.image}`;

		const imageClass = isDefaultImage ? "article-image-stretch" : "article-image";

		return (
			<div className="article-page fade-in">
				<div className="article-image-container text-center">
					<img src={articleImage}
						alt="Article"
						className={imageClass} />
				</div>
				<h1 className="single-article-title">{this.state.article.title}</h1>
				<p className="ml-2 pb-5"><i>{this.state.article.publication_date.split("T")[0]}</i></p>
				<div className="single-article-content mb-5 pb-5">
					{this.state.content !== null &&
						this.state.content.map((item, index) => (
							<div key={index}>
								{getContentFromBlock(item)}
							</div>
						))
					}
				</div>
			</div>
		);
	}
}
