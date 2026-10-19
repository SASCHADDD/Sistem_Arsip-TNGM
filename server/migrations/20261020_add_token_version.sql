-- Apply once to the existing database before starting the updated backend.
ALTER TABLE `pengguna`
  ADD COLUMN `token_version` int(10) unsigned NOT NULL DEFAULT 0;
