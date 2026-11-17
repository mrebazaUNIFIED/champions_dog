-- 4.º Campeonato Perritos Locos - la escala de nivel pasó de 1-5 a 1-6.
alter table players drop constraint if exists players_skill_level_check;
alter table players add constraint players_skill_level_check check (skill_level between 1 and 6);
