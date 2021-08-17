import React, { useEffect, useState } from 'react';
import './App.css';
import { CogniteClient, DoubleDatapoint, Timeseries } from '@cognite/sdk';
import Plot from 'react-plotly.js';
import { Data } from 'plotly.js';

const project = 'publicdata';

function App() {
  const [timeseries, setTimeseries] = useState<Timeseries>();
  const [chartData, setChartData] = useState<Data[]>([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const client = new CogniteClient({ appId: 'Cognite SDK With Plotly' });
    client.loginWithOAuth({
      type: 'CDF_OAUTH',
      options: {
        project,
      },
    });

    // Wait few seconds untill the authentication completes
    setTimeout(async () => {
      // Get a random timeseries object
      const timeseries = await client.timeseries
        .list()
        .autoPagingToArray({ limit: 1 });
      if (timeseries.length > 0) {
        setTimeseries(timeseries[0]);
        console.log('timeseries', timeseries[0]);

        // Get data points for that time series
        const data = await client.datapoints.retrieve({
          items: [{ id: timeseries[0].id }],
        });

        // Arrange timeseries data in to plotly format
        setChartData([
          {
            x: (data[0].datapoints as DoubleDatapoint[]).map(
              (point) => point.timestamp
            ),
            y: (data[0].datapoints as DoubleDatapoint[]).map(
              (point) => point.value
            ),
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'red' },
          },
        ]);
      }
    }, 1000);
  };

  // Return loading message while doing the authentication and data loading
  if (!timeseries) return <>Loading..</>;

  return (
    <div className="App">
      <Plot
        data={chartData}
        style={{ width: '100%', height: '100%' }}
        layout={{
          title: timeseries.name,
          xaxis: {
            title: {
              text: 'Timestamp',
            },
          },
          yaxis: {
            title: {
              text: 'Value',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
