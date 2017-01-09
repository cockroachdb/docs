---
title: CockroachDB in Comparison
summary: Learn how CockroachDB compares to other popular databases.
toc: false
optimizely: true
---

<script>
$(function() {
    $('[data-toggle="tooltip"]').tooltip();   
});
</script>

This page shows you how key features of CockroachDB stack up against other databases. Hover over features for their intended meanings, and click CockroachDB answers to view related documentation.

| | CockroachDB | MySQL | PostgreSQL | Oracle | SQL Server |Cassandra | HBase | MongoDB | DynamoDB
--|--|--|--|--|--|--|--|--|--
<a href="#" data-toggle="tooltip" title="Automatic and continuous rebalancing of data between the nodes of a cluster.">Automated Scaling</a> | [Yes](frequently-asked-questions.html#how-does-cockroachdb-scale) | No | No | No | No | Yes | Yes  | Yes | Yes
<a href="#" data-toggle="tooltip" title="Uninterrupted availability of data through small- and large-scale failures, from server restarts to datacenter outages.">Automated Failover</a> | [Yes](frequently-asked-questions.html#how-does-cockroachdb-survive-failures) | Optional | Optional | Optional | Optional | Yes | Yes | Yes | Yes
<a href="#" data-toggle="tooltip" title="Automatic repair of missing data after failures, using unaffected replicas as sources.">Automated Repair</a> | [Yes](frequently-asked-questions.html#how-does-cockroachdb-survive-failures) | No | No | No | No | Yes | Yes | Yes | Yes
<a href="#" data-toggle="tooltip" title="Once a transaction is committed, all reads are guaranteed to see it.">Strongly Consistent Replication</a> | [Yes](frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent) | No | No | Optional | Optional | Optional | No | No | Yes
<a href="#" data-toggle="tooltip" title="Guarantee that progress can be made as long as any majority of nodes is available (e.g., 3 of 5).">Consensus-Based Replication</a> | [Yes](frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent) | No | No | No | No | Optional | No | No | Yes  
<a href="#" data-toggle="tooltip" title="Correctly committed transactions across a distributed cluster, whether it’s a few nodes in a single location or many nodes in multiple datacenters.">Distributed Transactions</a> | [Yes](frequently-asked-questions.html#does-cockroachdb-support-distributed-transactions) | No | No | Yes | Yes | No | No | No | No* 
<a href="#" data-toggle="tooltip" title="Guarantee that every transaction provides atomicity, consistency, isolation, and durability.">ACID Semantics</a> | [Yes](frequently-asked-questions.html#does-cockroachdb-have-acid-semantics) | Yes | Yes | Yes | Yes | No | Row-only | Document-only | Row-only* 
<a href="#" data-toggle="tooltip" title="Optionally allows reading from replicas that do not have the most recently written data.">Eventually Consistent Reads</a> | No | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes 
<a href="#" data-toggle="tooltip" title="Developer endpoint is based on the SQL database query language standard.">SQL</a> | [Yes](frequently-asked-questions.html#why-is-cockroachdb-sql) | Yes | Yes | Yes | Yes | No | No | No | No 
<a href="#" data-toggle="tooltip" title="Source code of the database is freely available for study, change, and distribution to anyone and for any purpose.">Open Source</a> | [Yes](contribute-to-cockroachdb.html) | Yes | Yes | No | No | Yes | Yes | Yes | No 
<a href="#" data-toggle="tooltip" title="Enterprise or expanded version of the database available to paying customers.">Commercial Version</a> | No | Optional | No | Yes | Yes | Optional | Optional | Optional | Yes
<a href="#" data-toggle="tooltip" title='Guidance on database usage and troubleshooting, either "Limited" (free, community-based) or "Full" (paid, 24/7 access to dedicated staff).'>Support</a> | [Limited](contribute-to-cockroachdb.html) | Full | Full | Full | Full | Full | Full | Full | Full

\* In DynamoDB, distributed transactions and ACID semantics across all data in the database, not just per row, requires an additional [transaction library](https://aws.amazon.com/blogs/aws/dynamodb-transaction-library/).