-- Add foreign key constraints to link tables to profiles
ALTER TABLE discussions 
ADD CONSTRAINT discussions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE discussion_replies 
ADD CONSTRAINT discussion_replies_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE polls 
ADD CONSTRAINT polls_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add foreign key constraints for proper relationships
ALTER TABLE discussion_replies 
ADD CONSTRAINT discussion_replies_discussion_id_fkey 
FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE;

ALTER TABLE poll_options 
ADD CONSTRAINT poll_options_poll_id_fkey 
FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE;

ALTER TABLE poll_votes 
ADD CONSTRAINT poll_votes_poll_id_fkey 
FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE;

ALTER TABLE poll_votes 
ADD CONSTRAINT poll_votes_poll_option_id_fkey 
FOREIGN KEY (poll_option_id) REFERENCES poll_options(id) ON DELETE CASCADE;

ALTER TABLE poll_votes 
ADD CONSTRAINT poll_votes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;