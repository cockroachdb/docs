---
title: CockroachDB in Comparison
toc: false
---

<script>
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
});
</script>

This page shows you how key features of CockroachDB stack up against other databases. 

{{site.data.alerts.callout_info}}Hover over features for their intended meanings, and click answers to view related documentation.{{site.data.alerts.end}}

| | CockroachDB | MySQL | PostgreSQL | Oracle | Cassandra | HBase | MongoDB | DynamoDB
--|--|--|--|--|--|--|--|--|--
<a href="#" data-toggle="tooltip" title="Automatic and continuous rebalancing of data between the nodes of a cluster.">Automated Scaling</a> | [Yes](frequently-asked-questions.html#how-does-cockroachdb-scale) | [No](https://dev.mysql.com/doc/refman/5.7/en/ha-overview.html) | No | ? | Yes | Yes  | Yes | ?
<a href="#" data-toggle="tooltip" title="Uninterrupted availability of data through small- and large-scale failures, from server restarts to datacenter outages.">Automated Failover</a> | [Yes](frequently-asked-questions.html#how-does-cockroachdb-survive-failures) | [Yes](https://dev.mysql.com/doc/mysql-utilities/1.5/en/utils-task-autofailover.html) | No | ? | Yes | Yes | Yes | ?
<a href="#" data-toggle="tooltip" title="Automatic repair of missing data after failures, using unaffected replicas as sources.">Automated Repair</a> | [Yes](frequently-asked-questions.html#how-does-cockroachdb-survive-failures) | No | No | ? | Yes | Yes | Yes | ?
<a href="#" data-toggle="tooltip" title="Guarantee that any majority of replicas (e.g., 2 out of 3) can always provide the most recently written data on reads.">Strongly Consistent Replication</a> | [Yes](frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent) | N/A | N/A | ?| No | No | No | ?   
<a href="#" data-toggle="tooltip" title="Replication across geographically distributed nodes.">Geo-Replication</a> | [Yes](frequently-asked-questions.html#how-does-cockroachdb-scale) | ? | ? | ? | ? | ? | ? | ?  
<a href="#" data-toggle="tooltip" title="Correctly committed transactions across a distributed cluster, whether it’s a few nodes in a single location or many nodes in multiple datacenters.">Distributed Transactions</a> | [Yes](frequently-asked-questions.html#does-cockroachdb-support-distributed-transactions) | No | No | ? | No | No | No | ? 
<a href="#" data-toggle="tooltip" title="Guarantee that every transaction provides atomicity, consistency, isolation, and durability.">ACID Semantics</a> | [Yes](frequently-asked-questions#does-cockroachdb-have-acid-semantics) | [Yes](https://dev.mysql.com/doc/refman/5.7/en/faqs-general.html#faq-mysql-have-acid-transactions) | Yes | ? | No | Row-only | Document-only | ?   
<a href="#" data-toggle="tooltip" title="Ability to read from replicas that do not have the most recently written data.">Eventually Consistent Reads</a> | No | N/A | N/A | ? | ? | ? | ? | ?     
<a href="#" data-toggle="tooltip" title="Developer endpoint is based on the SQL database query language standard.">SQL</a> | [Yes](frequently-asked-questions.html#why-is-cockroachdb-sql) | Yes | Yes | ? | No | No | No | ? 
<a href="#" data-toggle="tooltip" title="Source code of the database is freely available for study, change, and distribution to anyone and for any purpose.">Open Source</a> | [Yes](contribute-to-cockroachdb.html) | Yes | Yes | ? | Yes | Yes | Yes | ? 
<a href="#" data-toggle="tooltip" title="Enterpise or expanded version of the database available to paying customers.">Commercial Version</a> | No | ? | ? | ? | ? | ? | ? | ?
<a href="#" data-toggle="tooltip" title='Guidance on database usage and troubleshooting, either "Limited" (free, community-based) or "Full" (paid, 24/7 access to dedicated staff).'>Support</a> | [Limited](contribute-to-cockroachdb.html#get-in-touch) | ? | ? | Full | ? | ? | ? | ?

\* Not available out-of-the box.