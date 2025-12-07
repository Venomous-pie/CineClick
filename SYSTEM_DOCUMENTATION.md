# SilverScreen Suite - System Documentation

## 1. ERD Code for dbdiagram.io

```sql
// ERD for SilverScreen Cinema Booking System

Table users {
  id integer [primary key, increment]
  email varchar [unique, not null]
  password varchar [not null]
  firstName varchar
  lastName varchar
  phone varchar
  emailNotifications integer [default: 1]
  smsNotifications integer [default: 0]
  createdAt datetime [default: `CURRENT_TIMESTAMP`]
  updatedAt datetime [default: `CURRENT_TIMESTAMP`]
  
  Note: 'User accounts for authentication and profile management'
}

Table sessions {
  id integer [primary key, increment]
  userId integer [ref: > users.id, not null]
  token varchar [not null]
  expiresAt datetime [not null]
  createdAt datetime [default: `CURRENT_TIMESTAMP`]
  
  Note: 'JWT token blacklist for logout functionality'
}

Table bookings {
  id integer [primary key, increment]
  userId integer [ref: > users.id, not null]
  movieId varchar [not null]
  showtimeId varchar [not null]
  roomId varchar [not null]
  seats text [not null]
  totalPrice real [not null]
  status varchar [not null, default: 'pending']
  paymentMethod varchar
  bookingCode varchar [unique, not null]
  createdAt datetime [default: `CURRENT_TIMESTAMP`]
  updatedAt datetime [default: `CURRENT_TIMESTAMP`]
  
  Note: 'Movie ticket bookings with seat selections'
}

// External Data Sources (not in database)
// Movies: Stored in movies.json file (fetched from TMDB API)
// ViewingRooms: Static data in code (4 rooms: basic, 3d, premium, vip)
// Showtimes: Generated dynamically based on movie, room, and date
```

## 2. Data Flow Diagram (DFD)

### Level 0 - Context Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ User Actions (Browse, Book, Login, etc.)
       │
       ▼
┌─────────────────────────────────────────────┐
│                                             │
│      SilverScreen Cinema System             │
│                                             │
│  ┌──────────────┐      ┌──────────────┐   │
│  │   Frontend   │◄─────►│   Backend    │   │
│  │  (React)     │      │  (Express)   │   │
│  └──────┬───────┘      └──────┬───────┘   │
│         │                      │            │
│         │                      ▼            │
│         │              ┌──────────────┐    │
│         │              │   Database   │    │
│         │              │  (SQLite)    │    │
│         │              └──────────────┘    │
│         │                                   │
│         └───────────────────────────────────┘
│                      │
│                      │ Fetch Movie Data
│                      ▼
│              ┌──────────────┐
│              │  TMDB API    │
│              │  (External)  │
│              └──────────────┘
└─────────────────────────────────────────────┘
```

### Level 1 - System Processes

**Process 1: User Authentication**
- Input: Email, Password
- Process: Validate credentials, generate JWT token
- Output: User data, JWT token
- Data Store: users, sessions

**Process 2: Movie Management**
- Input: TMDB API requests
- Process: Fetch, filter, and store movie data
- Output: Movie listings (now showing, coming soon, featured)
- Data Store: movies.json (file)

**Process 3: Booking Management**
- Input: Movie selection, room, showtime, seats, payment
- Process: Create booking, generate booking code, process payment
- Output: Booking confirmation, booking code
- Data Store: bookings table

**Process 4: Profile Management**
- Input: User updates (name, phone, notifications)
- Process: Update user information
- Output: Updated user profile
- Data Store: users table

**Process 5: Ticket Management**
- Input: User ID
- Process: Retrieve user bookings, filter by status
- Output: Booking list (confirmed, pending, cancelled)
- Data Store: bookings table

### Data Flows:

1. **User Registration Flow:**
   - User → Frontend: Registration form data
   - Frontend → Backend: POST /api/auth/register
   - Backend → Database: INSERT into users
   - Backend → Frontend: User data + JWT token

2. **User Login Flow:**
   - User → Frontend: Login credentials
   - Frontend → Backend: POST /api/auth/login
   - Backend → Database: SELECT from users (verify password)
   - Backend → Frontend: User data + JWT token

3. **Movie Browsing Flow:**
   - User → Frontend: Browse request
   - Frontend → Backend: GET /api/movies (or filtered endpoints)
   - Backend → File System: Read movies.json
   - Backend → Frontend: Movie list

4. **Movie Fetching Flow (Admin):**
   - Admin → Backend: POST /api/movies/fetch
   - Backend → TMDB API: Fetch movie data
   - TMDB API → Backend: Movie data
   - Backend → File System: Write to movies.json

5. **Booking Creation Flow:**
   - User → Frontend: Select movie, room, showtime, seats
   - Frontend → Backend: POST /api/bookings (with JWT)
   - Backend → Database: INSERT into bookings
   - Backend → Frontend: Booking confirmation with booking code

6. **Payment Processing Flow:**
   - User → Frontend: Payment method selection
   - Frontend → Backend: Payment data
   - Backend → Database: UPDATE booking status to 'confirmed'
   - Backend → Frontend: Payment success confirmation

7. **Ticket Viewing Flow:**
   - User → Frontend: View tickets request
   - Frontend → Backend: GET /api/bookings (with JWT)
   - Backend → Database: SELECT bookings WHERE userId
   - Backend → Frontend: User bookings list

## 3. System Flow Details for Flowchart

### Main User Flows:

#### Flow 1: User Registration & Authentication
```
START
  ↓
