import React from "react";
import "./UserUser.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "./box/Loading.jsx";
import DynamicTable from "./table/DynamicTable.jsx";
import { getRequest } from "../utils/request.jsx";
import User from "./item/User.jsx";
import { dictToURI } from "../utils/url.jsx";

export default class UserUser extends React.Component {
	constructor(props) {
		super(props);

		this.fetchUsers = this.fetchUsers.bind(this);

		this.state = {
			users: null,
			pagination: null,
			email: null,
			provisoryPassword: "ProvisoryPassword!" + (Math.floor(Math.random() * 90000) + 10000),
			page: 1,
			per_page: 10,
			filters: {
				email: null,
				first_name: null,
			},
			currentUser: null, // Store current user info
		};
	}

	componentDidMount() {
		this.fetchCurrentUser(); // Fetch user details first
	}

	// Fetch the current logged-in user
	fetchCurrentUser() {
		getRequest.call(this, "private/get_my_user", (userData) => {
			this.setState({ currentUser: userData }, () => {
				this.refresh(); // Fetch users after getting user data
			});
		}, (error) => {
			nm.warning("Failed to get user info");
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.filters !== this.state.filters) this.refresh();
	}

	refresh() {
		this.setState({
			users: null,
			page: 1,
		}, () => {
			this.fetchUsers();
		});
	}

	fetchUsers(page) {
		this.setState({
			users: null,
		});
	
		const params = {
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: 10,
			...this.state.filters,
			first_name: this.state.filters.first_name,
			last_name: this.state.filters.last_name,
		};
	
		getRequest.call(this, "user/get_accept_status_users?" + dictToURI(params), (data) => {
			this.setState({
				users: data.items,
				pagination: data.pagination,
				page,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}
	

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		if (!this.state.currentUser) {
			return <Loading height={500} />;
		}

		const columns = [
			{
				Header: "Company name",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<User
						id={value.id}
						email={value.email}
						company={value.entity_name}
						name={value.first_name + ' ' + value.last_name}
						afterDeletion={() => this.refresh()}
					/>
				),
			},
			{
				Header: "Is admin",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.is_admin === 1 ? "Yes" : ""
				),
				width: 50,
			},
			{
				Header: "Is active",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.is_active === 1 ? "Yes" : ""
				),
				width: 50,
			},
		];

		return (
			<div id="UserUser" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1 className="dashboard-header">
							{this.state.pagination !== null ? this.state.pagination.total : 0} User
							{this.state.pagination !== null && this.state.pagination.total > 1 ? "s" : ""}
						</h1>
						<div className="top-right-buttons">
							<button onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
					<div className="col-md-12 PageEntity-table">
						{this.state.users !== null && this.state.pagination !== null ? (
							<DynamicTable
								columns={columns}
								items={this.state.users}
								pagination={this.state.pagination}
								changePage={this.fetchUsers}
								buildElement={(user) => (
									<div key={user.id} className="col-md-12">
										<User
											id={user.id}
											email={user.email}
											isAdmin={user.is_admin}
											isActive={user.is_active}
											afterDeletion={() => this.refresh()}
										/>
									</div>
								)}
							/>
						) : (
							<Loading height={500} />
						)}
					</div>
				</div>
			</div>
		);
	}
}
