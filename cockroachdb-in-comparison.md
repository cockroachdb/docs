---
title: CockroachDB in Comparison
toc: false
---

| | CockroachDB | MySQL | PostgreSQL | Cassandra | HBase | MongoDB | Riak 
--|--|--|--|--|--|--|--
Automated Scaling | Yes | No | No | Yes | Yes  | Yes | Yes 
Automated Failover & Repair | Yes | No | No | Yes | Yes | Yes | Yes 
Strong Consistency | Yes | N/A | N/A | No | No | No | No   
Read from any Replica | No | N/A | N/A | Yes | Yes | Yes | Yes  
Distributed Transactions| Yes | No | No | No | No | No | No 
ACID Semantics | Yes | Yes | Yes | No | Row-only | Document-only | No   
SQL| Yes | Yes | Yes | No | No* | No | No 
Open Source| Yes | Yes | Yes | Yes | Yes | Yes | Yes 


Need to find a way to provide addition detail on hover:

\* Apache Pheonix can provide a SQL layer on top 
