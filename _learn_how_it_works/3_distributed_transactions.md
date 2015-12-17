---
title: Distributed Transactions
---

CockroachDB implements efficient, fully-serializable distributed transactions. What exactly is the difference between “repeatable read” and “serializable”? With CockroachDB, it’s a moot point. Stop using external locking mechanisms or half measures like CAS or “lightweight” transactions. CockroachDB transactions are integral and high performance, freeing developers to build applications.

-	Easily build consistent applications
-	Optimistic concurrency without locking
-	Efficient two phase commit
-	Serializable default isolation level
