-- Add your new admin user to admin_users table
INSERT INTO admin_users (id, email)
SELECT id, email 
FROM auth.users 
WHERE email = 'admin.sh@gallery.com';