import React, { Component } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faEdit, faChevronLeft, faChevronRight, faStepBackward, faStepForward } from "@fortawesome/free-solid-svg-icons";
import Filter from './pageactivities/Filter';
import { getRequest, postRequest } from "../utils/request.jsx";
import { NotificationManager as nm } from "react-notifications";
import "./PageActivities.css";


class PageActivities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allActivities: [],
      filteredActivities: [],
      newActivity: {
        date: '',
        start_time: '',
        end_time: '',
        title: '',
        description: '',
        organizers: '',
        link: '',
      },
      editingActivity: null,
      currentPage: 1,
      activitiesPerPage: 5,
      
    };
  }

  
  componentDidMount() {
    getRequest.call(this, `activities/get_activities`, (data) => {
			console.log('ALL ACTivities from server: ');
			console.log(data);
      this.setState({
        allActivities: data.activities,
        filteredActivities: data.activities,
      });
    }, (response) => {
      nm.warning(response.statusText);
    }, (error) => {
      nm.error(error.message);
    });
  }

  handleInputChange = (e, activityType = 'newActivity') => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      [activityType]: {
        ...prevState[activityType],
        [name]: value,
      },
    }));
  };

  addActivity = () => {
    const { newActivity } = this.state;

    postRequest.call(this, "activities/add_activity", newActivity, () => {
     
      this.setState({
        newActivity: {
          date: '',
          start_time: '',
          end_time: '',
          title: '',
          description: '',
          organizers: '',
          link: '',
        },
      });
      nm.success("Activity added successfully");
    }, (response) => {
      nm.warning(response.statusText);
    }, (error) => {
      nm.error(error.message);
    });
  };

  editActivity = (activity) => {
    this.setState({ editingActivity: activity });
  };

  updateActivity = () => {
    const { editingActivity } = this.state;

    postRequest.call(this, "activities/update_activity", editingActivity, () => {
     
      this.setState({ editingActivity: null });
      nm.success("Activity updated successfully");
    }, (response) => {
      nm.warning(response.statusText);
    }, (error) => {
      nm.error(error.message);
    });
  };

  deleteActivity = (id) => {
    postRequest.call(this, "activities/delete_activity", { id }, () => {
      
      nm.success("Activity deleted successfully");
    }, (response) => {
      nm.warning(response.statusText);
    }, (error) => {
      nm.error(error.message);
    });
  };

  filterActivities = (filteredActivities) => {
    this.setState({
      filteredActivities: filteredActivities,
      currentPage: 1, // Reset to first page on filter change
    });
  };

	handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

	formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  renderPagination = () => {
    const { currentPage, activitiesPerPage, filteredActivities } = this.state;
    const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    const renderPageNumbers = () => {
      //const maxPageNumbersToShow = 5;
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
    const { newActivity, editingActivity, filteredActivities, currentPage, activitiesPerPage } = this.state;
		const indexOfLastActivity = currentPage * activitiesPerPage;
    const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
    const currentActivities = filteredActivities.slice(indexOfFirstActivity, indexOfLastActivity);

    return (
      <div className='BoardContainer'>
        <h1 className="dashboard-header">ACTIVITY BOARD</h1>

        <Filter
          activities={this.state.allActivities}
          filterActivities={this.filterActivities}
        />

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Title</th>
              <th>Description</th>
              <th>Organizers</th>
              <th>Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentActivities.map((activity) => (
              <tr key={activity.id}>
                <td>{this.formatDate(activity.date)}</td>
                <td>{activity.start_time}</td>
                <td>{activity.end_time}</td>
                <td>{activity.title}</td>
                <td>{activity.description}</td>
                <td>{activity.organizers}</td>
                <td><a className="ActivityLink" href={activity.link} target="_blank" rel="noopener noreferrer">Link to {activity.title}</a></td>
                <td>
                  <div className="ActivityActions">
                    <button className="icon-button edit-button" onClick={() => this.editActivity(activity)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="icon-button delete-button" onClick={() => this.deleteActivity(activity.id)}>
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {this.renderPagination()}

        <div className="AddActivityContainer">
          <h2 className="dashboard-header">{editingActivity ? 'Edit Activity' : 'Add New Activity'}</h2>
          <form
            className="AddActivityForm"
            onSubmit={(e) => {
              e.preventDefault();
              editingActivity ? this.updateActivity() : this.addActivity();
            }}
          >
            <input
              type="date"
              name="date"
              value={editingActivity ? editingActivity.date : newActivity.date}
              onChange={(e) => this.handleInputChange(e, editingActivity ? 'editingActivity' : 'newActivity')}
            />
            <input
              type="time"
              name="start_time"
              placeholder="Start Time"
              value={editingActivity ? editingActivity.start_time : newActivity.start_time}
              onChange={(e) => this.handleInputChange(e, editingActivity ? 'editingActivity' : 'newActivity')}
            />
            <input
              type="time"
              name="end_time"
              placeholder="End Time"
              value={editingActivity ? editingActivity.end_time : newActivity.end_time}
              onChange={(e) => this.handleInputChange(e, editingActivity ? 'editingActivity' : 'newActivity')}
            />
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={editingActivity ? editingActivity.title : newActivity.title}
              onChange={(e) => this.handleInputChange(e, editingActivity ? 'editingActivity' : 'newActivity')}
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={editingActivity ? editingActivity.description : newActivity.description}
              onChange={(e) => this.handleInputChange(e, editingActivity ? 'editingActivity' : 'newActivity')}
            />
            <input
              type="text"
              name="organizers"
              placeholder="Organizers"
              value={editingActivity ? editingActivity.organizers : newActivity.organizers}
              onChange={(e) => this.handleInputChange(e, editingActivity ? 'editingActivity' : 'newActivity')}
            />
            <input
              type="url"
              name="link"
              placeholder="Link"
              value={editingActivity ? editingActivity.link : newActivity.link}
              onChange={(e) => this.handleInputChange(e, editingActivity ? 'editingActivity' : 'newActivity')}
            />
            <button className="AddButton" type="submit">{editingActivity ? 'Update Activity' : 'Add Activity'}</button>
          </form>
        </div>
      </div>
    );
  }
}

export default PageActivities;
