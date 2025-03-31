-- Create tables for our application

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    time_of_day TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Medication logs table (for tracking when medications are taken)
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('taken', 'missed', 'delayed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Medical records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    doctor TEXT,
    facility TEXT,
    notes TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS medications_user_id_idx ON medications(user_id);
CREATE INDEX IF NOT EXISTS medication_logs_medication_id_idx ON medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS medication_logs_user_id_idx ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS medical_records_user_id_idx ON medical_records(user_id);
CREATE INDEX IF NOT EXISTS health_metrics_user_id_idx ON health_metrics(user_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own medications" ON medications;
DROP POLICY IF EXISTS "Users can insert their own medications" ON medications;
DROP POLICY IF EXISTS "Users can update their own medications" ON medications;
DROP POLICY IF EXISTS "Users can delete their own medications" ON medications;

DROP POLICY IF EXISTS "Users can view their own medication logs" ON medication_logs;
DROP POLICY IF EXISTS "Users can insert their own medication logs" ON medication_logs;

DROP POLICY IF EXISTS "Users can view their own medical records" ON medical_records;
DROP POLICY IF EXISTS "Users can insert their own medical records" ON medical_records;
DROP POLICY IF EXISTS "Users can update their own medical records" ON medical_records;
DROP POLICY IF EXISTS "Users can delete their own medical records" ON medical_records;

DROP POLICY IF EXISTS "Users can view their own health metrics" ON health_metrics;
DROP POLICY IF EXISTS "Users can insert their own health metrics" ON health_metrics;
DROP POLICY IF EXISTS "Users can update their own health metrics" ON health_metrics;
DROP POLICY IF EXISTS "Users can delete their own health metrics" ON health_metrics;

-- Create policies for medications
CREATE POLICY "Users can view their own medications"
    ON medications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
    ON medications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
    ON medications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
    ON medications FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for medication logs
CREATE POLICY "Users can view their own medication logs"
    ON medication_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medication logs"
    ON medication_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policies for medical records
CREATE POLICY "Users can view their own medical records"
    ON medical_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical records"
    ON medical_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical records"
    ON medical_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical records"
    ON medical_records FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for health metrics
CREATE POLICY "Users can view their own health metrics"
    ON health_metrics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health metrics"
    ON health_metrics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health metrics"
    ON health_metrics FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health metrics"
    ON health_metrics FOR DELETE
    USING (auth.uid() = user_id); 