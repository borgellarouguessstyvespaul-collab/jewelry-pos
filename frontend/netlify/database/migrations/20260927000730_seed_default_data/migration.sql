INSERT INTO "users" ("name", "email", "password_hash", "role", "is_active") VALUES
  ('Admin (Administrateur)', 'admin@jewelrypos.com', '$2b$10$sUw6wkEn0JqgMvH5rwXehONdJnhuIuPG5PF6M79HDDxT8CcI24aDi', 'ADMIN', true),
  ('Claire Laurent (Gestionnaire)', 'manager@jewelrypos.com', '$2b$10$K1C72iM8/fhAnT/qPartg.S1700lmk2wWLPxcX2NsnGooOmoOeIZa', 'GESTIONNAIRE', true),
  ('Sophie Martin (Caissière)', 'caissier@jewelrypos.com', '$2b$10$8wxadbymzz4yljjW8ly9FOyjZobjJIWEmvedxpb89LOfw483WohHq', 'CAISSIER', true)
ON CONFLICT ("email") DO NOTHING;
--> statement-breakpoint
INSERT INTO "categories" ("name", "description", "color") VALUES
  ('Bagues', 'Bagues & Alliances en Or, Argent et Platine', '#eab308'),
  ('Colliers', 'Pendentifs, chaînes et colliers fins', '#ec4899'),
  ('Bracelets', 'Bracelets rigides, chaînettes et gourmets', '#3b82f6'),
  ('Boucles d''oreilles', 'Puces, créoles et pendantes', '#8b5cf6'),
  ('Montres', 'Montres de luxe et horlogerie', '#10b981')
ON CONFLICT ("name") DO NOTHING;
