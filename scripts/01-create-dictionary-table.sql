-- Create the dictionary table
CREATE TABLE IF NOT EXISTS dictionary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create an index for faster word searches
CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word);

-- Insert some sample data
INSERT INTO dictionary (word, definition) VALUES
  ('serendipity', 'The occurrence of events by chance in a happy or beneficial way'),
  ('ephemeral', 'Lasting for a very short time'),
  ('eloquent', 'Fluent or persuasive in speaking or writing')
ON CONFLICT (word) DO NOTHING;
