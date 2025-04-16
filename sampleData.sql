
INSERT INTO users (username, email, displayname, role, password, bio, profile_picture, created_at) VALUES
('ynot', 'ynot@yflop.fr', 'Tony Hawk', 'user', '$2b$10$ptRzED8pD1GnQt2/DLHhOuFtksJKagLutaOrPBf7SAXHwVRDASWRS', NULL, 'https://pbs.twimg.com/profile_images/1781041197865201664/I-OBJndK_400x400.jpg', '2025-03-31 08:42:35'),
('tony', 'tony@yflop.fr', 'Ynot', 'user', '$2b$10$ptRzED8pD1GnQt2/DLHhOuFtksJKagLutaOrPBf7SAXHwVRDASWRS', NULL, NULL, '2025-04-01 13:33:12'),
('lilstick', 'lilstick@yflop.fr', 'LilStick', 'user', '$2b$10$eCaKBGod2rjWNFbqj59l7O3MNiwBu/pb9KNY3zVr50vzu7KY5AOgm', NULL, NULL, '2025-04-02 12:08:09'),
('badis', 'badis@yflop.fr', "Badis l'arbre", 'user', '$2b$10$23BBFdX.FlbusIOTIdHM6.A3gbwIx0ruk11MW/NVaNPK/hHAOjUPS', NULL, NULL, '2025-04-02 12:29:17'),
('ynot1', 'ynot1@yflop.fr', 'Ynot', 'user', '$2b$10$l6ERYZvXIzfYkZD.0RFIce8T3W4uCLSx.TdAvwyN3.AhnaroN4HmK', NULL, NULL, '2025-04-02 15:35:08');

INSERT INTO posts (id, user_id, description, created_at) VALUES
(1, 1, 'Normandie était en concert a Paris!', '2025-03-31 13:13:52'),
(2, 5, 'La ville des lumières', '2025-03-31 08:47:39'),
(3, 3, 'Je suis japonais', '2025-04-01 14:36:06'),
(4, 2, 'Ma nouvelle Sultan!!', '2025-04-15 09:21:51'),
(5, 4, 'New York, la ville de tout les possibles!', '2025-03-31 08:46:25'),
(6, 1, 'Hey!', '2025-03-31 13:13:39'),
(7, 4, 'Late night drives', '2025-04-02 14:08:11'),
(8, 1, 'test', '2025-04-16 12:29:43'),
(9, 3, "J'adore Arcane", '2025-04-02 14:07:01');

INSERT INTO post_medias (post_id, user_id, media_url, created_at) VALUES
(9, 3, "https://ridnji3h12.ufs.sh/f/Nha54VbichlFCpJxnt1mxNH4d8SgAJhRr1U6oGkwtWaDO9jF", '2025-04-14 10:17:06'),
(7, 4, "https://ridnji3h12.ufs.sh/f/Nha54VbichlFE0juuwRZ9LK3nzDT5HfQwyoB4jqJVxd0r8N7", '2025-04-14 10:17:06'),
(3, 3, "https://ridnji3h12.ufs.sh/f/Nha54VbichlFgiYXYR50EQ4wdVxt27eLF6h5i81osCKzAInU", '2025-04-14 10:17:06'),
(8, 1, "https://ridnji3h12.ufs.sh/f/Nha54VbichlFVNN63I1DSEKfncXJaNmpQABUTqYs7R0kPyL9", '2025-04-16 12:29:44'),
(8, 1, "https://ridnji3h12.ufs.sh/f/Nha54VbichlFhc39SRqGgQm9ZbW1M4Llq6dKzBaFxf3w7hSD", '2025-04-16 12:29:44'),
(5, 4, "https://ridnji3h12.ufs.sh/f/Nha54VbichlFOFY5yc92t07zV98UgZxBurospdkiXQNhH1Rb", '2025-04-14 10:17:06'),
(2, 5, "https://ridnji3h12.ufs.sh/f/Nha54VbichlFQs8Q7vEU8Aqya1KsbmfCEXk7uRVNzeLS9cFd", '2025-04-14 10:17:06'),
(4, 2, "https://ridnji3h12.ufs.sh/f/Nha54VbichlF9lUi4uM7HmPf8xZsWINL5awYKliREXqdG361", '2025-04-15 09:21:51'),
(8, 1, "https://ridnji3h12.ufs.sh/f/Nha54VbichlFh6iCBFGgQm9ZbW1M4Llq6dKzBaFxf3w7hSD8", '2025-04-16 12:29:44'),
(1, 1, "https://ridnji3h12.ufs.sh/f/Nha54VbichlF58vCNoUkrUHmBy9MZKizen0t7X3oSwD2j8uV", '2025-04-14 10:17:06');