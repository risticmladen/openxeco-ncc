import React, { Component } from 'react';
import './Filter.css';

class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showFilters: false,
      selectedFilters: {
        date: '',
        start_time: '',
        end_time: '',
        title: '',
        organizers: '',
        description: '',
        link: '',
      },
      sortOption: '', // Add a state variable to track the sorting option
    };
  }

  toggleFilters = () => {
    this.setState((prevState) => ({
      showFilters: !prevState.showFilters,
    }));
  };

  applyFilters = (clear = false) => {
    const { selectedFilters, sortOption } = this.state;
    const { activities } = this.props;

    let filteredActivities = activities.filter((activity) => {
      return (
        (!selectedFilters.date || activity.date.includes(selectedFilters.date)) &&
        (!selectedFilters.start_time || activity.start_time.includes(selectedFilters.start_time)) &&
        (!selectedFilters.end_time || activity.end_time.includes(selectedFilters.end_time)) &&
        (!selectedFilters.title || activity.title.toLowerCase().includes(selectedFilters.title.toLowerCase())) &&
        (!selectedFilters.organizers || activity.organizers.toLowerCase().includes(selectedFilters.organizers.toLowerCase())) &&
        (!selectedFilters.description || activity.description.toLowerCase().includes(selectedFilters.description.toLowerCase())) &&
        (!selectedFilters.link || activity.link.toLowerCase().includes(selectedFilters.link.toLowerCase()))
      );
    });

    // Apply sorting based on the selected sort option
    if (sortOption === 'latest') {
      filteredActivities = filteredActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOption === 'oldest') {
      filteredActivities = filteredActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    const passedActivities = clear ? activities : filteredActivities;
    this.props.filterActivities(passedActivities);
  };

  clearFilters = () => {
    this.setState({
      selectedFilters: {
        date: '',
        start_time: '',
        end_time: '',
        title: '',
        organizers: '',
        description: '',
        link: '',
      },
      sortOption: '', // Reset the sorting option when clearing filters
    }, () => {
      const clear = true;
      this.applyFilters(clear);
    });
  };

  handleFilterChange = (filterType, value) => {
    this.setState(
      (prevState) => ({
        selectedFilters: {
          ...prevState.selectedFilters,
          [filterType]: value,
        },
      }),
      () => this.applyFilters()
    );
  };

  handleSortChange = (event) => {
    this.setState(
      {
        sortOption: event.target.value,
      },
      () => this.applyFilters()
    );
  };

  render() {
    const { showFilters, selectedFilters, sortOption } = this.state;
    const { activities } = this.props;

    return (
      <div className="FilterContainer">
        <div className="FilterButtonsWrapper">
          {showFilters && <button className="ClearButton" onClick={this.clearFilters}>
            Clear
          </button>}
          <button className="FilterButton" onClick={this.toggleFilters}>
            <i className="fa fa-search"></i> Filter
          </button>
        </div>
        {showFilters && (
          <div className="FilterDropdownsContainer">
            <div className="FilterDropdowns">
              <select
                value={selectedFilters.date}
                onChange={(e) => this.handleFilterChange('date', e.target.value)}
              >
                <option value="">Select Date</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.date}>
                    {activity.date}
                  </option>
                ))}
              </select>

              <select
                value={selectedFilters.start_time}
                onChange={(e) => this.handleFilterChange('start_time', e.target.value)}
              >
                <option value="">Select Start Time</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.start_time}>
                    {activity.start_time}
                  </option>
                ))}
              </select>

              <select
                value={selectedFilters.end_time}
                onChange={(e) => this.handleFilterChange('end_time', e.target.value)}
              >
                <option value="">Select End Time</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.end_time}>
                    {activity.end_time}
                  </option>
                ))}
              </select>

              <select
                value={selectedFilters.title}
                onChange={(e) => this.handleFilterChange('title', e.target.value)}
              >
                <option value="">Select Title</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.title}>
                    {activity.title}
                  </option>
                ))}
              </select>

              <select
                value={selectedFilters.organizers}
                onChange={(e) => this.handleFilterChange('organizers', e.target.value)}
              >
                <option value="">Select Organizer</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.organizers}>
                    {activity.organizers}
                  </option>
                ))}
              </select>

              <select
                value={selectedFilters.description}
                onChange={(e) => this.handleFilterChange('description', e.target.value)}
              >
                <option value="">Select Description</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.description}>
                    {activity.description}
                  </option>
                ))}
              </select>

              <select
                value={selectedFilters.link}
                onChange={(e) => this.handleFilterChange('link', e.target.value)}
              >
                <option value="">Select Link</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.link}>
                    {activity.link}
                  </option>
                ))}
              </select>

              {/* Add a dropdown for sorting */}
              <select value={sortOption} onChange={this.handleSortChange}>
                <option value="">Sort By</option>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Filter;
