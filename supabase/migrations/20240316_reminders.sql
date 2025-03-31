-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    time TEXT NOT NULL,
    days TEXT[] NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'snoozed')),
    notification_types TEXT[] NOT NULL CHECK (notification_types <@ ARRAY['app', 'email', 'voice', 'browser']),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create reminder settings table
CREATE TABLE IF NOT EXISTS reminder_settings (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    app_notifications BOOLEAN DEFAULT true NOT NULL,
    email_notifications BOOLEAN DEFAULT true NOT NULL,
    voice_notifications BOOLEAN DEFAULT false NOT NULL,
    reminder_frequency TEXT DEFAULT 'once' NOT NULL,
    snooze_time TEXT DEFAULT '10min' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON reminders(user_id);
CREATE INDEX IF NOT EXISTS reminders_medication_id_idx ON reminders(medication_id);

-- Enable Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for reminders
CREATE POLICY "Users can view their own reminders"
    ON reminders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
    ON reminders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
    ON reminders FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
    ON reminders FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for reminder settings
CREATE POLICY "Users can view their own reminder settings"
    ON reminder_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminder settings"
    ON reminder_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder settings"
    ON reminder_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 