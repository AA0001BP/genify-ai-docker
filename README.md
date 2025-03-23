# Text Humanizer Web Application

A web application that transforms robotic text into natural, human-like language with user authentication.

## Features

- Landing page to introduce the application
- Secure MongoDB-based user authentication system
- Main page for text humanization with input and output fields
- Integration with HIX.AI Bypass API for text transformation
- Clean and responsive design

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- MongoDB & Mongoose for user data storage
- JSON Web Tokens (JWT) for authentication
- bcryptjs for secure password hashing
- Axios for API calls
- React Hook Form for form handling

## API Integration

The application integrates with the HIX.AI Bypass API using the following endpoints:

- `POST /submit` - Submit a humanization task
- `GET /obtain` - Retrieve the humanized text result

### Configuration

API settings are configured through environment variables:

```
NEXT_PUBLIC_HUMANIZER_API_KEY=ce5c178fc7644851bced0bcb19ab881f
NEXT_PUBLIC_HUMANIZER_API_URL=https://bypass.hix.ai/api/hixbypass/v1
NEXT_PUBLIC_USE_REAL_API=true

# MongoDB and JWT Configuration
MONGODB_URI=mongodb://localhost:27017/humanizer
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
```

Set `NEXT_PUBLIC_USE_REAL_API` to `true` to use the actual API or `false` to use the simulated API for development.

### API Requirements

- The input text must be at least 50 words long
- The API uses the "Latest" humanization mode for optimal results
- API responses may take a few moments depending on text length and complexity

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- MongoDB (local installation or connection to MongoDB Atlas)
  - See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed MongoDB setup instructions

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd humanizer_project
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   - Create a `.env.local` file with the API and MongoDB configuration (see above)

4. Start MongoDB
   - Make sure MongoDB is running locally (see [MONGODB_SETUP.md](./MONGODB_SETUP.md))

5. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication System

The application uses a secure MongoDB-based authentication system:

- **Registration:** Users can create a new account with name, email, and password
- **Login:** Secure login with email and password
- **Session Management:** JWT tokens stored in HTTP-only cookies for secure sessions
- **Protected Routes:** The humanizer functionality is available only to logged-in users
- **Admin Access:** Special admin privileges can be granted to manage the affiliate program

## Usage

1. **Home Page**: The landing page provides an introduction to the application.
2. **Login/Signup**: Create an account or login to access the humanizer.
3. **Humanize Page**: 
   - Enter text in the input field (minimum 50 words)
   - Click "Humanize Text" to process
   - View the humanized result in the output field

## Admin Panel

The application includes an admin panel for managing the affiliate program:

### Features

- View comprehensive affiliate statistics (total affiliates, referrals, conversions, earnings)
- Process payout requests (approve, reject, or mark as paid)
- Add notes to payout requests
- Track processed payments

### Accessing the Admin Panel

1. An account must have admin privileges to access the admin panel
2. Set up an admin account using the provided script:
   ```bash
   node scripts/make-admin.js user@email.com
   ```
3. Log out and log back in to refresh the session token
4. Access the admin panel at `/admin/affiliate`

For detailed instructions, see [ADMIN-GUIDE.md](./ADMIN-GUIDE.md).

## Production Deployment

For production, it's recommended to:

1. Use a managed MongoDB service like MongoDB Atlas
2. Update the `MONGODB_URI` in your environment variables
3. Set a strong, unique `JWT_SECRET` for production
4. Enable HTTPS for secure cookie transmission
