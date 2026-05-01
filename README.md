# Online Feedback Management System

A full-stack web application for managing user feedback with role-based authentication and analytics dashboard.

## Features

- **User Authentication**: Register and login with role-based access (User/Admin)
- **Feedback Management**: Submit, view, update, and delete feedback
- **Categories & Ratings**: Organize feedback by categories with 1-5 star ratings
- **Admin Dashboard**: Monitor all feedback, filter by status/category, and view analytics
- **Data Analytics**: Average ratings, category distribution, and status tracking
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend

- Node.js with Express.js
- JWT for authentication
- bcryptjs for password hashing
- File-based data storage (JSON files)
- CORS enabled

### Frontend

- React with React Router
- Axios for API calls
- Chart.js for data visualization
- CSS for styling

## Project Structure

```
/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── data/ (created automatically)
│       ├── users.json
│       └── feedback.json
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.js
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js
        │   ├── FeedbackForm.js
        │   ├── FeedbackList.js
        │   └── AdminDashboard.js
        ├── App.js
        ├── index.js
        └── index.css
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```
   or for development with auto-reload:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## Usage

### First Time Setup

1. Register a new user account (or create an admin account by selecting "Administrator" role)
2. Login with your credentials

### User Features

- **Submit Feedback**: Fill out the feedback form with title, description, category, and rating
- **View Feedback**: See all your submitted feedback with status updates
- **Update Feedback**: Edit your existing feedback (title, description, category, rating)
- **Delete Feedback**: Remove feedback you no longer want to submit

### Admin Features

- **Dashboard Overview**: View total feedback count and average ratings
- **Analytics Charts**: See feedback distribution by category and status
- **Manage All Feedback**: View, filter, and update status of all user feedback
- **Approve/Reject**: Change feedback status from pending to approved/rejected

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Feedback

- `GET /api/feedback` - Get feedback (filtered by user role)
- `POST /api/feedback` - Create new feedback
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

### Analytics (Admin Only)

- `GET /api/analytics` - Get feedback analytics

## Data Storage

The application uses JSON files for data persistence:

- `backend/data/users.json` - User accounts and authentication data
- `backend/data/feedback.json` - All feedback submissions

**Note**: This is a demonstration application. In production, consider using a proper database like PostgreSQL, MySQL, or MongoDB.

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control (User/Admin)
- Input validation and error handling
- CORS protection

## Future Enhancements

- Database integration (PostgreSQL/MySQL)
- Email notifications for feedback updates
- File attachments for feedback
- Advanced filtering and search
- User profile management
- Export analytics to PDF/CSV
- Real-time notifications with WebSockets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
