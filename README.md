# CodeHarbor - AI-Powered Recruitment Platform

CodeHarbor is an intelligent recruitment platform that leverages Google's Gemini AI to automatically analyze job descriptions and candidate resumes, providing HR professionals with data-driven insights for better hiring decisions.

## Features

### Core Functionality
- **AI-Powered Document Analysis**: Upload job descriptions and candidate resumes for intelligent matching
- **Smart Candidate Ranking**: Gemini AI analyzes skills, experience, and context to rank candidates
- **Reverse Job Matching**: Upload resumes and find the best job matches from available positions
- **Automated Email Reports**: Receive detailed analysis reports directly to your email
- **Document Management**: Support for PDF, DOC, DOCX, TXT, and ZIP files with proper text extraction
- **Real-time Processing**: Monitor analysis progress with live status updates

### Gemini AI Integration
- **API Configuration**: Easy setup of your Gemini API key through the settings panel
- **Connection Testing**: Verify API connectivity before processing documents
- **Secure Storage**: API keys are stored locally and securely
- **Intelligent Matching**: Advanced algorithms for skills, experience, and context matching

### User Experience
- **Modern UI**: Clean, responsive design with dark/light theme support
- **Real-time Notifications**: Get alerts for high-quality matches and processing completion
- **Comprehensive Analytics**: Detailed insights into matching performance and success rates
- **Mobile Responsive**: Works seamlessly across all devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **React Query** for data management
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Google Gemini AI** for document analysis
- **Multer** for file uploads

### Database
- **PostgreSQL** for data persistence
- **Drizzle Kit** for migrations

## Prerequisites

Before running CodeHarbor, ensure you have:

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database
3. **Google Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CodeHarbor
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/codeharbor"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key-here"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 4. Database Setup
```bash
# Push database schema
npm run db:push

# Or run migrations
npm run db:migrate
```

### 5. Start Development Server
```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:client  # Frontend
npm run dev:server  # Backend
```

## Configuration

### Gemini API Setup

1. **Get API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to obtain your Gemini API key
2. **Configure in App**: 
   - Go to Settings → General tab
   - Enter your API key in the Gemini AI Configuration section
   - Test the connection to ensure it's working
   - Save the configuration

### Email Notifications

Configure email settings in the Settings → Notifications tab:
- Enable/disable email notifications
- Set your HR email address
- Configure similarity thresholds for alerts
- Customize notification preferences

## Usage Guide

### 1. Upload Job Description
- Navigate to Documents page
- Click "Upload Documents"
- Select your job description file (PDF, DOC, DOCX, TXT)
- The system will automatically categorize it as a job description

### 2. Upload Candidate Resumes
- Select the job description from the dropdown
- Upload candidate resumes (individual files or ZIP archive)
- Files are automatically linked to the selected job

### 3. Start AI Analysis
- Go to Analytics page
- Click "Start Analysis" for your job
- Monitor progress in real-time
- Receive email notification when complete

### 4. Review Results
- View top candidate matches with similarity scores
- Analyze skills, experience, and context matching
- Access detailed reports and insights
- Export results for further review

### 5. Reverse Job Matching
- Upload candidate resumes to find suitable job positions
- Get AI-powered job recommendations with match scores
- View detailed analysis of skills, experience, and context fit
- Receive email notifications with comprehensive results

## API Endpoints

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents/upload` - Upload document
- `DELETE /api/documents/:id` - Delete document

### Analysis
- `POST /api/analysis` - Start job analysis
- `GET /api/analyses` - Get analysis results
- `POST /api/reverse-match` - Analyze resume and find job matches

### Gemini AI
- `POST /api/test-gemini` - Test API connection

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## Data Models

### Document
```typescript
interface Document {
  id: string;
  name: string;
  type: 'job_description' | 'consultant_profile';
  content: string;
  status: 'processing' | 'completed' | 'failed';
  jobDescriptionId?: string;
  uploadedAt: Date;
  createdAt: Date;
}
```

### Analysis
```typescript
interface Analysis {
  id: string;
  jobDescriptionId: string;
  jobTitle: string;
  status: 'processing' | 'completed' | 'failed';
  results: MatchResult[];
  createdAt: Date;
}
```

### Match Result
```typescript
interface MatchResult {
  consultantId: string;
  consultantName: string;
  role?: string;
  overallScore: number;
  skillsMatch: number;
  experienceMatch: number;
  contextMatch: number;
  matchedSkills: string[];
  experienceYears: string;
  summary: string;
}
```

## AI Analysis Process

### 1. Document Processing
- Extract text content from uploaded files
- Parse and structure job requirements
- Analyze candidate qualifications and experience

### 2. AI Matching
- Use Gemini AI to analyze document similarity
- Score candidates on multiple dimensions:
  - **Skills Match**: Technical skill alignment
  - **Experience Match**: Background and experience fit
  - **Context Match**: Overall role suitability
- Calculate weighted overall scores

### 3. Result Generation
- Rank candidates by overall score
- Generate detailed matching insights
- Create comprehensive reports
- Send email notifications

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Ensure all required environment variables are set in production:
- Database connection string
- Gemini API key
- Email service credentials
- Security keys and secrets

### Database Migration
```bash
npm run db:push
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

## Future Enhancements

- **Advanced AI Models**: Support for additional AI providers
- **Interview Scheduling**: Integrated calendar and scheduling
- **Candidate Tracking**: Full applicant lifecycle management
- **Advanced Analytics**: Machine learning insights and predictions
- **Mobile App**: Native iOS and Android applications
- **API Integrations**: Connect with popular HR platforms

---
