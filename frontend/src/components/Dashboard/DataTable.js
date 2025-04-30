import React from "react";

const DataTable = ({ dataRows }) => (
  <table className="table table-bordered table-striped">
    <thead className="table-dark">
      <tr>
        <th>Timestamp</th>
        <th>Temp (°C)</th>
        <th>Alt (m)</th>
        <th>Pres (hPa)</th>
        <th>Lat</th>
        <th>Lng</th>
        <th>ax</th>
        <th>ay</th>
        <th>az</th>
        <th>gx</th>
        <th>gy</th>
        <th>gz</th>
      </tr>
    </thead>
    <tbody>
      {dataRows.map((row, i) => (
        <tr key={i}>
          <td>{new Date(row.timestamp).toLocaleString()}</td>
          <td>{row.temp?.toFixed(2)}</td>
          <td>{row.alt?.toFixed(2)}</td>
          <td>{row.pres?.toFixed(2)}</td>
          <td>{row.lat?.toFixed(4)}</td>
          <td>{row.lng?.toFixed(4)}</td>
          <td>{row.ax}</td>
          <td>{row.ay}</td>
          <td>{row.az}</td>
          <td>{row.gx}</td>
          <td>{row.gy}</td>
          <td>{row.gz}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default DataTable;
