-- notification_reads: persist which notifications each user has read.
-- notif_id matches the synthetic IDs built in the app: msg-{id}, task-{id}, evt-{id}, app-{id}

CREATE TABLE IF NOT EXISTS notification_reads (
  user_id  uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notif_id text    NOT NULL,
  read_at  timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, notif_id)
);

ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own notification reads"
  ON notification_reads
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime so the bell can react instantly when another session marks something read
ALTER PUBLICATION supabase_realtime ADD TABLE notification_reads;
