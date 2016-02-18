---
title: CockroachDB in Comparison
toc: false
---

This page shows you how key features of CockroachDB stack up against other databases. 

| | CockroachDB | MySQL | PostgreSQL | Cassandra | HBase | MongoDB | Riak 
--|--|--|--|--|--|--|--
[Automated Scaling](frequently-asked-questions.html#how-does-cockroachdb-scale) | Yes | No | No | Yes | Yes  | Yes | Yes 
[Automated Failover](frequently-asked-questions.html#how-does-cockroachdb-survive-failures) | Yes | No | No | Yes | Yes | Yes | Yes 
[Strong Consistency](frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent) | Yes | N/A | N/A | No | No | No | No   
[Distributed Transactions](frequently-asked-questions.html#does-cockroachdb-support-distributed-transactions)| Yes | No | No | No | No | No | No 
[ACID Semantics](frequently-asked-questions#does-cockroachdb-have-acid-semantics) | Yes | Yes | Yes | No | Row-only | Document-only | No   
[SQL](frequently-asked-questions.html#why-is-cockroachdb-sql)| Yes | Yes | Yes | No | No | No | No 
[Open Source](contribute-to-cockroachdb.html)| Yes | Yes | Yes | Yes | Yes | Yes | Yes 

<!--<script>
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip(); 
});
</script>

<a href="#" data-toggle="tooltip" title="Test">Read from any Replica</a>-->