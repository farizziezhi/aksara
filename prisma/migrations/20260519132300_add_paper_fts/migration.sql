-- FTS5 virtual table for Paper title + abstract.
-- paper_id stored UNINDEXED (used to join back to Paper).
-- Triggers keep paper_fts in sync with Paper.

CREATE VIRTUAL TABLE IF NOT EXISTS paper_fts USING fts5(
  paper_id UNINDEXED,
  title,
  abstract,
  tokenize = 'porter unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS paper_ai AFTER INSERT ON Paper BEGIN
  INSERT INTO paper_fts(paper_id, title, abstract)
  VALUES (new.id, new.title, COALESCE(new.abstract, ''));
END;

CREATE TRIGGER IF NOT EXISTS paper_ad AFTER DELETE ON Paper BEGIN
  DELETE FROM paper_fts WHERE paper_id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS paper_au AFTER UPDATE OF title, abstract ON Paper BEGIN
  DELETE FROM paper_fts WHERE paper_id = old.id;
  INSERT INTO paper_fts(paper_id, title, abstract)
  VALUES (new.id, new.title, COALESCE(new.abstract, ''));
END;
