---
title: CockroachDB in Comparison
summary: Learn how CockroachDB compares to other popular databases like PostgreSQL, Cassandra, MongoDB, Google Cloud Spanner, and more.
tags: mongodb, mysql, dynamodb
toc: false
optimizely: true
---

This page shows you how key features of CockroachDB stack up against other databases. Hover over features for their intended meanings, and click CockroachDB answers to view related documentation.

<select data-column="one">
  <option value="MySQL" selected>MySQL</option>
  <option value="PostgreSQL">PostgreSQL</option>
  <option value="Oracle">Oracle</option>
  <option value="SQL Server">SQL Server</option>
  <option value="Cassandra">Cassandra</option>
  <option value="HBase">HBase</option>
  <option value="MongoDB">MongoDB</option>
  <option value="DynamoDB">DynamoDB</option>
  <option value="Spanner">Spanner</option>
</select>

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

<table>
  <tr>
    <td><a href="#" data-toggle="tooltip" title="Automatic and continuous rebalancing of data between the nodes of a cluster.">Automated Scaling</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>No</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>No</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><a href="frequently-asked-questions.html#how-does-cockroachdb-scale">Yes</a></td>
  </tr>
  <tr>
    <td><a href="#" data-toggle="tooltip" title="Uninterrupted availability of data through small- and large-scale failures, from server restarts to datacenter outages.">Automated Failover</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>Optional</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>Optional</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><a href="frequently-asked-questions.html#how-does-cockroachdb-survive-failures">Yes</a></td>
  </tr>
  <tr>
    <td><a href="#" data-toggle="tooltip" title="Automatic repair of missing data after failures, using unaffected replicas as sources.">Automated Repair</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>No</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>No</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><a href="frequently-asked-questions.html#how-does-cockroachdb-survive-failures">Yes</a></td>
  </tr>
  <tr>
    <td><a href="#" data-toggle="tooltip" title="Once a transaction is committed, all reads are guaranteed to see it.">Strongly Consistent Replication</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "HBase", "MongoDB"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "Cassandra"]'>Optional</span>
      <span class="support" data-dbs='["DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "HBase", "MongoDB"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "Cassandra"]'>Optional</span>
      <span class="support" data-dbs='["DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><a href="frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent">Yes</a></td>
  </tr>
  <tr>
    <td><a href="#" data-toggle="tooltip" title="Guarantee that progress can be made as long as any majority of nodes is available (e.g., 3 of 5).">Consensus-Based Replication</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "HBase", "MongoDB"]'>No</span>
      <span class="support" data-dbs='["Cassandra"]'>Optional</span>
      <span class="support" data-dbs='["DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "HBase", "MongoDB"]'>No</span>
      <span class="support" data-dbs='["Cassandra"]'>Optional</span>
      <span class="support" data-dbs='["DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><a href="frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent">Yes</a></td>
  </tr>
  <tr>
    <td><a href="#" data-toggle="tooltip" title="Correctly committed transactions across a distributed cluster, whether it’s a few nodes in a single location or many nodes in multiple datacenters.">Distributed Transactions</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Cassandra", "HBase", "MongoDB"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "Spanner"]'>Yes</span>
      <span class="support" data-dbs='["DynamoDB"]'>No*</span>
    </td>
    <td class="column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Cassandra", "HBase", "MongoDB", "DynamoDB"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "Spanner"]'>Yes</span>
      <span class="support" data-dbs='["DynamoDB"]'>No*</span>
    </td>
    <td><a href="frequently-asked-questions.html#does-cockroachdb-support-distributed-transactions">Yes</a></td>
  </tr>
  <tr>
    <td><a href="#" data-toggle="tooltip" title="Guarantee that every transaction provides atomicity, consistency, isolation, and durability.">ACID Semantics</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Spanner"]'>Yes</span>
      <span class="support" data-dbs='["Cassandra"]'>No</span>
      <span class="support" data-dbs='["HBase"]'>Row-only</span>
      <span class="support" data-dbs='["DynamoDB"]'>Row-only*</span>
      <span class="support" data-dbs='["MongoDB"]'>Document-only</span>
    </td>
    <td class="column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Spanner"]'>Yes</span>
      <span class="support" data-dbs='["Cassandra"]'>No</span>
      <span class="support" data-dbs='["HBase"]'>Row-only</span>
      <span class="support" data-dbs='["DynamoDB"]'>Row-only*</span>
      <span class="support" data-dbs='["MongoDB"]'>Document-only</span>
    </td>
    <td><a href="frequently-asked-questions.html#do-transactions-in-cockroachdb-guarantee-acid-semantics">Yes</a></td>
  </tr>
  <tr>
    <td><a href="#" data-toggle="tooltip" title="Optionally allows reading from replicas that do not have the most recently written data.">Eventually Consistent Reads</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td>No</td>
  </tr>
  <tr>
    <td><a href="#" data-toggle="tooltip" title="Developer endpoint is based on the SQL database query language standard.">SQL</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>Yes</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB"]'>No</span>
      <span class="support" data-dbs='["Spanner"]'>Read-only</span>
    </td>
    <td class="column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server"]'>Yes</span>
      <span class="support" data-dbs='["Cassandra", "HBase", "MongoDB", "DynamoDB"]'>No</span>
      <span class="support" data-dbs='["Spanner"]'>Read-only</span>
    </td>
    <td><a href="frequently-asked-questions.html#why-is-cockroachdb-sql">Yes</a></td>
  </tr>
  <tr>
    <td><a href="#" data-toggle="tooltip" title="Source code of the database is freely available for study, change, and distribution to anyone and for any purpose.">Open Source</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Cassandra", "HBase", "MongoDB"]'>Yes</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="column-two">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Cassandra", "HBase", "MongoDB"]'>Yes</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td><a href="contribute-to-cockroachdb.html">Yes</a></td>
  </tr>
  <tr>
    <td><a href="#" data-toggle="tooltip" title="Enterprise or expanded version of the database available to paying customers.">Commercial Version</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "Cassandra", "HBase", "MongoDB"]'>Optional</span>
      <span class="support" data-dbs='["PostgreSQL"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td class="column-two">
      <span class="support" data-dbs='["MySQL", "Cassandra", "HBase", "MongoDB"]'>Optional</span>
      <span class="support" data-dbs='["PostgreSQL"]'>No</span>
      <span class="support" data-dbs='["Oracle", "SQL Server", "DynamoDB", "Spanner"]'>Yes</span>
    </td>
    <td>Optional</td>
  </tr>
  <tr>
    <td><a href="#" data-toggle="tooltip" title='Guidance on database usage and troubleshooting, either "Limited" (free, community-based) or "Full" (paid, 24/7 access to dedicated staff).'>Support</a></td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Full</span>
    </td>
    <td class="column-one">
      <span class="support" data-dbs='["MySQL", "PostgreSQL", "Oracle", "SQL Server", "Cassandra", "HBase", "MongoDB", "DynamoDB", "Spanner"]'>Full</span>
    </td>
    <td><a href="https://www.cockroachlabs.com/pricing/">Full</a></td>
  </tr>
</table>


<div style="display:none;" class="footnote">* In DynamoDB, distributed transactions and ACID semantics across all data in the database, not just per row, requires an additional <a href="https://aws.amazon.com/blogs/aws/dynamodb-transaction-library/">transaction library</a>.</div>

<script>
$(function() {
  function updateChart(db, column) {
    $('.column-'+column+' span.support').each(function() {
      var dbs = $(this).data('dbs');
      if (dbs.indexOf(db) != -1) {
        $(this).show().siblings('.support').hide();
      }
    });

    if (db === 'DynamoDB') {
      $('.footnote').show();
    } else {
      $('.footnote').hide();
    }
  }

  // on load
  $('select').each(function() {
    updateChart($(this).val(), $(this).data('column'));
  });

  $('select').on('change', function() {
    updateChart($(this).val(), $(this).data('column'));
  });

  $('[data-toggle="tooltip"]').tooltip();
});
</script>
