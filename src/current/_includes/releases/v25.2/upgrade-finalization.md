During a major-version upgrade, certain features and performance improvements may not be available until the upgrade is finalized. In v25.1, these are:

- Bullet
- Bullet
- Bullet
- Bullet
  - `SHOW JOBS` is now based on a new mechanism for storing information about the progress and status of running jobs. [#](https://github.com/cockroachdb/cockroach/pull/)
  - `ALTER JOB ... OWNER TO` can now be used to transfer ownership of a job between users/roles. [#](https://github.com/cockroachdb/cockroach/pull/)
  - Users can now always see and control (pause/resume/cancel) jobs that they own. [#](https://github.com/cockroachdb/cockroach/pull/)
