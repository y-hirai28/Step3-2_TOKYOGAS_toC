-- Tech0 by scope3 Database Schema for Azure SQL Database

-- ユーザーテーブル
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) UNIQUE,
    password_hash NVARCHAR(255),
    company_code NVARCHAR(50),
    department NVARCHAR(100),
    tokyogas_customer_number NVARCHAR(50) UNIQUE,
    points INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- エネルギー使用量テーブル
CREATE TABLE EnergyUsage (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    energy_type NVARCHAR(20) NOT NULL, -- 'gas', 'electricity', 'water'
    amount DECIMAL(10,2) NOT NULL,
    unit NVARCHAR(10) NOT NULL, -- 'm³', 'kWh', etc.
    cost DECIMAL(10,2) NOT NULL,
    usage_date DATE NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- ポイント履歴テーブル
CREATE TABLE PointHistory (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    points INT NOT NULL,
    type NVARCHAR(20) NOT NULL, -- 'earn', 'redeem'
    description NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- ランキングテーブル（月次集計用）
CREATE TABLE MonthlyRanking (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    reduction_rate DECIMAL(5,2) NOT NULL,
    total_points INT NOT NULL,
    rank_individual INT,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    UNIQUE(user_id, year, month)
);

-- 部門別ランキングテーブル
CREATE TABLE DepartmentRanking (
    id INT IDENTITY(1,1) PRIMARY KEY,
    department NVARCHAR(100) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    avg_reduction_rate DECIMAL(5,2) NOT NULL,
    total_points INT NOT NULL,
    member_count INT NOT NULL,
    rank_department INT,
    created_at DATETIME2 DEFAULT GETDATE(),
    UNIQUE(department, year, month)
);

-- アップロードファイル履歴テーブル
CREATE TABLE FileUploads (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    filename NVARCHAR(255) NOT NULL,
    file_type NVARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    azure_blob_url NVARCHAR(500),
    processing_status NVARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    extracted_data NVARCHAR(MAX), -- JSON format
    points_earned INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- AI分析結果テーブル
CREATE TABLE AIAnalysis (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    analysis_date DATE NOT NULL,
    overall_score INT NOT NULL,
    recommendations NVARCHAR(MAX), -- JSON format
    usage_patterns NVARCHAR(MAX), -- JSON format
    predictions NVARCHAR(MAX), -- JSON format
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- 報酬・交換アイテムテーブル
CREATE TABLE Rewards (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    points_required INT NOT NULL,
    category NVARCHAR(50) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- 報酬交換履歴テーブル
CREATE TABLE RewardRedemptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    reward_id INT NOT NULL,
    points_used INT NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'delivered'
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (reward_id) REFERENCES Rewards(id)
);

-- インデックスの作成
CREATE INDEX IX_EnergyUsage_UserDate ON EnergyUsage(user_id, usage_date);
CREATE INDEX IX_PointHistory_UserDate ON PointHistory(user_id, created_at);
CREATE INDEX IX_MonthlyRanking_YearMonth ON MonthlyRanking(year, month);
CREATE INDEX IX_FileUploads_UserDate ON FileUploads(user_id, created_at);

-- サンプルデータ挿入
INSERT INTO Users (name, email, company_code, department, points) VALUES
('田中 太郎', 'tanaka@company.com', 'COMP001', '営業部', 1250),
('佐藤 花子', 'sato@company.com', 'COMP001', 'マーケティング部', 1180),
('鈴木 一郎', 'suzuki@company.com', 'COMP001', '開発部', 1120);

INSERT INTO Rewards (name, description, points_required, category) VALUES
('社内カフェクーポン', 'コーヒー1杯無料', 200, 'カフェ'),
('エコバッグ', 'オリジナルエコバッグ', 300, 'グッズ'),
('図書カード 1,000円', '図書カード1000円分', 800, 'ギフト券'),
('特別休暇 0.5日', '半日有給休暇', 1000, '休暇');