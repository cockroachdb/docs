#!/usr/bin/env perl

use strict;
use warnings;
use feature qw/ say /;

my @files = qw/
  create-table-as.md
  delete.md
  export.md
  import.md
  import-into.md
  insert.md
  select-clause.md
  selection-queries.md
  truncate.md
  update.md
  upsert.md
  selection-queries.md
  add-column.md
  add-constraint.md
  alter-column.md
  alter-database.md
  alter-index.md
  alter-partition.md
  alter-range.md
  alter-sequence.md
  alter-table.md
  alter-type.md
  alter-user.md
  alter-view.md
  comment-on.md
  configure-zone.md
  create-database.md
  create-index.md
  create-sequence.md
  create-table.md
  create-table-as.md
  create-view.md
  drop-column.md
  drop-constraint.md
  drop-database.md
  drop-index.md
  drop-sequence.md
  drop-table.md
  drop-view.md
  experimental-audit.md
  partition-by.md
  rename-column.md
  rename-constraint.md
  rename-database.md
  rename-index.md
  rename-sequence.md
  rename-table.md
  show-columns.md
  show-constraints.md
  show-create.md
  show-databases.md
  show-partitions.md
  show-index.md
  show-locality.md
  show-schemas.md
  show-sequences.md
  show-tables.md
  show-ranges.md
  show-zone-configurations.md
  split-at.md
  unsplit-at.md
  validate-constraint.md
  begin-transaction.md
  commit-transaction.md
  release-savepoint.md
  rollback-transaction.md
  savepoint.md
  set-transaction.md
  show-vars.md
  create-role.md
  create-user.md
  drop-role.md
  drop-user.md
  grant.md
  grant-roles.md
  revoke.md
  revoke-roles.md
  show-grants.md
  show-roles.md
  show-users.md
  reset-vars.md
  set-vars.md
  set-transaction.md
  show-trace.md
  show-vars.md
  reset-cluster-setting.md
  set-cluster-setting.md
  show-cluster-setting.md
  show-sessions.md
  cancel-session.md
  cancel-query.md
  show-queries.md
  create-statistics.md
  explain.md
  explain-analyze.md
  show-statistics.md
  cancel-job.md
  pause-job.md
  resume-job.md
  show-jobs.md
  enterprise-licensing.md
  backup.md
  backup.md
  restore.md
  show-backup.md
  stream-data-out-of-cockroachdb-using-changefeeds.md
  create-changefeed.md
  changefeed-for.md
  /;

for my $file (@files) {
    my $target_dir = qq[/Users/rloveland/work/code/sqlchecker/data/];
    my $cmd        = qq[cp $file $target_dir];
    system $cmd;
}
