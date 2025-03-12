import "./ForumDetail.css";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import Popup from "reactjs-popup"; // Ensure you have the correct import for Popup
import "react-quill/dist/quill.snow.css";
import React, { Component } from "react";
import { NotificationManager as nm } from "react-notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPen, faPlus, faTrashAlt, faChevronLeft, faChevronRight, faStepBackward, faStepForward,
} from "@fortawesome/free-solid-svg-icons";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { getRequest, postRequest } from "../../utils/request.jsx";
import timeAgo from "../../utils/timeAgo";
import Loading from "../box/Loading.jsx";
import AvatarImg from "../../img/accountAvatar.svg";
import UserGlobal from "../item/user/UserGlobal.jsx";
import { getApiURL } from "../../utils/env.jsx";

class ForumDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forumName: "",
            threads: [],
            users: {}, // Store user data in an object with creator_id as key
            profilePics: {}, // Store user profile pictures
            companies: {}, // Store company data in an object with creator_id as key
            repliesCount: {}, // Store replies count for each thread
            loading: true,
            error: null,
            showEditor: false, // State to control the visibility of the editor
            newThreadName: "", // State to store the new thread name
            newThreadText: "", // State to store the new thread text
            currentUser: null,
            showPopup: false, // State to control the visibility of the popup
            popupUserId: null, // State to store the user ID for the popup
            currentPage: 1, // Current page of threads
            totalPages: 1, // Total number of pages
            order: "desc", // Sort order for latest activity
        };

        this.toggleEditor = this.toggleEditor.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.addNewThread = this.addNewThread.bind(this);
        this.deleteThread = this.deleteThread.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.onOpenPopup = this.onOpenPopup.bind(this);
        this.onClosePopup = this.onClosePopup.bind(this);
        this.fetchThreads = this.fetchThreads.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleOrderChange = this.handleOrderChange.bind(this);
    }

    componentDidMount() {
        const { id } = this.props.match.params;

        getRequest.call(this, `forum/getforumbyid/${id}`, (data) => {
            this.setState({ forumName: data.name });
        }, (error) => {
            this.setState({ error });
            nm.error(error.message);
        });

        this.fetchThreads();
        this.fetchCurrentUser();
    }

    fetchThreads(page = 1) {
        const { id } = this.props.match.params;
        const { order } = this.state;

        this.setState({ loading: true });

        getRequest.call(this, `forum/getlistofthreads/${id}?page=${page}&order=${order}`, (data) => {
            this.setState({
                threads: data.threads,
                loading: false,
                currentPage: data.page,
                totalPages: data.total_pages,
            }, () => {
                this.fetchThreadCreators();
                this.fetchThreadCompanies();
                this.fetchRepliesCount();
            });
        }, (error) => {
            this.setState({ error, loading: false });
            nm.error(error.message);
        });
    }

    fetchCurrentUser() {
        getRequest.call(this, "private/get_my_user", (data) => {
            this.setState({
                currentUser: data,
            });
        }, (response) => {
            nm.warning(response.statusText);
        }, (error) => {
            nm.error(error.message);
        });
    }

    handlePageChange(page) {
        this.fetchThreads(page);
    }

    handleOrderChange(event) {
        this.setState({ order: event.target.value }, () => {
            this.fetchThreads(this.state.currentPage);
        });
    }

    fetchThreadCreators() {
        const { threads } = this.state;
        const uniqueCreatorIds = [...new Set(threads.map((thread) => thread.creator_id))];

        uniqueCreatorIds.forEach((creatorId) => {
            getRequest.call(this, `forum/getthreadcreator/${creatorId}`, (data) => {
                const { _sa_instance_state: saInstanceState, ...userData } = data;
                this.setState((prevState) => ({
                    users: {
                        ...prevState.users,
                        [creatorId]: userData,
                    },
                }), () => {
                    this.fetchUserProfilePicture(creatorId);
                });
            }, (error) => {
                console.log("error on fetch: ", error);
                const creatorNotfound = error.status === 404;

                if (creatorNotfound) {
                    const deletedUserData = {
                        accept_communication: 0,
                        accept_request_notification: 0,
                        attempts: 0,
                        date_login: "0000-00-00 00:00:00",
                        email: null,
                        error_date: "0000-00-00 00:00:00",
                        first_name: "Deleted User",
                        handle: null,
                        id: creatorId,
                        is_active: 0,
                        is_admin: 0,
                        is_vcard_public: null,
                        last_name: "",
                        status: "DELETED",
                        sys_date: "0000-00-00 00:00:00",
                        telephone: null,
                        vcard: null,
                        work_email: null,
                    };

                    this.setState((prevState) => ({
                        users: {
                            ...prevState.users,
                            [creatorId]: deletedUserData,
                        },
                    }));
                } else {
                    this.setState({ error });
                    nm.error(error.message);
                }
            });
        });
    }

    fetchThreadCompanies() {
        const { threads } = this.state;
        const uniqueCreatorIds = [...new Set(threads.map((thread) => thread.creator_id))];

        uniqueCreatorIds.forEach((creatorId) => {
            getRequest.call(this, `forum/getthreadcompany/${creatorId}`, (data) => {
                const { _sa_instance_state: saInstanceState, ...companyData } = data;
                this.setState((prevState) => ({
                    companies: {
                        ...prevState.companies,
                        [creatorId]: companyData,
                    },
                }), () => {
                    console.log(`Company data for creator ID ${creatorId}:`, this.state.companies[creatorId]);
                });
            }, (error) => {
                this.setState({ error });
                nm.error(error.message);
            });
        });
    }

    fetchRepliesCount() {
        const { threads } = this.state;
        threads.forEach((thread) => {
            getRequest.call(this, `forum/getrepliescount/${thread.id}`, (data) => {
                this.setState((prevState) => ({
                    repliesCount: {
                        ...prevState.repliesCount,
                        [thread.id]: data.count || 0, // Default to 0 if undefined
                    },
                }));
            }, (error) => {
                this.setState((prevState) => ({
                    repliesCount: {
                        ...prevState.repliesCount,
                        [thread.id]: 0, // Default to 0 on error
                    },
                }));
                nm.error(error.message);
            });
        });
    }

    fetchUserProfilePicture(userId) {
        const { users } = this.state;
        const user = users[userId];
        if (user) {
            const imageUrl = `${getApiURL()}account/get_profile_image/${userId}`;
            fetch(imageUrl)
                .then((response) => response.json())
                .then((imageData) => {
                    if (imageData.image) {
                        this.setState((prevState) => ({
                            profilePics: {
                                ...prevState.profilePics,
                                [userId]: imageData.image,
                            },
                        }));
                    } else {
                        this.setState((prevState) => ({
                            profilePics: {
                                ...prevState.profilePics,
                                [userId]: null,
                            },
                        }));
                    }
                })
                .catch(() => {
                    this.setState((prevState) => ({
                        profilePics: {
                            ...prevState.profilePics,
                            [userId]: null,
                        },
                    }));
                });
        }
    }

    toggleEditor() {
        this.setState((prevState) => ({
            showEditor: !prevState.showEditor,
            newThreadName: "",
            newThreadText: ""
        }));
    }

    handleBack() {
        this.props.history.goBack();
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    handleTextChange(value) {
        this.setState({ newThreadText: value });
    }

    addNewThread() {
        const { newThreadName, newThreadText, currentUser } = this.state;
        const { id } = this.props.match.params;

        if (!newThreadName.trim()) {
            nm.error("Thread name cannot be empty");
            return;
        }

        if (!newThreadText.trim()) {
            nm.error("Thread content cannot be empty");
            return;
        }

        if (!currentUser) {
            nm.error("Current user not found");
            return;
        }

        const data = {
            name: newThreadName,
            content: newThreadText,
            forum_id: id, // Assuming forum_id is the ID of the current forum
            creator_id: currentUser.id, // Include currentUser ID
        };

        postRequest.call(this, "forum/addthread", data, () => {
            nm.success("Thread added successfully");
            this.setState({ showEditor: false, newThreadName: "", newThreadText: "" });
            this.fetchThreads(); // Reload threads after adding a new one
        }, (error) => {
            this.setState({ error });
            nm.error(error.message);
        });
    }

    deleteThread(threadId) {
        const { currentUser } = this.state;

        if (!currentUser) {
            nm.error("Current user not found");
            return;
        }

        const data = {
            thread_id: threadId,
            creator_id: currentUser.id,
        };

        postRequest.call(this, "forum/deletethread", data, () => {
            nm.success("Thread deleted successfully");
            this.setState({ threads: this.state.threads.filter((thread) => thread.id !== threadId) });
        }, (error) => {
            this.setState({ error });
            nm.error(error.message);
        });
    }

    onOpenPopup(userId) {
        const user = this.state.users[userId];
        if (user && user.status !== "DELETED") {
            this.setState({ showPopup: true, popupUserId: userId });
        } else {
            nm.warning("User information is not available for deleted users.");
        }
    }

    onClosePopup() {
        this.setState({ showPopup: false, popupUserId: null });
    }

    renderPagination = () => {
        const { currentPage, totalPages } = this.state;
        const pageNumbers = [];

        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        const renderPageNumbers = () => {
            const maxPageNumbersToShow = 5;
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            const pagesToShow = pageNumbers.slice(startPage - 1, endPage);

            return pagesToShow.map(number => (
                <button
                    key={number}
                    onClick={() => this.handlePageChange(number)}
                    className={currentPage === number ? 'active' : ''}
                >
                    {number}
                </button>
            ));
        };

        return (
            <div className="pagination">
                <button
                    onClick={() => this.handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    <FontAwesomeIcon icon={faStepBackward} />
                </button>
                <button
                    onClick={() => this.handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                {currentPage > 3 && <span>...</span>}
                {renderPageNumbers()}
                {currentPage < totalPages - 2 && <span>...</span>}
                <button
                    onClick={() => this.handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
                <button
                    onClick={() => this.handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                >
                    <FontAwesomeIcon icon={faStepForward} />
                </button>
            </div>
        );
    };

    render() {
        const {
            forumName, threads, users, profilePics, companies, repliesCount, loading,
            showEditor, newThreadName, newThreadText, currentUser, showPopup, popupUserId,
            currentPage, totalPages, order,
        } = this.state;

        if (loading) {
            return <Loading height={200} />;
        }

        return (
            <div className="forum-detail max-sized-page row-spaced">
                <h2 className="dashboard-header">{forumName}</h2>
                <div className="thread-buttons-container">
                    <button type="button" className="thread-button" onClick={this.handleBack}>
                        <FontAwesomeIcon icon={faChevronLeft} className="icon" />
                        Go Back
                    </button>
                    <button className="thread-button" onClick={this.toggleEditor}>
                        <FontAwesomeIcon icon={faPlus} className="icon" />
                        Start New Discussion
                    </button>
                </div>
                <div className="filter-container">
                    <label>
                        <select name="order" value={order} onChange={this.handleOrderChange}>
                            <option value="asc">Oldest</option>
                            <option value="desc">Newest</option>
                        </select>
                    </label>
                </div>
                {showEditor && (
                    <div className="thread-editor">
                        <input
                            type="text"
                            name="newThreadName"
                            value={newThreadName}
                            onChange={this.handleInputChange}
                            placeholder="Thread Name"
                        />
                        <ReactQuill
                            value={newThreadText}
                            onChange={this.handleTextChange}
                            placeholder="Thread Content"
                            modules={{
                                toolbar: [
                                    [{ header: "1" }, { header: "2" }, { font: [] }],
                                    [{ size: [] }],
                                    ["bold", "italic", "underline", "strike", "blockquote"],
                                    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                                    ["link"],
                                    ["clean"],
                                ],
                            }}
                        />
                        <button type="button" className="thread-button submit-button" onClick={this.addNewThread}>Submit</button>
                    </div>
                )}
                <div className="threads-container">
                    {threads.map((thread) => {
                        let avatarSrc = profilePics[thread.creator_id];
                        let avatarOpacity = 1;

                        if (!avatarSrc) {
                            avatarSrc = AvatarImg;
                            avatarOpacity = 0.5;
                        }

                        let company = "Loading...";
                        if (companies[thread.creator_id]) {
                            if (users[thread.creator_id] && users[thread.creator_id].status === "DELETED") {
                                company = "Deleted User";
                            } else {
                                company = companies[thread.creator_id].entity_name;
                            }
                        }

                        return (
                            <div key={thread.id} className="thread-card">
                                
                              <div className="thread-content">
                                    <Link to={`/forum/${this.props.match.params.id}/thread/${thread.id}`} className="thread-link">
                                        <h3 className="thread-name">{thread.name}</h3>
                                    </Link>
																		<div dangerouslySetInnerHTML={{ __html: thread.content }}></div>
 
                                </div>
																<div className="thread-footer">
                                    <img
                                        className="post-avatar"
                                        style={{ opacity: avatarOpacity }}
                                        src={avatarSrc}
                                        alt="Avatar"
                                        onClick={() => this.onOpenPopup(thread.creator_id)}
                                    />
                                    <div className="post-user-info">
                                        <p
                                            className="post-user-name clickable-text"
                                            onClick={() => this.onOpenPopup(thread.creator_id)}
                                        >
                                            {users[thread.creator_id] ? `${users[thread.creator_id].first_name} ${users[thread.creator_id].last_name}` : "Loading..."}
																					
                                        </p>
                                        <p className="post-company-name">Company: {company}</p>
                                    </div>
                                    <div className="post-details">
                                       
																				<p className="thread-meta">Latest activity: {timeAgo(new Date(thread.last_activity).toLocaleString())}</p>
                                        <p className="thread-meta">{repliesCount[thread.id] !== undefined ? `${repliesCount[thread.id]} comments` : "no comments"}</p>
                               
                                    </div>
                                    {currentUser && (currentUser.id === thread.creator_id
                                    || currentUser.is_admin === 1) &&  (
                                        <div className="thread-options">
                                            
                                            <button className="icon-button delete-button" onClick={() => this.deleteThread(thread.id)}>
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </div>
                                    )}
                                </div>						
                            </div>
                        );
                    })}
                </div>
                {this.renderPagination()}
                {popupUserId && users[popupUserId] && users[popupUserId].status !== "DELETED" && (
                    <Popup
                        className="Popup-full-size"
                        open={showPopup}
                        modal
                        closeOnDocumentClick
                        onClose={this.onClosePopup}
                    >
                        {(close) => (
                            <div className="row">
                                <div className="col-md-9">
                                    <h1 className="dashboard-header">
																		{/* <i className="fas fa-user" style={{ color: 'black' }}/> <span style={{ color: 'black' }}>{popupUserId && users[popupUserId]?.email}</span> */}

                                        <i className="fas fa-user" /> {popupUserId && users[popupUserId]?.email}
                                    </h1>
                                </div>
                                <div className="col-md-3">
                                    <div className={"right-buttons"}>
                                        <button
                                            className={"red-background"}
                                            data-hover="Close"
                                            data-active=""
                                            onClick={close}>
                                            <span><i className="far fa-times-circle" /></span>
                                        </button>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    {popupUserId && <UserGlobal key={popupUserId} id={popupUserId} />}
                                </div>
                            </div>
                        )}
                    </Popup>
                )}
            </div>
        );
    }
}

export default ForumDetail;
