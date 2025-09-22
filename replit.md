# Overview

ParcelFlow is a modern parcel processing and routing system designed for distribution centers. The application processes XML parcel data, automatically routes packages to appropriate departments based on configurable business rules, and provides real-time dashboard monitoring. Built with a React frontend and Express backend, it offers comprehensive parcel management with department categorization, insurance handling, and status tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Styling**: Tailwind CSS with shadcn/ui component library providing consistent, accessible UI components
- **State Management**: TanStack Query (React Query) for server state management, caching, and synchronization
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API architecture with structured endpoints for parcels, business rules, and dashboard metrics
- **Middleware**: Custom logging middleware for API request tracking and error handling
- **File Processing**: Multer for XML file uploads with built-in XML parsing capabilities

## Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for cloud-based data persistence
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Fallback Storage**: In-memory storage implementation for development and testing scenarios

## Core Business Logic
- **Parcel Routing Engine**: Configurable business rules system that automatically categorizes parcels into departments (mail ≤1kg, regular 1-10kg, heavy >10kg)
- **Insurance Processing**: Automatic insurance requirement detection for high-value parcels (>$1000) with approval workflows
- **XML Processing**: Robust XML parser handling various container formats for bulk parcel import
- **Department Management**: Dynamic department system with custom categories, color coding, and icon assignment

## Authentication and Session Management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple for persistent user sessions
- **Security**: Environment-based configuration with secure database connection handling

## External Dependencies
- **Database**: Neon Database serverless PostgreSQL for production data storage
- **UI Components**: Radix UI primitives for accessible, unstyled components with shadcn/ui styling
- **Development Tools**: ESBuild for production bundling, TSX for development server with hot reload
- **Styling**: PostCSS with Autoprefixer for CSS processing and browser compatibility