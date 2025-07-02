# SoulSeer - Netlify Deployment Guide

This repository has been configured for deployment on Netlify. The original Heroku-specific configurations have been removed and replaced with Netlify-compatible setups.

## Project Structure

The project now follows Netlify's serverless architecture:

- **Frontend**: React app built with Vite, located in the `client/` directory
- **Backend**: Express.js API converted to Netlify Functions in the `netlify/functions/` directory
- **WebRTC**: Signaling server code in `netlify/functions/websocket.js` (see WebSocket notes below)

## Environment Variables

Copy the example environment files and update them with your actual credentials:

1. Root `.env` file: Copy from `.env.example`
2. Client `.env` file: Copy from `client/.env.example`

## Local Development

Run the project locally with:

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Start development server
npm run dev
```

This will start both the API server and the Vite development server with proper proxying.

## Deployment to Netlify

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Create a new site in Netlify and connect to your GitHub repository
3. Set the following build settings:
   - Build command: `npm run netlify-build`
   - Publish directory: `client/dist`
4. Add all required environment variables in the Netlify dashboard
5. Deploy!

### Manual Deployment

You can also deploy manually using the Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and configure site
netlify init

# Deploy
netlify deploy --prod
```

## Important Notes

### WebSocket Support

Netlify Functions don't support long-lived connections like WebSockets out of the box. For the WebRTC signaling functionality, consider:

1. Using a dedicated WebSocket service like Pusher, Socket.io Cloud, or similar
2. Using Netlify's WebSocket streaming feature (currently in beta)
3. Migrating to Netlify Edge Functions which have better WebSocket support

The WebSocket code is provided in `netlify/functions/websocket.js` for reference, but for production use, you'll need to implement one of the alternatives above.

### Database Connection

Make sure your MongoDB connection string is updated in your environment variables and is accessible from Netlify Functions.

### API Endpoints

All API endpoints are now accessed through `/.netlify/functions/api/*` instead of the original `/api/*` paths. The frontend code has been updated to use these new endpoints.

## Additional Configuration

Review and update the following files as needed:

- `netlify.toml`: Build settings and redirects
- `client/vite.config.js`: Development proxy settings
- `package.json`: Scripts and dependencies