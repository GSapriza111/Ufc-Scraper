drop database if exists ufc_project;
create database if not exists ufc_project;
use ufc_project;

-- 1. Fighter Table (Correct as is)
create table fighter(
    fighter_name varchar(100) not null,
    wins int,
    losses int,
    draws int,
    style varchar(100),
    primary key(fighter_name)
);

-- 2. Fight Table (Simplified)
-- This defines the event and the participants.
create table fight(
    fight_id int auto_increment,
    fighter1 varchar(100) not null,
    fighter2 varchar(100) not null,
    fight_card varchar(100) not null,
    primary key (fight_id),
    foreign key (fighter1) references fighter(fighter_name) on delete cascade,
    foreign key (fighter2) references fighter(fighter_name) on delete cascade
);

-- 3. Stats Table 
-- This links to a fighter and can now link to a specific fight.
create table stats(
    fighter varchar(100) not null,
    fight_card varchar(100) not null,
    rd int not null,
    kd int,
    sig_str double,
    total_str double,
    td int,
    sub int,
    rev int,
    ctrl varchar(10),
    head_str double,
    body_str double,
    leg_str double,
    outside double,
    clinch double,
    ground double,
    foreign key (fighter) references fighter(fighter_name) on delete cascade,
    primary key (fighter, fight_card, rd)
);