create table account
(
    id      int            not null primary key default unique_rowid(),
    balance numeric(19, 2) not null,
    name    varchar(128)   not null,
    type    varchar(25)    not null
);
