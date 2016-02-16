---
title: CockroachDB in Comparison
toc: false
---

| | CockroachDB | MySQL | Postgre | Cassandra | HBase | MongoDB | Riak 
--|--|--|--|--|--|--|--
Automated Scaling & Repair| Yes | No | No |  |  | No | Yes 
Synchronous Replication | Yes | No | No |  |  | No |  
Automatic Failover | Yes | No | No |  |  |  | Yes 
Read from Any Replica | No |  |  |  |  | Yes |  
Distributed Transactions| Yes | No | No |  |  |  |  
ACID Semantics | Yes |  |  |  |  |  |   
Strong Consistency | Yes | | | | | | Yes   
SQL| Yes | Yes | Yes | No | No* | No | No 
Open Source| Yes | Yes | Yes | Yes | Yes | Yes | Yes 


Need to find a way to provide addition detail on hover:

\* Apache Pheonix can provide a SQL layer on top 
