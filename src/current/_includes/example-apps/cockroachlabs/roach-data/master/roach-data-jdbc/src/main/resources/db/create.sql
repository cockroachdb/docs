create table account
(
    id      int            not null primary key default unique_rowid(),
    balance numeric(19, 2) not null,
    name    varchar(128)   not null,
    type    varchar(25)    not null,
    updated        timestamptz    not null default clock_timestamp()
);

-- insert into account (id,balance,name,type)
-- values
-- (1,100.50,'a','expense'),
-- (2,100.50,'b','expense'),
-- (3,100.50,'c','expense'),
-- (4,100.50,'d','expense'),
-- (5,100.50,'e','expense');

-- select * from account AS OF SYSTEM TIME '-5s';
