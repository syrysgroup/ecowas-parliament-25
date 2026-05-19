UPDATE parliament_panorama_scenes SET panorama_url='/panorama/chamber-main.jpg', preview_url='/panorama/chamber-main-preview.jpg', name='Parliament Chamber', slug='chamber-main', default_yaw=0, default_pitch=0, is_active=true WHERE id='7a989bf0-188c-4e91-81e0-86ba609383c5';

DELETE FROM parliament_panorama_hotspots WHERE scene_id='7a989bf0-188c-4e91-81e0-86ba609383c5';

INSERT INTO parliament_panorama_hotspots (scene_id, yaw, pitch, title, description, display_order, is_active) VALUES
('7a989bf0-188c-4e91-81e0-86ba609383c5', 0.0, 0.05, 'Speaker''s Chair', 'The seat of the Speaker, who presides over plenary sessions of the ECOWAS Parliament.', 1, true),
('7a989bf0-188c-4e91-81e0-86ba609383c5', 0.15, -0.20, 'The Mace', 'Symbol of parliamentary authority; sessions cannot proceed without it on the table.', 2, true),
('7a989bf0-188c-4e91-81e0-86ba609383c5', -1.3, -0.05, 'Member Benches (Left)', 'Seats for Members of Parliament representing the fifteen ECOWAS Member States.', 3, true),
('7a989bf0-188c-4e91-81e0-86ba609383c5', 1.3, -0.05, 'Member Benches (Right)', 'Additional seating arranged to accommodate the full delegation of regional representatives.', 4, true),
('7a989bf0-188c-4e91-81e0-86ba609383c5', 3.1, 0.30, 'Public Gallery', 'Open to citizens, press, and observers who follow parliamentary proceedings live.', 5, true),
('7a989bf0-188c-4e91-81e0-86ba609383c5', 0.0, 0.55, 'ECOWAS Emblem', 'The Community emblem displayed above the chamber, representing regional integration.', 6, true);