# BDO Guild Management - Deployment Guide

## Prerequisites

1. A Vercel account
2. A Vercel Postgres database

## Deployment Steps

### 1. Deploy to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Deploy the application

### 2. Set up Vercel Postgres Database

1. In your Vercel dashboard, go to the Storage tab
2. Create a new Postgres database
3. Copy the connection string and environment variables

### 3. Configure Environment Variables

In your Vercel project settings, add the following environment variables:

```
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
```

### 4. Initialize Database

After deployment, the database tables will be automatically created when you first access the application.

## Default Login Credentials

- **Username:** admin
- **Password:** bdo2024

## Features

### Guild Management
- Add, edit, and delete alliance guilds
- Generate unique registration codes
- Set mercenary quotas for each guild
- Store contact information

### Message Generator
- Generate formatted Discord messages
- Include guild names, registration codes, and quotas
- Copy to clipboard or download as text file
- Ready to send to guild Discord channels

### Quota Tracker
- Track mercenary registrations in real-time
- Monitor quota usage during boss fights
- Visual indicators for quota limits
- Easy increment/decrement controls

## Usage Workflow

1. **Sunday (Preparation):**
   - Use the Message Generator to create Discord messages
   - Send messages to each guild's Discord channel or contact person

2. **Monday (Boss Fight):**
   - Use the Quota Tracker to monitor registrations
   - Update quotas as mercenaries register in-game
   - Track which guilds have reached their limits

## Security Notes

- The application uses simple authentication for demo purposes
- In production, consider implementing proper authentication
- Database credentials are stored securely in Vercel environment variables
- All database operations are server-side for security

## Support

For issues or questions, please check the application logs in your Vercel dashboard.
