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
        <option value="SQL Server">SQL Server</option>
        <option value="Cassandra">Cassandra</option>
        <option value="HBase">HBase</option>
        <option value="MongoDB" selected>MongoDB</option>
        <option value="DynamoDB">DynamoDB</option>
        <option value="Spanner">Spanner</option>
      </select>
    </th>
    <th class="comparison-chart__column-two">
      <select data-column="two">
        <option value="MySQL">MySQL</option>
        <option value="PostgreSQL" selected>PostgreSQL</option>
        <option value="Oracle">Oracle</option>
        <option value="SQL Server">SQL Server</option>
        <option value="Cassandra">Cassandra</option>
        <option value="HBase">HBase</option>
        <option value="MongoDB">MongoDB</option>
        <option value="DynamoDB">DynamoDB</option>
        <option value="Spanner">Spanner</option>
      </select>
    </th>
    <th>CockroachDB</th>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      Automated Scaling
      <a href="#" data-toggle="tooltip" title="Automatic and continuous rebalancing of data between the nodes of a cluster.">
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support gray" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>No</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support gray" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>No</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><a class="comparison-chart__link" href="frequently-asked-questions.html#how-does-cockroachdb-scale">Yes</a></td>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      Automated Failover
      <a href="#" data-toggle="tooltip" title="Uninterrupted availability of data through small- and large-scale failures, from server restarts to datacenter outages.">
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>Optional</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>Optional</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><a class="comparison-chart__link" href="frequently-asked-questions.html#how-does-cockroachdb-survive-failures">Yes</a></td>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      Automated Repair
      <a href="#" data-toggle="tooltip" title="Automatic repair of missing data after failures, using unaffected replicas as sources.">
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support gray" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>No</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support gray" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>No</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><a class="comparison-chart__link" href="frequently-asked-questions.html#how-does-cockroachdb-survive-failures">Yes</a></td>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      Strongly Consistent Replication
      <a href="#" data-toggle="tooltip" title="Once a transaction is committed, all reads are guaranteed to see it.">
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support gray" data-dbs='["MySQL", "PostgreSQL", "HBase", "MongoDB"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "Cassandra"]'>Optional</span>
      <span class="support" data-dbs='["DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support gray" data-dbs='["MySQL", "PostgreSQL", "HBase", "MongoDB"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "Cassandra"]'>Optional</span>
      <span class="support" data-dbs='["DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><a class="comparison-chart__link" href="frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent">Yes</a></td>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      Consensus-Based Replication
      <a href="#" data-toggle="tooltip" title="Guarantee that progress can be made as long as any majority of nodes is available (e.g., 3 of 5).">
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support gray" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "HBase", "MongoDB"]'>No</span>
      <span class="support" data-dbs='["Cassandra"]'>Optional</span>
      <span class="support" data-dbs='["DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support gray" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "HBase", "MongoDB"]'>No</span>
      <span class="support" data-dbs='["Cassandra"]'>Optional</span>
      <span class="support" data-dbs='["DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><a class="comparison-chart__link" href="frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent">Yes</a></td>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      Distributed Transactions
      <a href="#" data-toggle="tooltip" title="Correctly committed transactions across a distributed cluster, whether it’s a few nodes in a single location or many nodes in multiple datacenters.">
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support gray" data-dbs='["MySQL", "PostgreSQL", "Cassandra", "HBase", "MongoDB"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "Spanner"]'>Yes</span>
      <span class="support gray" data-dbs='["DynamoDB"]'>No*</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support gray" data-dbs='["MySQL", "PostgreSQL", "Cassandra", "HBase", "MongoDB", "DynamoDB"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "Spanner"]'>Yes</span>
      <span class="support gray" data-dbs='["DynamoDB"]'>No*</span>
    </td>
    <td><a class="comparison-chart__link" href="frequently-asked-questions.html#does-cockroachdb-support-distributed-transactions">Yes</a></td>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      ACID Semantics
      <a href="#" data-toggle="tooltip" title="Guarantee that every transaction provides atomicity, consistency, isolation, and durability.">
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Spanner"]'>Yes</span>
      <span class="support gray" data-dbs='["Cassandra"]'>No</span>
      <span class="support" data-dbs='["HBase"]'>Row-only</span>
      <span class="support" data-dbs='["DynamoDB"]'>Row-only*</span>
      <span class="support" data-dbs='["MongoDB"]'>Document-only</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Spanner"]'>Yes</span>
      <span class="support gray" data-dbs='["Cassandra"]'>No</span>
      <span class="support" data-dbs='["HBase"]'>Row-only</span>
      <span class="support" data-dbs='["DynamoDB"]'>Row-only*</span>
      <span class="support" data-dbs='["MongoDB"]'>Document-only</span>
    </td>
    <td><a class="comparison-chart__link" href="frequently-asked-questions.html#do-transactions-in-cockroachdb-guarantee-acid-semantics">Yes</a></td>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      Eventually Consistent Reads
      <a href="#" data-toggle="tooltip" title="Optionally allows reading from replicas that do not have the most recently written data.">
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><span class="gray comparison-chart__cockroach">No</span></td>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      SQL
      <a href="#" data-toggle="tooltip" title="Developer endpoint is based on the SQL database query language standard.">
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>Yes</span>
      <span class="support gray" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB"]'>No</span>
      <span class="support" data-dbs='["Spanner"]'>Read-only</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>Yes</span>
      <span class="support gray" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB"]'>No</span>
      <span class="support" data-dbs='["Spanner"]'>Read-only</span>
    </td>
    <td><a class="comparison-chart__link" href="frequently-asked-questions.html#why-is-cockroachdb-sql">Yes</a></td>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      Open Source
      <a href="#" data-toggle="tooltip" title="Source code of the database is freely available for study, change, and distribution to anyone and for any purpose.">
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Cassandra", "HBase", "MongoDB"]'>Yes</span>
      <span class="support gray" data-dbs='["Oracle", "SQL Server", "DynamoDB", "Spanner"]'>No</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Cassandra", "HBase", "MongoDB"]'>Yes</span>
      <span class="support gray" data-dbs='["Oracle", "SQL Server", "DynamoDB", "Spanner"]'>No</span>
    </td>
    <td><a class="comparison-chart__link" href="https://wiki.crdb.io/wiki/spaces/CRDB/pages/73204033/Contributing+to+CockroachDB" target="_blank" rel="noopener">Yes</a></td>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      Commercial Version
      <a href="#" data-toggle="tooltip" title="Enterprise or expanded version of the database available to paying customers.">
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "Cassandra", "HBase", "MongoDB"]'>Optional</span>
      <span class="support gray" data-dbs='["PostgreSQL"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support" data-dbs='["MySQL", "Cassandra", "HBase", "MongoDB"]'>Optional</span>
      <span class="support gray" data-dbs='["PostgreSQL"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><span class="comparison-chart__cockroach">Optional</span></td>
  </tr>
  <tr>
    <td class="comparison-chart__feature">
      Support
      <a href="#" data-toggle="tooltip" title='Guidance on database usage and troubleshooting, either "Limited" (free, community-based) or "Full" (paid, 24/7 access to dedicated staff).'>
        <img src="{{ 'images/v2.1/icon_info.svg' | relative_url }}" alt="tooltip icon">
      </a>
    </td>
    <td class="comparison-chart__column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Full</span>
    </td>
    <td class="comparison-chart__column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Full</span>
    </td>
    <td><a class="comparison-chart__link" href="https://www.cockroachlabs.com/pricing/">Full</a></td>
  </tr>
</table>

<div style="display:none;" class="footnote">* In DynamoDB, distributed transactions and ACID semantics across all data in the database, not just per row, requires an additional <a href="https://aws.amazon.com/blogs/aws/dynamodb-transaction-library/">transaction library</a>.</div>
