# AI Recruitment Matcher

## Overview

This is an AI-powered recruitment tool that compares job descriptions with consultant profiles using document similarity analysis. The application allows HR professionals to upload job descriptions and consultant CVs, then uses OpenAI's GPT-4o model to analyze and rank the best matches based on skills, experience, and contextual fit. The system provides detailed scoring metrics and matched skills to help recruiters make informed decisions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom CSS variables for theming and Material Design-inspired shadows
- **State Management**: TanStack Query (React Query) for server state management and caching
- **File Upload**: React Dropzone for drag-and-drop file upload functionality
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging
- **File Processing**: Multer for multipart form handling with file type validation (PDF, DOC, DOCX, TXT)
- **Text Extraction**: Basic text extraction for uploaded documents (extensible for PDF/Word parsing)
- **Development**: Hot reload with Vite middleware integration

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for cloud hosting
- **Schema**: Two main tables - documents (for job descriptions and consultant profiles) and analyses (for matching results)
- **Fallback**: In-memory storage implementation for development/testing scenarios
- **Session Management**: PostgreSQL session store with connect-pg-simple

### Authentication and Authorization
- **Current State**: No authentication system implemented
- **Session Support**: Express sessions configured with PostgreSQL store
- **Future Extensibility**: Architecture prepared for user authentication and authorization layers

### AI Integration and Processing
- **AI Provider**: Google Gemini AI (gemini-2.5-pro and gemini-2.5-flash models) for document analysis and similarity scoring
- **Analysis Types**: Multi-dimensional scoring including skills match, experience match, context match, and overall score
- **Processing Pipeline**: Asynchronous job processing for document analysis with status tracking
- **Scoring Algorithm**: AI-powered evaluation with structured JSON response format for consistent results

## External Dependencies

### Core Runtime Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm with drizzle-zod for schema validation
- **AI Service**: Google Gemini AI API for document similarity analysis
- **File Upload**: multer for handling multipart form data

### Frontend UI/UX Libraries
- **Component System**: Comprehensive Radix UI component collection (@radix-ui/react-*)
- **Icons**: Lucide React for consistent iconography
- **Styling Utilities**: class-variance-authority, clsx, and tailwind-merge for dynamic styling
- **Date Handling**: date-fns for date manipulation and formatting

### Development and Build Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Development Tools**: @replit/vite-plugin-runtime-error-modal and @replit/vite-plugin-cartographer for Replit integration
- **Code Quality**: ESBuild for production bundling and TypeScript compiler for type checking
- **Process Management**: tsx for TypeScript execution in development

### Optional Integrations
- **Deployment**: Configured for Replit hosting with development banner integration
- **Database Migrations**: Drizzle Kit for schema migrations and database management
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions (configured but not actively used)