drop database if exists ufc_project;
create database if not exists ufc_project;
use ufc_project;

create table fighter(
    fighter_name varchar(100) not null,
    wins int,
    losses int,
    draws int,
    searched boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    style varchar(100),
    primary key(fighter_name)
);

create table fight(
    fight_id int auto_increment,
    fighter1 varchar(100) not null,
    fighter2 varchar(100) not null,
    fight_card varchar(255) not null,
    winner varchar(100),
    method varchar(50),
    end_round varchar(10),
    fightDate date,
    primary key (fight_id),
    foreign key (fighter1) references fighter(fighter_name) on delete cascade,
    foreign key (fighter2) references fighter(fighter_name) on delete cascade
);

create table stats(
    fight_id int not null,
    fighter varchar(100) not null,
    opponent varchar(100) not null,
    rd varchar(20) not null,
    kd int,
    sig_str varchar(20),
    total_str varchar(20),
    td varchar(20),
    sub int,
    rev int,
    ctrl varchar(20),
    head_str varchar(20),
    body_str varchar(20),
    leg_str varchar(20),
    distance_str varchar(20),
    clinch_str varchar(20),
    ground_str varchar(20),
    primary key (fight_id, fighter, rd),
    foreign key (fight_id) references fight(fight_id) on delete cascade,
    foreign key (fighter) references fighter(fighter_name) on delete cascade,
    foreign key (opponent) references fighter(fighter_name) on delete cascade
);