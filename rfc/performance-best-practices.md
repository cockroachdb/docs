- Feature Name: SQL Performance Best Practices
- Status: draft
- Start Date: 11-12-2017
- Authors: Amruta-Ranade
- Cockroach Doc Issue: #2027

# Summary

This document discusses the purpose and proposed documentation plan for documenting SQL performance best practices for CockroachDB.

# Motivation

Because CockroachDB is a distributed database, common database operations need to be done differently to achieve performance at par with traditional databases. Users might not be aware of these differences. Robert and support engineers already share these differences as best practices with customers on a one-on-one basis. However, they share it mostly after the customer hits performance issues and contacts us to resolve the issues. Documenting these best practices will help those customers who do not contact us, and will allow us to reach more customers. This may also help in increasing product adoption, education, and usage.

# What are the recommended performance best practices?

- Multi-row DML
- Using `IMPORT TABLE` instead of `COPY`
- Unique ID best practice: Use `RETURNING` instead of transactions
- Retrieving surrogate key to natural key
- Transactions best practice: Use `RETURNING NOTHING`, batching 
- JOINs: Merge `JOIN`, Hash `JOIN`
- Secondary indexes
- Performance implications of constraints: Have only as many constraints as you need. Example: One index vs. two indexes for `INSERT`/other DML statements would make it slower, but for `SELECT`, it would make it faster

# What are other possible best practices?

The following practices are recommended, but do not show significant performance improvements during performance tests:

- Interleaved tables
- Interleaved indexes
- Column families

The following practices are out of scope for now:

- Select * from non lease holders
- CDC

# Proposed documentation plan

Add a note and example calling out multi-row DML best practices and using `RETURNING NOTHING` in the following existing docs:

- `INSERT`
- `UPSERT`
- `DELETE`
- `UPDATE`
- `SELECT`
- `TRANSACTIONS`

Create new documents for:

- Merge `JOIN`
- Hash `JOIN`

Create a Performance Best Practices document and link (or include) to the new documents listed above, as well as following existing documents:

- Secondary indexes
- Parallel statement execution
- `IMPORT TABLE`

# Other considerations

As of now, we share the performance best practices with our users only when they hit performance issues. So the users might be referring to the Troubleshooting section to look for solutions. We might want to include the link to the performance best practices document in the Troubleshooting section as well. (We do have that in Troubleshooting > Query Behavior > Performance Issues. We can expand that section).

# Which releases are impacted?

1.1 onwards

# Who is the audience?

External customers: Mainly developers, though architects and operators need to know.


# When will the user look for this information?

- When things go wrong
- When they are developing the application

# What should they be able to do after reading the doc?

- Understand? Yes
- Implement? Yes
- Make a decision? Yes

# Do they come here from another doc? 

Probably not: They would be on the SQL statement-specific page or the Performance Best Practices page.

# Is any contextual/background information required? 

No.

# How will they read the document?

- Skim: Go through it quickly to get a general idea of the content
- Search: Search for specific piece of information

# What is our purpose for the document?

- Inform/Educate
- Establish credibility