import React from "react";
import "./NewsPage.css";
import { NotificationManager as nm } from "react-notifications";
import { Link } from "react-router-dom";
import { getRequest } from "../utils/request.jsx";
import { getApiURL } from "../utils/env.jsx";

export default class News extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            articles: null,
            newArticleTitle: "",
            filters: "desc",
            currentPage: 1,
            articlesPerPage: 6,
        };

        this.handleClick = this.handleClick.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
    }

    handleClick(event) {
        this.setState({
            currentPage: Number(event.target.id),
        });
    }

    componentDidMount() {
        this.refresh();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.filters !== this.state.filters) this.refresh();
    }

    refresh() {
        this.setState({
            articles: null,
            loading: true,
        });

        getRequest.call(this, `article/get_articles?status=PUBLIC&type=NEWS&order=${this.state.filters}`, (data) => {
            this.setState({
                articles: data,
                loading: false,
            });
        }, (response) => {
            this.setState({ loading: false });
            nm.warning(response.statusText);
        }, (error) => {
            this.setState({ loading: false });
            nm.error(error.message);
        });
    }

    handleFilterChange(event) {
        this.setState({
            filters: event.target.value,
            currentPage: 1, // Reset to first page on filter change
        });
    }

    render() {
        if (this.state.articles === null) {
            return (<p>Loading...</p>);
        }

        const { articles, currentPage, articlesPerPage } = this.state;

        // Logic for displaying current articles
        const indexOfLastArticle = currentPage * articlesPerPage;
        const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
        const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);

        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(this.state.articles.length / this.state.articlesPerPage); i++) {
            pageNumbers.push(i);
        }

        const renderPageNumbers = pageNumbers.map((number) => (
            <li key={number} id={number} onClick={this.handleClick}>{number}</li>
        ));

        return (
            <div className={"PageHome page max-sized-page row-spaced"}>
                <div className={"row"}>
                    <div className="col-md-10 mb-5">
                        <h1 className="dashboard-header">EUROPEAN NEWS</h1>
                    </div>
                </div>
                <div className="filter-container mb-3">
                    <label className="order-by-label">
                        Order by:
                        <select value={this.state.filters} onChange={this.handleFilterChange} className="ml-2 order-by-select">
                            <option value="desc">Newest</option>
                            <option value="asc">Oldest</option>
                        </select>
                    </label>
                </div>
                <div className="articles-grid">
                    {currentArticles ? (
                        currentArticles.length > 0 ? (
                            currentArticles.map((article) => {
                                const isDefaultImage = !article.image;
                                const imageClass = isDefaultImage ? "news-article-image-default" : "news-article-image-preview";

                                return (
                                    <div key={article.id} className="news-article-card">
                                        <Link to={`/article/${article.id}`}>
                                            <img
                                                src={article.image ? `${getApiURL()}public/get_public_image/${article.image}` : "/img/only_ncc.png"}
                                                className={imageClass}
                                                alt={article.title}
                                            />
                                            <h2 className="news-article-title ml-n2">{article.title}</h2>
                                            <p className="news-publication-date"><i>{article.publication_date.split("T")[0]}</i></p>
                                            <div className="news-article-abstract">
                                                <div dangerouslySetInnerHTML={{ __html: article.abstract }} />
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })
                        ) : (
                            <p>There are no articles at the moment.</p>
                        )
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
                <ul id="page-numbers" className="mt-5">
                    {renderPageNumbers}
                </ul>
            </div>
        );
    }
}
