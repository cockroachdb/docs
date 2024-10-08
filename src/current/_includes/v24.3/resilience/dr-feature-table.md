<table class="comparison-chart">
  <tr>
    <th></th>
    <th>Point-in-time backup & restore</th>
    <th>Physical cluster replication (asynchronous)</th>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>RPO</b>
    </td>
    <td>>=5 minutes</td>
    <td>10s of seconds</a></td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>RTO</b>
    </td>
    <td>Minutes to hours, depending on data size and number of nodes</td>
    <td>Seconds to minutes, depending on cluster size</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Write latency</b>
    </td>
    <td>No impact</td>
    <td>No impact</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Recovery</b>
    </td>
    <td>Manual restore</td>
    <td>Manual failover</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Hardware cost</b>
    </td>
    <td>1x + S3-like storage & networking</td>
    <td>2x + networking between datacenters</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Minimum regions</b>
    </td>
    <td>1</td>
    <td>2</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Fault tolerance</b>
    </td>
    <td>Not applicable</td>
    <td>Zero RPO node, availability zone, region failure with loss up to RPO</td>
  </tr>

</table>