[User visits site]
  ↓
[User clicks Register/Login]
  ↓
[Enter email and password]
  ↓
[Submit registration form]
  ↓
[Backend validates email uniqueness]
  ↓
[Hash password with bcrypt]
  ↓
[Create user record in database]
  ↓
[Generate JWT token]
  ↓
[Store token in localStorage]
  ↓
[Redirect to home page]
  ↓
END
```

#### Flow 2: Browse Movies
```
START
  ↓
[User lands on home page]
  ↓
[Frontend requests movies from API]
  ↓
[Backend reads movies.json]
  ↓
[Return movie list to frontend]
  ↓
[Display movies in grid]
  ↓
[User can filter by:]
  - All Movies
  - Now Showing
  - Coming Soon
  - Search by title/director/cast
  - Filter by genre
  ↓
[Display filtered results]
  ↓
END
```

#### Flow 3: View Movie Details
```
START
  ↓
[User clicks on movie card]
  ↓
[Navigate to Movie Detail page]
  ↓
[Frontend requests movie by ID]
  ↓
[Backend returns movie details]
  ↓
[Display:]
  - Movie poster and backdrop
  - Title, rating, duration
  - Synopsis
  - Director and cast
  - Genre tags
  - Showtimes (if available)
  ↓
[User clicks "Book Now"]
  ↓
[Redirect to booking flow]
  ↓
END
```

#### Flow 4: Complete Booking Process
```
START
  ↓
[User selects movie]
  ↓
[Select viewing room/experience]
  - Basic (Cinema Hall 1)
  - 3D Experience
  - ULTRAMAX Premium
  - VIP Lounge
  ↓
[Select date]
  ↓
[Select showtime]
  - 10:00, 13:00, 16:00, 19:00, 22:00
  ↓
[View seat map]
  ↓
[Select seats]
  - Click on available seats
  - Seats turn to "selected" status
  - Price updates based on room multiplier
  ↓
[Review booking summary]
  - Movie title
  - Room name
  - Showtime
  - Selected seats
  - Total price
  ↓
[Click "Proceed to Payment"]
  ↓
[Check if user is authenticated]
  ↓
IF NOT AUTHENTICATED:
  [Redirect to login page]
  [After login, return to payment]
  ↓
[Payment page loads]
  ↓
[Select payment method]
  - GCash
  - PayMaya
  - Bank Transfer
  - Credit/Debit Card
  ↓
IF Credit Card:
  [Enter card details]
  - Card number
  - Expiry date
  - CVV
  - Cardholder name
  ↓
[Review order summary]
  - Movie poster
  - Movie title
  - Number of seats
  - Seat numbers
  - Price breakdown
  - Total amount
  ↓
[Click "Complete Payment"]
  ↓
