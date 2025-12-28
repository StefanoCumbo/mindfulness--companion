Mindfulness Companion – Quick Start Instructions
-------------------------------------------------

Live Link: https://mindfulness--companion.stefanocumbo72.workers.dev 


SETUP 
1. Install dependencies
   npm install

2. Login to Cloudflare
   npx wrangler login
   
   (Opens browser - authorize with your Cloudflare account)

3. Create KV namespace for storage
   npx wrangler kv:namespace create "REFLECTIONS"
   
   Copy the ID from output, looks like:

4. Update wrangler.json
   Open wrangler.json and add your KV ID:
   
   "kv_namespaces": [
     {
       "binding": "REFLECTIONS",
       "id": "YOUR_KV_ID_HERE"  ← Paste your ID here
     }
   ]

-------------------------------------------------
RUNNING LOCALLY
-------------------------------------------------

5. Start dev server
   npm run dev
  
6. Test the app
   - Click "Start Journaling"
   - Type a message and click Send
   - AI should respond in 1-3 seconds
   - Go to "View Past Reflections" to see history

DEPLOYING

7a. Push to GitHub
    git add .
    git commit -m "Initial commit"
    git push origin main

8a. Connect to Cloudflare Pages
    - Go to https://dash.cloudflare.com
    - Navigate to Workers & Pages
    - Click "Create application" → Pages → "Connect to Git"
    - Select your repository
    - Build settings:
       Build command: npm run build
       Build output: build/client
    - Click "Save and Deploy"

9a. Done!
    Every push to main auto-deploys.
    Your URL: https://your-project.pages.dev



  