# Admin Dashboard Setup Guide

## Overview

A fully functional admin dashboard has been implemented with CRUD operations for:
- **Movies**: Create, Read, Update, Delete movies
- **Users**: View, update roles, delete users
- **Bookings**: View, update status, delete bookings
- **Dashboard**: Statistics overview

## Making a User an Admin

### Method 1: Create New Admin User (Recommended for First Time)

1. Navigate to the server directory:
```bash
cd server
```

2. Run the createAdmin script:
```bash
node createAdmin.js <email> <password> [firstName] [lastName]
```

Example:
```bash
node createAdmin.js admin@gmail.com mypassword123 "Admin" "User"
```

This will create a new user account with admin privileges directly.

### Method 2: Make Existing User an Admin

1. Navigate to the server directory:
```bash
cd server
```

2. Run the makeAdmin script:
```bash
node makeAdmin.js <user-email>
```

Example:
```bash
node makeAdmin.js user@example.com
```

**Note:** The user must already exist (registered through the website). If they don't exist, use Method 1 instead.

### Method 2: Direct Database Update

If you have database access, you can directly update the user:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Method 3: Through Admin Dashboard (if you already have an admin)

1. Log in as an existing admin
2. Go to Admin Dashboard → Users tab
3. Find the user you want to make admin
4. Change their role from "User" to "Admin" using the dropdown

## Accessing the Admin Dashboard

1. **Log in** with an admin account
2. Click on your **profile/avatar** in the navbar
3. Select **"Admin Dashboard"** from the dropdown menu
4. Or navigate directly to: `http://localhost:5173/admin`

## Admin Dashboard Features

### Dashboard Overview
- Total users (admins and regular users)
- Total bookings (with status breakdown)
- Total revenue from confirmed bookings
- Total movies (now showing and coming soon)

### Movies Management
- **View all movies** with search functionality
- **Create new movies** with full details:
  - ID, Title, Poster URL, Backdrop URL
  - Synopsis, Duration, Rating
  - Genre, Director, Cast
  - Release Date
  - Status flags (Now Showing, Coming Soon, Featured)
- **Edit existing movies**
- **Delete movies**

### Bookings Management
- **View all bookings** with search and status filter
- **Update booking status** (Pending, Confirmed, Cancelled)
- **Delete bookings**
- View booking details:
  - Movie information
  - Booking code
  - User ID
  - Selected seats
  - Total price
  - Payment method
  - Creation date

### Users Management
- **View all users** with search functionality
- **Update user roles** (User ↔ Admin)
- **Delete users** (will also delete associated bookings)
- View user details:
  - Name, Email, Phone
  - Role (User/Admin)
  - Account creation date

## API Endpoints

All admin endpoints require authentication and admin role:

### Dashboard
- `GET /api/admin/stats` - Get dashboard statistics

### Users
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

### Movies
- `POST /api/admin/movies` - Create new movie
- `PUT /api/admin/movies/:id` - Update movie
- `DELETE /api/admin/movies/:id` - Delete movie

### Bookings
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/bookings/:id/status` - Update booking status
- `DELETE /api/admin/bookings/:id` - Delete booking

## Security

- All admin endpoints are protected by:
  1. **Authentication middleware** - Requires valid JWT token
  2. **Admin middleware** - Requires user role to be "admin"
- Non-admin users will receive a 403 Forbidden error if they try to access admin endpoints
- The frontend also checks user role before displaying admin links

## First Time Setup

1. **Create a user account** through the regular registration process
2. **Make the user an admin** using Method 1 or 2 above
3. **Log in** with the admin account
4. **Access the admin dashboard** from the navbar dropdown

## Notes

- The admin role is stored in the `users` table with a `role` column
- Default role for new users is "user"
- Only users with `role = 'admin'` can access admin features
- Admin users can still use all regular user features (bookings, tickets, etc.)