[Backend processes payment]
  - Generate unique booking code (CMX-YYYY-#####)
  - Create booking record
  - Store seats as JSON
  - Set status to 'confirmed'
  - Save payment method
  ↓
[Clear session storage]
  ↓
[Display success page]
  - Booking code
  - Confirmation message
  - Options: View Tickets / Back to Home
  ↓
END
```

#### Flow 5: View My Tickets
```
START
  ↓
[User clicks "My Tickets"]
  ↓
[Check authentication]
  ↓
IF NOT AUTHENTICATED:
  [Redirect to login]
  ↓
[Frontend requests user bookings]
  ↓
[Backend queries bookings table]
  - WHERE userId = current user
  - ORDER BY createdAt DESC
  ↓
[Backend returns bookings]
  ↓
[Frontend displays bookings in tabs:]
  - All
  - Confirmed
  - Pending
  - Cancelled
  ↓
FOR EACH BOOKING:
  [Display booking card:]
    - Movie poster
    - Movie title
    - Booking date and time
    - Room name
    - Seat numbers
    - Total price
    - Booking code
    - Status badge
    - Actions (QR Code, Download) if confirmed
  ↓
[User can cancel booking]
  ↓
[Update booking status to 'cancelled']
  ↓
END
```

#### Flow 6: Profile Management
```
START
  ↓
[User clicks Account/Profile]
  ↓
[Check authentication]
  ↓
IF NOT AUTHENTICATED:
  [Redirect to login]
  ↓
[Load user profile data]
  ↓
[Display profile form:]
  - First Name
  - Last Name
  - Email (read-only)
  - Phone
  - Email Notifications toggle
  - SMS Notifications toggle
  ↓
[User updates information]
  ↓
[Click Save]
  ↓
[Backend validates updates]
  ↓
[Update user record in database]
  ↓
[Return updated user data]
  ↓
[Display success message]
  ↓
END
```

#### Flow 7: Movie Data Synchronization (Admin)
```
START
  ↓
[Admin triggers movie fetch]
  ↓
[POST /api/movies/fetch]
  ↓
[Backend connects to TMDB API]
  ↓
[Fetch from multiple endpoints:]
  - Popular movies
  - Now playing
  - Upcoming
  - Top rated
  ↓
FOR EACH MOVIE:
  [Fetch detailed information]
    - Movie details
    - Credits (director, cast)
    - Images (poster, backdrop)
  ↓
[Convert TMDB format to app format]
  ↓
[Determine movie status:]
  - isNowShowing (released in last 6 months)
  - isComingSoon (future release date)
  - isFeatured (rating >= 7.5 or popularity > 50)
  ↓
[Store in movies.json file]
  ↓
[Return fetch results]
  - Success count
  - Failed count
  - Movies array
  ↓
END
```

### Error Handling Flows:

#### Authentication Error Flow:
```
[User action requiring auth]
  ↓
[Check JWT token]
  ↓
IF TOKEN INVALID/EXPIRED:
  [Clear localStorage]
  [Redirect to login]
  [Show error message]
  ↓
END
```

#### Booking Error Flow:
```
[User attempts booking]
  ↓
IF SEATS ALREADY OCCUPIED:
  [Show error: "Seats no longer available"]
  [Refresh seat map]
  ↓
IF PAYMENT FAILS:
  [Show error message]
  [Keep booking in session storage]
  [Allow retry]
  ↓
IF BOOKING DATA MISSING:
  [Show error: "Booking information missing"]
  [Redirect to home]
  ↓
END
```

### System Components:

**Frontend Components:**
- Navbar (navigation)
- MovieCard (movie display)
- MovieSection (movie grid)
- SeatMap (seat selection)
- RoomSelector (room selection)
- ShowtimeSelector (showtime selection)
- BookingSummary (booking review)
- PaymentForm (payment processing)
- BookingList (ticket display)

**Backend Services:**
- authService.js (authentication)
- bookingService.js (booking management)
- movieService.js (movie data management)
- db.js (database connection)

**Data Stores:**
- SQLite Database (users, sessions, bookings)
- movies.json file (movie data)
- Static code data (viewingRooms)
- Session storage (pending bookings)

**External Systems:**
- TMDB API (movie data source)
- Payment gateways (GCash, PayMaya, Bank, Credit Card)

### API Endpoint Summary:

**Authentication:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- PUT /api/auth/profile

**Movies:**
- POST /api/movies/fetch
- GET /api/movies
- GET /api/movies/:id
- GET /api/movies/popular
- GET /api/movies/now-showing
- GET /api/movies/coming-soon
- GET /api/movies/featured
- GET /api/movies/filter

**Bookings:**
- POST /api/bookings
- GET /api/bookings
- GET /api/bookings/:id
- PUT /api/bookings/:id/cancel

**System:**
- GET /api/health

### Data Relationships:

1. **Users → Bookings** (One-to-Many)
   - One user can have many bookings
   - Foreign key: bookings.userId references users.id

2. **Users → Sessions** (One-to-Many)
   - One user can have multiple active sessions
   - Foreign key: sessions.userId references users.id

3. **Bookings → Movies** (Many-to-One, logical)
   - Many bookings reference one movie (by movieId)
   - Movie data stored in JSON, not database

4. **Bookings → Rooms** (Many-to-One, logical)
   - Many bookings reference one room (by roomId)
   - Room data stored in static code

### Business Rules:

1. **Booking Rules:**
   - User must be authenticated to create booking
   - Booking code must be unique (format: CMX-YYYY-#####)
   - Seats stored as JSON array in bookings table
   - Booking status: pending → confirmed → (cancelled)
   - Total price calculated: basePrice × roomMultiplier × seatCount

2. **Movie Rules:**
   - Movies fetched from TMDB API
   - isNowShowing: released within last 6 months
   - isComingSoon: release date in future
   - isFeatured: rating >= 7.5 OR popularity > 50

3. **Room Rules:**
   - 4 room types: basic, 3d, premium, vip
   - Price multipliers: 1.0, 1.3, 1.8, 2.5 respectively
   - Showtimes generated: 10:00, 13:00, 16:00, 19:00, 22:00

4. **Authentication Rules:**
   - JWT token expires in 7 days
   - Passwords hashed with bcrypt
   - Tokens can be blacklisted on logout
   - Email must be unique

### Security Considerations:

1. **Authentication:**
   - JWT tokens for session management
   - Password hashing with bcrypt
   - Token blacklisting on logout
   - Protected routes require valid token

2. **Data Validation:**
   - Input validation on all API endpoints
   - SQL injection prevention (parameterized queries)
   - XSS prevention (React auto-escaping)

3. **Authorization:**
   - Users can only view their own bookings
   - Booking cancellation requires ownership verification

---

**Note:** This documentation covers all major flows and system components. Use this information to create detailed flowcharts and system diagrams.

