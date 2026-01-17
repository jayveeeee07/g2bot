-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  month VARCHAR(20) NOT NULL,
  entry_no VARCHAR(10),
  member_name VARCHAR(100),
  expense_date VARCHAR(20),
  purpose VARCHAR(200),
  quantity VARCHAR(10),
  amount DECIMAL(10,2),
  source_of_fund VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_by VARCHAR(50)
);

-- Penalties Table
CREATE TABLE IF NOT EXISTS penalties (
  id BIGSERIAL PRIMARY KEY,
  month VARCHAR(20) NOT NULL,
  entry_no VARCHAR(10),
  member_name VARCHAR(100),
  penalty_date VARCHAR(20),
  penalty_type VARCHAR(50),
  amount DECIMAL(10,2),
  signature VARCHAR(50),
  secretary_remark TEXT,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Monthly Collections Table
CREATE TABLE IF NOT EXISTS monthly_collections (
  id BIGSERIAL PRIMARY KEY,
  month VARCHAR(20) NOT NULL,
  entry_no VARCHAR(10),
  member_name VARCHAR(100),
  collection_date VARCHAR(20),
  collection_type VARCHAR(10),
  amount DECIMAL(10,2),
  signature VARCHAR(50),
  secretary_remark TEXT,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert Default Users
INSERT INTO users (username, full_name, role, password_hash, is_active) VALUES
('jayvee', 'JAYVEE CARINGAL', 'admin', 'ADMIN01', true),
('marjhon', 'MAR JHON LUYAO', 'secretary', 'SECMJ', true),
('christian', 'CHRISTIAN LASPONIA', 'treasurer', 'TREASCL', true),
('princess', 'PRINCESS PADILLA', 'vicepresident', 'VPRESPL', true),
('guest', 'Guest User', 'guest', 'GUEST123', true)
ON CONFLICT (username) DO NOTHING;

-- Enable Row Level Security (Recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_collections ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Allow all operations for authenticated users" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for expenses" ON expenses
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for penalties" ON penalties
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for monthly collections" ON monthly_collections
  FOR ALL USING (true);
