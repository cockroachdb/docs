---
title: Transaction retry errors
summary: Discussion on the purpose and frequency of serializability errors
toc: true
---

CockroachDB sometimes returns error code 40001 to clients, which is an
invitation to disregard any result obtained in the transaction or
statement being committed and try running the transaction or query
again.

The following page discusses why this error exists and discusses when it occurs.

# Background

Why do retries need to exist at all?

The entire stated premise of database isolation is to provide the
illusion that every transaction in the database is a completely
independent actor that doesn’t need to concern itself with the
internal behavior of any other transaction — only their final effect
on the database.

For this reason, many users are confused when some databases, like
CockroachDB but also PostgreSQL, tell them that they need to be
prepared to re-issue their query if something goes wrong.

This behavior is counter-intuitive to the notion that the database
could handle isolation as a service to the client. Does a retry error
indicate the database is insufficiently or incorrectly able to provide
isolation? Isn't it the database's job to, like, not do that? Or at
least be able to sort it out itself if there is a doubt?

There are two distinct questions here:

- why can’t the db solve this problematic state own its own after it occurs, and
- why can’t the db prevent me from getting into this problematic state in the first place?

# Atomicity with interactive transactions

The hurdle causing (1) is really that the database doesn’t control the
rest of the universe. This is more about maintaining atomicity
(reminder: the **A** in ACID) than it is about “having another go at
it”. When the database decides the transaction can no longer be
committed for some reason, it needs to make sure that everything that
happened as a result of that transaction is undone.

This includes reverting decisions made client-side using the data
**returned by the database while the txn was open**, such as:

- whether to advance the program counter in the driving application,
- whether to send an email to a user,
- whether to send a package through the postal service.

In a traditional conversational SQL model, there’s no way for the
database to guarantee that these things will be rolled back without
informing the user that they need to do it themselves. In most cases
this means requiring the application to not take irreversible actions
until the transaction has successfully committed; but there is no way
to enforce this in the SQL protocol.

Some other SQL engines will avoid this problem by **preventing
interactive transactions**, i.e. disallow a client from observing the
result of an intermediate statement before it issues another statement
while the txn is open. When a SQL engine only supports non-interactive
transactions, it can freely decide to delay reporting the results
until a txn is successfully committed, and handle txn retries
internally itself. CockroachDB does not do this because it supports
the PostgreSQL dialect which mandates support for interactive
transactions.

# Transaction scheduling

What is causing hurdle (2) above?

Shouldn't the database have a sophisticated transaction scheduler?

If it had, it would intelligently provide concurrency, make
transactions run as soon as theoretically possible, but prevent wrong
orderings not allowed by serializability.

The difficulty with this is twofold:

1. To decide a good ordering requires a precise
   analysis of the possible conflicts between transactions, also
   called "dependency analysis". There are two main obstacles to being
   able to do that in the first place:
   - SQL is pretty expressive:
     ```
       SELECT x FROM a WHERE y = (SELECT q FROM b LIMIT 1)
     ```
     To determine the set of dependencies may require running a (sub-)query.
   - For transactions containing more than 1 statement (interactive),
     the set of dependencies is not computable, because the
     transaction must start (and let some statements execute) before
     subsequent statements start and their dependencies are known.
2. Even if the dependencies were exactly known and it was
   theoretically possible to compute a good ordering, this is a
   computationally hard problem to solve (it's NP-complete) and thus
   may not be practical to 2resolve while keeping latencies low.

Because of this, most SQL engines (including CockroachDB, but also
PostgreSQL) have a trade-off: they will **attempt** to compute
dependencies in common cases when it is both possible and fast to do
so, and make a **best effort** at organizing transaction ordering in a way
that minimizes conflicts. If the dependencies cannot be computed, they
will be pessimized (thereby assuming conflicts with a wider class of
concurrent transactions), and if the transaction ordering risks an
uncontrollable delay, the engine will prefer signalling the conflict
earlier to clients.

# Differences between CockroachDB and PostgreSQL

How is PostgreSQL also affected? It seems like these errors never happen with PostgreSQL.

- PostgreSQL [documents how and when these errors are possible](https://www.postgresql.org/docs/11/transaction-iso.html#XACT-SERIALIZABLE) at SERIALIZABLE isolation.
- Even though it is common with other SQL engines to expect that
  ordering errors are not possible at READ COMMITTED isolation (where
  the **A** and **I** in ACID are weaker, in agreement with clients),
  PostgreSQL chooses to avoid write skew effects with foreign key
  updates (consistency, the **C** in ACID) and trigger an ordering error
  if it detects a conflict involving foreign keys at that isolation
  level.

Why does it seem like this problem is more prevalent with CockroachDB than PostgreSQL?

- The default isolation level in PostgreSQL is READ COMMITTED, not
  SERIALIZABLE. The SERIALIZABLE level requires stricter guarantees on
  transaction ordering and thus increases the likelihood of ordering
  errors. This is also true in PostgreSQL, for those applications that
  opt into that isolation level.

- CockroachDB is a distributed system and it is more difficult for the
  transaction ordering algorithms to determine the dependencies across
  multiple nodes. The main challenge is to determine accurate
  dependencies in a timely fashion. CockroachDB currently uses a data
  structure that either deals with conflicts with certainty
  (re-ordering txns automatically as needed), or there may be a conflict if two
  transactions are close in time (the "uncertainty interval", based on
  the MaxOffset parameter). With this implementation choice, the
  database has no choice but to report an ordering error in the
  "maybe" case, and the tuning parameter is to reduce MaxOffset
  (subject to constraints on the quality of inter-node clock
  synchronization). Other data structures that could provide more
  accurate orderings are either more expensive (perf-wise) or simply
  not yet implemented in CockroachDB.

# See also

- [Transactions](transactions.html)
- [PostgreSQL documentation on SERIALIZABLE](https://www.postgresql.org/docs/11/transaction-iso.html#XACT-SERIALIZABLE)
- J. Jaffray, [Why do databases require client-side retries](http://justinjaffray.com/why-do-databases-require-client-side-retries/)
