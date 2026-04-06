USE ufc_project;
DROP TABLE IF EXISTS stats;

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