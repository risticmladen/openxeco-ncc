import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faStepBackward, faStepForward } from "@fortawesome/free-solid-svg-icons";
import Filter from "./board/Filter";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../utils/request.jsx";
import "./ActivityBoard.css";

class ActivityBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allActivities: [],
      filteredActivities: [],
      currentPage: 1,
      activitiesPerPage: 5,
    };
  }

  componentDidMount() {
    getRequest.call(this, `activities/get_activities`, (data) => {
			// console.log('ALL ACTivities from server: ');
			// console.log(data);
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
    const { filteredActivities, currentPage, activitiesPerPage } = this.state;
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
                <td>
                  <a className="ActivityLink" href={activity.link} target="_blank" rel="noopener noreferrer">
                    Link to {activity.title}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {this.renderPagination()}
      </div>
    );
  }
}

export default ActivityBoard;
