During a major-version upgrade, certain features and performance improvements may not be available until the upgrade is finalized. In v25.1, these are:

- A cluster must have an [Enterprise license]({% link v25.1/licensing-faqs.md %}#set-a-license) or a [trial license]({% link v25.1/licensing-faqs.md %}#obtain-a-license) set before an upgrade to v25.1 can be finalized.
- Support for XA transactions, which allow CockroachDB to participate in distributed transactions with other resources (e.g. databases or message queues) using a two-phase commit protocol. [#129448](https://github.com/cockroachdb/cockroach/pull/129448)
- [`ALTER TABLE ... ALTER COLUMN TYPE`]({% link v25.1/alter-table.md %}#alter-column-data-types) is in [General Availability (GA)]({% link v25.1/cockroachdb-feature-availability.md %}#feature-availability-phases).
- Jobs system changes:
  - `SHOW JOBS` is now based on a new mechanism for storing information about the progress and status of running jobs. [#139230](https://github.com/cockroachdb/cockroach/pull/139230)
  - `ALTER JOB ... OWNER TO` can now be used to transfer ownership of a job between users/roles. [#138139](https://github.com/cockroachdb/cockroach/pull/138139)
  - Users can now always see and control (pause/resume/cancel) jobs that they own. [#138178](https://github.com/cockroachdb/cockroach/pull/138178)
