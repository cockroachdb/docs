---
title: CockroachDB in Comparison
summary: Learn how CockroachDB compares to other popular databases like PostgreSQL, Cassandra, MongoDB, Google Cloud Spanner, and more.
tags: mongodb, mysql, dynamodb
toc: false
comparison: true
---

This page shows you how key features of CockroachDB stack up against other databases. Hover over features for their intended meanings, and click CockroachDB answers to view related documentation.

<table class="comparison-chart">
  <tr>
    <th></th>
    <th>
      <select data-column="one">
        <option value="MySQL">MySQL</option>
        <option value="PostgreSQL">PostgreSQL</option>
        <option value="Oracle">Oracle</option>
        <option value="Cassandra">Cassandra</option>
        <option value="MongoDB" selected>MongoDB</option>
        <option value="Spanner">Spanner</option>
        <option value="Spanner">Yugabyte</option>
      </select>
    </th>
    <th class="comparison-chart__column-two">
      <select data-column="two">
        <option value="MySQL">MySQL</option>
        <option value="PostgreSQL" selected>PostgreSQL</option>
        <option value="Oracle">Oracle</option>
        <option value="Cassandra">Cassandra</option>
        <option value="MongoDB">MongoDB</option>
        <option value="Spanner">Spanner</option>
        <option value="Spanner">Yugabyte</option>
      </select>
    </th>
    <th>CockroachDB</th>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Database Horizontal Scale
      <a href="#" data-toggle="tooltip" title="Increase capacity of the database by adding more instances/nodes">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL"]'>Manual Sharding</span>
      <span class="support" data-dbs='["Oracle"]'>Add On Configuration</span>
      <span class="support" data-dbs='["AWS Aurora", "MongoDB", "Spanner", "Yugobyte"]'>Node based, Automated read scale, limited write</span>
      <span class="support" data-dbs='["Cassandra"]'>Node based, Automated for both reads and writes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL"]'>Manual Sharding</span>
      <span class="support" data-dbs='["Oracle"]'>Add On Configuration</span>
      <span class="support" data-dbs='["AWS Aurora", "MongoDB", "Spanner", "Yugobyte"]'>Node based, Automated read scale, limited write</span>
      <span class="support" data-dbs='["Cassandra"]'>Node based, Automated for both reads and writes</span>
    </td>
    <td>Node based, Automated for both reads and writes</a></td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Database Load Balancing (internal)
      <a href="#" data-toggle="tooltip" title="Locate data across multiple instances/nodes based on optimization criteria for balancing load">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual - not part of database</span>
      <span class="support" data-dbs='["AWS Aurora"]'>None and Full copies across regions</span>
      <span class="support" data-dbs='["Cassandra", "MongoDB", "Spanner", "Yugobyte"]'>Even distribution to optimize storage</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual - not part of database</span>
      <span class="support" data-dbs='["AWS Aurora"]'>None and Full copies across regions</span>
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
      Automated Repair and RPO
      <a href="#" data-toggle="tooltip" title="Repair the database after failure and the time it takes for the db to come back online">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual Repair RPO ~1-60 mins</span>
      <span class="support" data-dbs='["AWS Aurora"]'>Automated RPO ~1 -5 mins</span>
      <span class="support" data-dbs='["MongoDB", "Cassandra]'>Manual & Automated Repair RPO &lt;1 min</span>
      <span class="support" data-dbs='["Spanner", "Yugabyte]'>"Automated Repair RPO &lt;10 sec"</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual Repair RPO ~1-60 mins</span>
      <span class="support" data-dbs='["AWS Aurora"]'>Automated RPO ~1 -5 mins</span>
      <span class="support" data-dbs='["MongoDB", "Cassandra]'>Manual & Automated Repair RPO &lt;1 min</span>
      <span class="support" data-dbs='["Spanner", "Yugabyte]'>"Automated Repair RPO &lt;10 sec"</span>
    </td>
    <td>Automated Repair RPO &lt;10 sec</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Distributed Reads
      <a href="#" data-toggle="tooltip" title="Reliably read data in any instance/node of the database">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual - Asynchronous</span>
      <span class="support" data-dbs='["AWS Aurora", "MongoDB", "Cassandra", "Spanner", "Yugabyte"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Manual - Asynchronous</span>
      <span class="support" data-dbs='["AWS Aurora", "MongoDB", "Cassandra", "Spanner", "Yugabyte"]'>Yes</span>
    </td>
    <td>Yes</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Distributed Transactions
      <a href="#" data-toggle="tooltip" title="Allow for acid writes across multiple instances/nodes">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>No</span>
      <span class="support " data-dbs='["MongoDB", "Cassandra"]'>Lightweight Transactions only</span>
      <span class="support " data-dbs='["Spanner", "Yugabyrte"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>No</span>
      <span class="support " data-dbs='["MongoDB", "Cassandra"]'>Lightweight Transactions only</span>
      <span class="support " data-dbs='["Spanner", "Yugabyrte"]'>Yes</span>
    </td>
    <td>Yes</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Database Isolation Levels
      <a href="#" data-toggle="tooltip" title="Transaction isolation levels allowed for writes in the database">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>Single Region Consistent Default: Snapshot Highest: Serializable</span>
      <span class="support " data-dbs='["MongoDB"]'>Eventual Consistent Default: Read Uncommited Highest: Snapshot Read</span>
      <span class="support " data-dbs='["Cassandra"]'>Eventual Consistent, No Transaction Isolation Guarantees</span>
      <span class="support " data-dbs='["Spanner", "Yugabyte"]'>Default: Snapshot Highest: Serializable</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>Single Region Consistent Default: Snapshot Highest: Serializable</span>
      <span class="support " data-dbs='["MongoDB"]'>Eventual Consistent Default: Read Uncommited Highest: Snapshot Read</span>
      <span class="support " data-dbs='["Cassandra"]'>Eventual Consistent, No Transaction Isolation Guarantees</span>
      <span class="support " data-dbs='["Spanner", "Yugabyte"]'>Default: Snapshot Highest: Serializable</span>
    </td>
    <td>Guaranteed Consistent Default: Serializable Highest: Serializable</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Potential data issues (default)
      <a href="#" data-toggle="tooltip" title="Possible data inconsistency issues at default isolation level">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>Phantom Reads, Non-repeatable reads, Write skew</span>
      <span class="support " data-dbs='["MongoDB"]'>Dirty Reads, Phantom Reads, Non-repeatable reads, write skew</span>
      <span class="support " data-dbs='["Cassandra"]'>Dirty Reads, Phantom Reads, Non-repeatable reads, write conflicts</span>
      <span class="support " data-dbs='["Spanner"]'>None</span>
      <span class="support " data-dbs='["Yugabyte"]'>Phantom Reads, Non-repeatable reads</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle", "AWS Aurora"]'>Phantom Reads, Non-repeatable reads, Write skew</span>
      <span class="support " data-dbs='["MongoDB"]'>Dirty Reads, Phantom Reads, Non-repeatable reads, write skew</span>
      <span class="support " data-dbs='["Cassandra"]'>Dirty Reads, Phantom Reads, Non-repeatable reads, write conflicts</span>
      <span class="support " data-dbs='["Spanner"]'>None</span>
      <span class="support " data-dbs='["Yugabyte"]'>Phantom Reads, Non-repeatable reads</span>
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
      Database Schema Change
      <a href="#" data-toggle="tooltip" title="Modify database schema across all tables">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Yes</span>
      <span class="support " data-dbs='["AWS Aurora","MongoDB", "Cassandra"]'>Offline</span>
      <span class="support " data-dbs='["Spanner", "Yugabyte"]'>Online, Active, Dynamic</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Yes</span>
      <span class="support " data-dbs='["AWS Aurora","MongoDB", "Cassandra"]'>Offline</span>
      <span class="support " data-dbs='["Spanner", "Yugabyte"]'>Online, Active, Dynamic</span>
    </td>
    <td>Online, Active, Dynamic</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Cost Based Optimization
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
      <span class="support " data-dbs='[ "Cassandra"]'>Yes, Object Level</span>
      <span class="support " data-dbs='["Spanner"]'>Yes</span>
      <span class="support " data-dbs='["Yugabyte"]'>No</span>
    </td>
    <td class="comparison-chart__column-two">
          <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle","AWS Aurora","MongoDB"]'>No</span>
      <span class="support " data-dbs='[ "Cassandra"]'>Yes, Object Level</span>
      <span class="support " data-dbs='["Spanner"]'>Yes</span>
      <span class="support " data-dbs='["Yugabyte"]'>No</span>
    </td>
    <td>Yes, Row level</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Upgrade Method
      <a href="#" data-toggle="tooltip" title="Upgrade the database software">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle","AWS Aurora"]'>Offline</span>
      <span class="support " data-dbs='[ "MongoDB", "Cassandra","Spanner","Yugabyte"]'>Online, Rolling</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle","AWS Aurora"]'>Offline</span>
      <span class="support " data-dbs='[ "MongoDB", "Cassandra","Spanner","Yugabyte"]'>Online, Rolling</span>
    </td>
    <td>Online, Rolling</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      Multi-region
      <a href="#" data-toggle="tooltip" title="Deploy a single database across multiple regions">
        <img src="{{ 'images/v19.2/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Yes - Manual</span>
      <span class="support " data-dbs='[ "AWS Aurora", "MongoDB", "Spanner", "Yugabyte"]'>Yes, but not for writes</span>
      <span class="support " data-dbs='[ "Cassandra"]'>Yes, for reads and writes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support " data-dbs='["MySQL", "PostgreSQL", "Oracle"]'>Yes - Manual</span>
      <span class="support " data-dbs='[ "AWS Aurora", "MongoDB", "Spanner", "Yugabyte"]'>Yes, but not for writes</span>
      <span class="support " data-dbs='[ "Cassandra"]'>Yes, for reads and writes</span>
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
