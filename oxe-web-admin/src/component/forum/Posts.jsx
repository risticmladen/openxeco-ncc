import "./Posts.css";
import React, { Component } from "react";
import "react-quill/dist/quill.snow.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrashAlt, faEdit, faSave, faTimes, faChevronLeft, faChevronRight, faStepBackward, faStepForward,
} from "@fortawesome/free-solid-svg-icons";
import { getRequest, postRequest, postRequestWithFile, getBlobRequest } from "../../utils/request.jsx";
import AvatarImg from "../../img/accountAvatar.svg";
import Loading from "../box/Loading.jsx";
import PostEditor from "./PostEditor.jsx";
import UserGlobal from "../item/user/UserGlobal.jsx";
import { getApiURL } from "../../utils/env.jsx";

class Posts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [],
            users: {},
            profilePics: {}, // Store user profile pictures
            companies: {},
            loading: true,
            error: null,
            showEditor: false, // State to control the visibility of the editor
            newPostText: "", // State to store the new post text
            newPostDocument: null, // State to store the new post document
            currentUser: null,
            activeEditPostId: null, // State to manage the active edit post
            editPostText: "", // State to store the edited post text
            editPostDocument: null, // State to store the edited post document
            thread: [],
            showPopup: false, // State to control the visibility of the popup
            popupUserId: null, // State to store the user ID for the popup
            currentPage: 1, // Current page of posts
            totalPages: 1, // Total number of pages
            order: "desc", // Sort order for latest activity
        };

        this.handleTextChange = this.handleTextChange.bind(this);
        this.addNewPost = this.addNewPost.bind(this);
        this.toggleEditor = this.toggleEditor.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.editPost = this.editPost.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.saveEdit = this.saveEdit.bind(this);
        this.handleEditTextChange = this.handleEditTextChange.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.onOpenPopup = this.onOpenPopup.bind(this);
        this.onClosePopup = this.onClosePopup.bind(this);
        this.fetchPosts = this.fetchPosts.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleOrderChange = this.handleOrderChange.bind(this);
    }

    componentDidMount() {
        this.fetchPosts();
        this.fetchCurrentUser();
    }

    fetchPosts(page = 1) {
        const { threadId } = this.props.match.params;
        const { order } = this.state;

        this.setState({ loading: true });

        getRequest.call(this, `forum/getlistofposts/${threadId}?page=${page}&order=${order}`, (data) => {
            this.setState({
                posts: data.posts,
                loading: false,
                currentPage: data.page,
                totalPages: data.total_pages,
            }, () => {
                this.fetchThreadCreators();
                this.fetchThreadCompanies();
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
        this.fetchPosts(page);
    }

    handleOrderChange(event) {
        this.setState({ order: event.target.value }, () => {
            this.fetchPosts(this.state.currentPage);
        });
    }

    fetchThreadCreators() {
        const { posts } = this.state;
        const uniqueCreatorIds = [...new Set(posts.map((post) => post.creator_id))];

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
                console.log("error: ", error);
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
        const { posts } = this.state;
        const uniqueCreatorIds = [...new Set(posts.map((post) => post.creator_id))];

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

    handleTextChange(value) {
        this.setState({ newPostText: value });
    }

    handleEditTextChange(value) {
        this.setState({ editPostText: value });
    }

    toggleEditor() {
        this.setState((prevState) => ({
            showEditor: !prevState.showEditor,
        }));
    }

    handleBack() {
        this.props.history.goBack();
    }

    deletePost(postId) {
        const data = { post_id: postId };

        postRequest.call(this, "forum/deletepost", data, () => {
            nm.success("Post deleted successfully");
            this.setState({ posts: this.state.posts.filter((post) => post.id !== postId) });
        }, (error) => {
            nm.error(error.message);
        });
    }

    editPost(post) {
        this.setState({
            activeEditPostId: post.id,
            editPostText: post.content,
            editPostDocument: null,
        });
    }

    cancelEdit() {
        this.setState({
            activeEditPostId: null,
            editPostText: "",
            editPostDocument: null,
        });
    }

    saveEdit(postId) {
        const { editPostText, editPostDocument } = this.state;

        if (!editPostText.trim()) {
            nm.error("Post content cannot be empty");
            return;
        }

        const formData = new FormData();
        formData.append('post_id', postId);
        formData.append('content', editPostText);
        if (editPostDocument) {
            formData.append('document', editPostDocument);
        }

        postRequestWithFile.call(this, "forum/editpost", formData, () => {
            nm.success("Post edited successfully");
            this.setState({ activeEditPostId: null, editPostText: "", editPostDocument: null });
            this.fetchPosts(); // Reload posts after editing
        }, (error) => {
            this.setState({ error });
            nm.error(error.message);
        });
    }

    addNewPost() {
        const { newPostText, newPostDocument, currentUser } = this.state;
        const { threadId } = this.props.match.params;

        if (!newPostText.trim()) {
            nm.error("Post content cannot be empty");
            return;
        }

        if (!currentUser) {
            nm.error("Current user not found");
            return;
        }

        const formData = new FormData();
        formData.append('content', newPostText);
        formData.append('thread_id', threadId);
        formData.append('creator_id', currentUser.id);
        if (newPostDocument) {
            formData.append('document', newPostDocument);
        }

        postRequestWithFile.call(this, "forum/addpost", formData, () => {
            nm.success("Post added successfully");
            this.setState({ newPostText: "", newPostDocument: null, showEditor: false });
            this.fetchPosts(); // Reload posts after adding a new one
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

        handleDocumentClick = (postId, filename) => {
            const url = `forum/getpostdocument/${postId}`;
        
            getBlobRequest(url, 
                (blob) => {
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = filename;
        
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
                (response) => {
                    console.error('Bad response:', response);
                },
                (error) => {
                    console.error('Error downloading the document:', error);
                }
            );
        };
	
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
            posts, users, profilePics, companies, loading, showEditor,
            newPostText, newPostDocument, currentUser, activeEditPostId, editPostText, thread,
            showPopup, popupUserId, currentPage, totalPages, order,
        } = this.state;

        if (loading) {
            return <Loading height={200} />;
        }

        return (
            <div className="forum-detail max-sized-page row-spaced">
                <h2 className="dashboard-header">{thread.name}</h2>
                <div className="back-button-container">
                    <button type="button" className="back-button" onClick={this.handleBack}>
                        <FontAwesomeIcon icon={faChevronLeft} className="icon" />
                        Go Back
                    </button>
                </div>
                <div className="filter-container">
                    <label>
                        Order:
                        <select name="order" value={order} onChange={this.handleOrderChange}>
                            <option value="asc">Oldest</option>
                            <option value="desc">Newest</option>
                        </select>
                    </label>
                </div>
                <div className="posts-container">
                    {posts.map((post) => {
                        const user = users[post.creator_id] || {};
                        const company = companies[post.creator_id] || {};
                        const companyName = user.status === "DELETED" ? "Deleted User" : company.entity_name;
                        const isEditing = activeEditPostId === post.id;

                        const lastActivity = post.edited_date === "0000-00-00 00:00:00"
                            ? new Date(post.updated_at).toLocaleString()
                            : new Date(post.edited_date).toLocaleString();

                        let avatarSrc = profilePics[post.creator_id];
                        let avatarOpacity = 1;

                        if (!avatarSrc) {
                            avatarSrc = AvatarImg;
                            avatarOpacity = 0.5;
                        }

                        return (
                            <div key={post.id} className="post-card">
												
																{isEditing ? (
                                     <div className="edit-mode">
                                         <PostEditor postText={editPostText}
                                             handleTextChange={this.handleEditTextChange}
                                             setNewPostDocument={(document) => this.setState({ editPostDocument: document })} // Set edited document
                                         />
                                         <div className="edit-buttons">
                                             <button type="button" className="save-button" onClick={() => this.saveEdit(post.id)}>
                                                 <FontAwesomeIcon icon={faSave} /> Save
                                             </button>
                                             <button type="button" className="cancel-button" onClick={this.cancelEdit}>
                                             <FontAwesomeIcon icon={faTimes} /> Cancel
                                             </button>
                                         </div>
                                     </div>
                                 ) : (
                                        <div>
                                            <div
                                                className="post-content"
                                                dangerouslySetInnerHTML={{ __html: post.content }}
                                            ></div>
                                            {post.filename && (
                                                <div className="post-documents">
                                                  <p>
                                                     Document:
                                                        <a
                                                            href="#"
                                                            onClick={() => this.handleDocumentClick(post.id, post.filename)}
                                                            download={post.filename}
                                                        >
                                                            {post.filename}
                                                         </a>
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                        )}

                                <div className="post-header">
                                    <img
                                        className="post-avatar"
                                        style={{ opacity: avatarOpacity }}
                                        src={avatarSrc}
                                        alt="Avatar"
                                        onClick={() => this.onOpenPopup(post.creator_id)}
                                    />
                                    <div className="post-user-info">
                                        <p
                                            className="post-user-name clickable-text"
                                            onClick={() => this.onOpenPopup(post.creator_id)}
                                        >
                                            {user.first_name} {user.last_name}
                                        </p>
                                        <p className="post-company-name">{"Company: " + companyName}</p>
                                    </div>
                                    <div className="post-details">
                                        <p className="post-updated-at">
                                            Last activity: {lastActivity}
                                            {post.edited_date !== "0000-00-00 00:00:00" && <span className="edited-label"> (Edited)</span>}
                                        </p>
                                       
                                    </div>
                                    {currentUser && (currentUser.id === post.creator_id
                                    || currentUser.is_admin === 1) && !isEditing && (
                                        <div className="post-menu">
                                            <button className="icon-button edit-button" onClick={() => this.editPost(post)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className="icon-button delete-button" onClick={() => this.deletePost(post.id)}>
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
                <button className="toggle-editor-button" onClick={this.toggleEditor}>
                    {showEditor ? "Cancel" : "Add New Post"}
                </button>
                {showEditor && (
                    <div className="new-post-editor">
                        <PostEditor 
                            postText={newPostText} 
                            handleTextChange={this.handleTextChange}
                            setNewPostDocument={(document) => this.setState({ newPostDocument: document })} // Set new post document
                        />
                        <button onClick={this.addNewPost} className="post-button">Post</button>
                    </div>
                )}
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
                                        <i className="fas fa-user" style={{ color: 'black' }}/> <span style={{ color: 'black' }}>{popupUserId && users[popupUserId]?.email}</span>
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

export default Posts;
