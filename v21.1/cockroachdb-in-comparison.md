---
title: CockroachDB in Comparison
summary: Learn how CockroachDB compares to other popular databases like PostgreSQL, Cassandra, MongoDB, Google Cloud Spanner, and more.
tags: mongodb, mysql, dynamodb
toc: false
comparison: true
---

This page shows you how the key features of CockroachDB stack up against other databases. Hover over the features for their intended meanings, and click CockroachDB answers to view related documentation.

<table class="comparison-chart">
  <tr>
    <th></th>
    <th>
      <select data-column="one">
        <option value="MySQL">MySQL</option>
        <option value="PostgreSQL">PostgreSQL</option>
        <option value="Oracle">Oracle</option>
        <option value="AWS Aurora">AWS Aurora</option>
        <option value="Cassandra">Cassandra</option>
        <option value="MongoDB" selected>MongoDB</option>
        <option value="Spanner">Spanner</option>
        <option value="Yugabyte">Yugabyte</option>
      </select>
    </th>
    <th class="comparison-chart__column-two">
      <select data-column="two">
        <option value="MySQL">MySQL</option>
        <option value="PostgreSQL" selected>PostgreSQL</option>
        <option value="Oracle">Oracle</option>
        <option value="AWS Aurora">AWS Aurora</option>
        <option value="Cassandra">Cassandra</option>
        <option value="MongoDB">MongoDB</option>
        <option value="Spanner">Spanner</option>
        <option value="Yugabyte">Yugabyte</option>
      </select>
    </th>
    <th>CockroachDB</th>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Database horizontal scale
      <a href="#" data-toggle="tooltip" title="Increase capacity of the database by adding more instances/nodes">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL"]'>Manual Sharding</span>
      <span class="support" data-dbs='["Oracle"]'>Add on configuration</span>
      <span class="support" data-dbs='["AWS Aurora", "MongoDB", "Spanner", "Yugobyte"]'>Node based, automated read scale, limited write</span>
      <span class="support" data-dbs='["Cassandra"]'>Node based, automated for both reads and writes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL"]'>Manual Sharding</span>
      <span class="support" data-dbs='["Oracle"]'>Add on configuration</span>
      <span class="support" data-dbs='["AWS Aurora", "MongoDB", "Spanner", "Yugobyte"]'>Node based, automated read scale, limited write</span>
      <span class="support" data-dbs='["Cassandra"]'>Node based, automated for both reads and writes</span>
    </td>
    <td>Node based, automated for both reads and writes</a></td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Database load balancing (internal)
      <a href="#" data-toggle="tooltip" title="Locate data across multiple instances/nodes based on optimization criteria for balancing load">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual - not part of database</span>
      <span class="support" data-dbs='["AWS Aurora"]'>None and full copies across regions</span>
      <span class="support" data-dbs='["Cassandra", "MongoDB", "Spanner", "Yugobyte"]'>Even distribution to optimize storage</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual - not part of database</span>
      <span class="support" data-dbs='["AWS Aurora"]'>None and full copies across regions</span>
      <span class="support" data-dbs='["Cassandra", "MongoDB", "Spanner", "Yugobyte"]'>Even distribution to optimize storage</span>
    </td>
    <td>Detailed options to optimize storage, compute and latency</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Failover
      <a href="#" data-toggle="tooltip" title="Provide access to backup data upon failure">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual - not part of database</span>
      <span class="support" data-dbs='["AWS Aurora"]'>Automated for reads, limited for writes to one region</span>
      <span class="support" data-dbs='["MongoDB", "Cassandra"]'>Automated for reads, limited guarantees for writes</span>
      <span class="support" data-dbs='["Spanner", "Yugabyte"]'>Fully automated for both reads and writes</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual - not part of database</span>
      <span class="support" data-dbs='["AWS Aurora"]'>Automated for reads, limited for writes to one region</span>
      <span class="support" data-dbs='["MongoDB", "Cassandra"]'>Automated for reads, limited guarantees for writes</span>
      <span class="support" data-dbs='["Spanner", "Yugabyte"]'>Fully automated for both reads and writes</span>
    </td>
    <td>Fully automated for both reads and writes</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Automated repair and RPO(Recovery Point Objective)
      <a href="#" data-toggle="tooltip" title="Repair the database after failure and the time it takes for the db to come back online">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual repair RPO ~1-60 mins</span>
      <span class="support" data-dbs='["AWS Aurora"]'>Automated RPO ~1 -5 mins</span>
      <span class="support" data-dbs='["MongoDB", "Cassandra]'>Manual & automated repair RPO &lt;1 min</span>
      <span class="support" data-dbs='["Spanner", "Yugabyte]'>"Automated repair RPO &lt;10 sec"</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual repair RPO ~1-60 mins</span>
      <span class="support" data-dbs='["AWS Aurora"]'>Automated RPO ~1 -5 mins</span>
      <span class="support" data-dbs='["MongoDB", "Cassandra]'>Manual & automated repair RPO &lt;1 min</span>
      <span class="support" data-dbs='["Spanner", "Yugabyte]'>"Automated repair RPO &lt;10 sec"</span>
    </td>
    <td>Automated repair RPO &lt;10 sec</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Distributed reads
      <a href="#" data-toggle="tooltip" title="Reliably read data in any instance/node of the database">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual - asynchronous</span>
      <span class="support" data-dbs='["AWS Aurora", "MongoDB", "Cassandra", "Spanner", "Yugabyte"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual - asynchronous</span>
      <span class="support" data-dbs='["AWS Aurora", "MongoDB", "Cassandra", "Spanner", "Yugabyte"]'>Yes</span>
    </td>
    <td>Yes</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Distributed transactions
      <a href="#" data-toggle="tooltip" title="Allow for acid writes across multiple instances/nodes">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>No</span>
      <span class="support " data-dbs='["MongoDB", "Cassandra"]'>Lightweight transactions only</span>
      <span class="support " data-dbs='["Spanner", "Yugabyrte"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>No</span>
      <span class="support " data-dbs='["MongoDB", "Cassandra"]'>Lightweight transactions only</span>
      <span class="support " data-dbs='["Spanner", "Yugabyrte"]'>Yes</span>
    </td>
    <td>Yes</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Database isolation levels
      <a href="#" data-toggle="tooltip" title="Transaction isolation levels allowed for writes in the database">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>Single region consistent default - Snapshot highest - Serializable</span>
      <span class="support " data-dbs='["MongoDB"]'>Eventual consistent default - Read uncommited highest - Snapshot read</span>
      <span class="support " data-dbs='["Cassandra"]'>Eventual consistent - No transaction isolation guarantees</span>
      <span class="support " data-dbs='["Spanner", "Yugabyte"]'>Default - Snapshot highest - Serializable</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>Single region consistent default - Snapshot highest - Serializable</span>
      <span class="support " data-dbs='["MongoDB"]'>Eventual consistent default - Read uncommited highest - Snapshot read</span>
      <span class="support " data-dbs='["Cassandra"]'>Eventual consistent - No transaction isolation guarantees</span>
      <span class="support " data-dbs='["Spanner", "Yugabyte"]'>Default - Snapshot highest - Serializable</span>
    </td>
    <td>Guaranteed consistent default - Serializable highest - Serializable</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Potential data issues (default)
      <a href="#" data-toggle="tooltip" title="Possible data inconsistency issues at default isolation level">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>Phantom reads, non-repeatable reads, write skew</span>
      <span class="support " data-dbs='["MongoDB"]'>Dirty reads, phantom reads, non-repeatable reads, write skew</span>
      <span class="support " data-dbs='["Cassandra"]'>Dirty reads, phantom reads, non-repeatable reads, write conflicts</span>
      <span class="support " data-dbs='["Spanner"]'>None</span>
      <span class="support " data-dbs='["Yugabyte"]'>Phantom reads, non-repeatable reads</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>Phantom reads, non-repeatable reads, write skew</span>
      <span class="support " data-dbs='["MongoDB"]'>Dirty reads, phantom reads, non-repeatable reads, write skew</span>
      <span class="support " data-dbs='["Cassandra"]'>Dirty reads, phantom reads, non-repeatable reads, write conflicts</span>
      <span class="support " data-dbs='["Spanner"]'>None</span>
      <span class="support " data-dbs='["Yugabyte"]'>Phantom reads, non-repeatable reads</span>
    </td>
    <td>None</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      SQL
      <a href="#" data-toggle="tooltip" title="Compliance with standard SQL">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>Yes</span>
      <span class="support " data-dbs='["MongoDB", "Cassandra"]'>No</span>
      <span class="support " data-dbs='["Spanner", "Yugabyte"]'>Yes - with limitations</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>Yes</span>
      <span class="support " data-dbs='["MongoDB", "Cassandra"]'>No</span>
      <span class="support " data-dbs='["Spanner", "Yugabyte"]'>Yes - with limitations</span>
    </td>
    <td>Yes - wire compatible with PostgreSQL</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Database schema change
      <a href="#" data-toggle="tooltip" title="Modify database schema across all tables">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Yes</span>
      <span class="support " data-dbs='["AWS Aurora","MongoDB", "Cassandra"]'>Offline</span>
      <span class="support " data-dbs='["Spanner", "Yugabyte"]'>Online, Active and Dynamic</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Yes</span>
      <span class="support " data-dbs='["AWS Aurora","MongoDB", "Cassandra"]'>Offline</span>
      <span class="support " data-dbs='["Spanner", "Yugabyte"]'>Online, Active and Dynamic</span>
    </td>
    <td>Online, Active and Dynamic</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Cost based optimization
      <a href="#" data-toggle="tooltip" title="Optimize execution of queries based on transaction analytics">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Yes</span>
      <span class="support " data-dbs='["AWS Aurora","MongoDB", "Cassandra"]'>No</span>
      <span class="support " data-dbs='["Spanner"]'>?</span>
      <span class="support " data-dbs='["Yugabyte"]'>No</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Yes</span>
      <span class="support " data-dbs='["AWS Aurora","MongoDB", "Cassandra"]'>No</span>
      <span class="support " data-dbs='["Spanner"]'>?</span>
      <span class="support " data-dbs='["Yugabyte"]'>No</span>
    </td>
    <td>Yes</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Data Geo-partitoning
      <a href="#" data-toggle="tooltip" title="Tie data to an instance/node to comply with regulations or optimize access latency">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle","AWS Aurora","MongoDB"]'>No</span>
      <span class="support " data-dbs='[ "Cassandra"]'>Yes, object level</span>
      <span class="support " data-dbs='["Spanner"]'>Yes</span>
      <span class="support " data-dbs='["Yugabyte"]'>No</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle","AWS Aurora","MongoDB"]'>No</span>
      <span class="support " data-dbs='[ "Cassandra"]'>Yes, object level</span>
      <span class="support " data-dbs='["Spanner"]'>Yes</span>
      <span class="support " data-dbs='["Yugabyte"]'>No</span>
    </td>
    <td>Yes, row level</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Upgrade method
      <a href="#" data-toggle="tooltip" title="Upgrade the database software">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle","AWS Aurora"]'>Offline</span>
      <span class="support " data-dbs='[ "MongoDB", "Cassandra","Spanner","Yugabyte"]'>Online, rolling</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle","AWS Aurora"]'>Offline</span>
      <span class="support " data-dbs='[ "MongoDB", "Cassandra","Spanner","Yugabyte"]'>Online, rolling</span>
    </td>
    <td>Online, rolling</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Multi-region
      <a href="#" data-toggle="tooltip" title="Deploy a single database across multiple regions">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Yes - manual</span>
      <span class="support " data-dbs='[ "AWS Aurora", "MongoDB", "Spanner", "Yugabyte"]'>Yes, but not for writes</span>
      <span class="support " data-dbs='[ "Cassandra"]'>Yes, for both reads and writes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Yes - manual</span>
      <span class="support " data-dbs='[ "AWS Aurora", "MongoDB", "Spanner", "Yugabyte"]'>Yes, but not for writes</span>
      <span class="support " data-dbs='[ "Cassandra"]'>Yes, for both reads and writes</span>
    </td>
    <td>Yes for both reads and writes</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Multi-cloud
      <a href="#" data-toggle="tooltip" title="Deploy a single database across multiple cloud providers or on-prem">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle","AWS Aurora", "MongoDB", "Spanner","Yugabyte"]'>No</span>
      <span class="support " data-dbs='["Cassandra"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle","AWS Aurora", "MongoDB", "Spanner","Yugabyte"]'>No</span>
      <span class="support " data-dbs='["Cassandra"]'>Yes</span>
    </td>
    <td>Yes</td>
  </tr>

</table>

<div style="display:none;" class="footnote">* In DynamoDB, distributed transactions and ACID semantics across all data in the database, not just per row, requires an additional <a href="https://aws.amazon.com/blogs/aws/dynamodb-transaction-library/">transaction library</a>.</div>
