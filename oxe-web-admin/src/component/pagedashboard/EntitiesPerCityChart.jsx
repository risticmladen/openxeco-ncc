import React from 'react';
import { Bar } from 'react-chartjs-2';
import Loading from "../box/Loading.jsx";

class EntitiesPerCityChart extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { entitiesAddresses, filteredEntities, filters, entities } = this.props;
    const { is_startup } = filters;
    console.log('Cities Chart for Entities');
    console.log("entitiesAddresses, filteredEntities, filters, entities");
    console.log(entitiesAddresses, filteredEntities, filters, entities);

    const cities = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Paralimni"];
    
    // Define an array of colors for each city
		const defaultBackgroundColors = [
      "rgba(255, 99, 132, 0.5)",   // Red with 50% opacity
      "rgba(54, 162, 235, 0.5)",   // Blue with 50% opacity
      "rgba(204, 101, 254, 0.5)",  // Purple with 50% opacity
      "rgba(255, 206, 86, 0.5)",   // Yellow with 50% opacity
      "rgba(75, 192, 192, 0.5)"    // Teal with 50% opacity
    ];
    const defaultBorderColors = [
      "rgba(255, 99, 132, 1)",     // Red with 100% opacity
      "rgba(54, 162, 235, 1)",     // Blue with 100% opacity
      "rgba(204, 101, 254, 1)",    // Purple with 100% opacity
      "rgba(255, 206, 86, 1)",     // Yellow with 100% opacity
      "rgba(75, 192, 192, 1)"      // Teal with 100% opacity
    ];

    // Create backgroundColor and borderColor arrays with appropriate lengths
    let backgroundColor;
    let borderColor;
    
    // Modify background and border color based on `is_startup`
    if (is_startup) {
      backgroundColor = Array(cities.length).fill("rgba(254, 215, 218, 0.5)"); // Light pink with 50% opacity
      borderColor = Array(cities.length).fill("rgba(228, 6, 19, 1)");  
		} else {
      backgroundColor = defaultBackgroundColors;
      borderColor = defaultBorderColors;
    }

    // Ensure entitiesAddresses is not null and filter out null/undefined addresses
    const validEntitiesAddresses = entitiesAddresses ? entitiesAddresses.filter(o => o && o.city) : [];

    const cityCounts = cities.map(city =>
      validEntitiesAddresses.filter(o => o.city === city).length
    );

    return (
      <div className="col-md-6 row-spaced">
        <h3>Number of entities per city</h3>
        <div className="row">
          <div className="col-md-12 mt-5">
            {entitiesAddresses || filteredEntities ? (
              <Bar
                data={{
                  labels: cities,
                  datasets: [
                    {
                      label: 'Entities per city',
                      data: cityCounts,
                      backgroundColor: backgroundColor,
                      borderColor: borderColor,
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  legend: {
                    display: false,
                  },
                  scales: {
                    yAxes: [
                      {
                        ticks: {
                          beginAtZero: true,
                          stepSize: 1,
                        },
                        gridLines: {
                          display: false,
                        },
                      },
                    ],
                    xAxes: [
                      {
                        gridLines: {
                          display: false,
                        },
                      },
                    ],
                  },
                }}
              />
            ) : (
              <Loading height={300} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default EntitiesPerCityChart;
