-- Insert the admin user into admin_users table
INSERT INTO admin_users (id, email)
SELECT id, email 
FROM auth.users 
WHERE email = 'sh.admin@securehouse.co.uk';
