# Work From Home - Lead Management System

Complete CRM solution for managing work-from-home opportunity leads with database storage.

## 📋 Features

### Landing Page
- ✅ Mobile-responsive design
- ✅ Form validation
- ✅ Direct database storage
- ✅ Success confirmation
- ✅ Duplicate prevention

### CRM Dashboard
- 📊 Real-time statistics
- 📋 Lead management table
- 🔍 Search and filter functionality
- ✏️ Edit lead status and notes
- 📞 Mark as called
- 🗑️ Delete leads
- 📈 Performance tracking

### Database
- 💾 SQLite database (lightweight, no setup needed)
- 🔐 Data persistence
- 📝 Complete lead history
- ⏰ Timestamps for all actions

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

### Step 3: Access the Application

**Landing Page (for users):**
```
http://localhost:3000
```

**CRM Dashboard (for your team):**
```
http://localhost:3000/crm
```

## 📁 Project Structure

```
├── server.js                           # Backend server with API
├── package.json                        # Dependencies
├── leads.db                           # SQLite database (auto-created)
└── public/
    ├── landing-page.html              # User registration form
    └── crm-dashboard.html             # Team CRM dashboard
```

## 🔧 Configuration

### File Setup
1. Create a `public` folder in your project directory
2. Move these files to the `public` folder:
   - `landing-page-with-backend.html` → rename to `landing-page.html`
   - `crm-dashboard.html` → keep as is

### Folder Structure:
```
your-project/
├── server.js
├── package.json
└── public/
    ├── landing-page.html
    └── crm-dashboard.html
```

## 🌐 Deployment

### Option 1: Free Hosting (Render.com)
1. Push code to GitHub
2. Sign up at render.com
3. Create new Web Service
4. Connect your GitHub repo
5. Deploy!

### Option 2: Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Deploy: `git push heroku main`

### Option 3: VPS (DigitalOcean, AWS, etc.)
1. SSH into your server
2. Install Node.js
3. Clone your repo
4. Install dependencies: `npm install`
5. Use PM2 to keep running: `pm2 start server.js`
6. Set up nginx as reverse proxy

## 📊 API Endpoints

### Public Endpoints
- `POST /api/register` - Submit new lead
  ```json
  {
    "name": "John Doe",
    "phone": "9876543210"
  }
  ```

### Dashboard Endpoints
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/stats` - Get statistics

## 🔒 Security Recommendations

### For Production:
1. **Add Authentication** to CRM dashboard
2. **Use Environment Variables** for sensitive data
3. **Enable HTTPS** (required for production)
4. **Add Rate Limiting** to prevent abuse
5. **Input Sanitization** (already basic validation in place)
6. **Use PostgreSQL or MySQL** instead of SQLite for better performance

### Example: Adding Basic Auth
```javascript
// Add this middleware before dashboard routes
app.use('/crm', (req, res, next) => {
    const auth = {login: 'admin', password: 'your-password'};
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    
    if (login && password && login === auth.login && password === auth.password) {
        return next();
    }
    
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
});
```

## 💡 Usage Tips

### For Team Members:
1. Access CRM dashboard at `/crm`
2. New leads appear automatically
3. Click "Call" to mark as contacted
4. Edit status and add notes
5. Use search to find specific leads
6. Filter by status (New, Called, Converted, Rejected)

### Lead Statuses:
- **New** - Just registered, not contacted yet
- **Called** - Team has called them
- **Converted** - Successfully onboarded
- **Rejected** - Not interested or didn't qualify

## 🎯 WhatsApp Message Update

Replace your WhatsApp link with your hosted URL:

```
🔗 https://your-domain.com
```

Or if using localhost for testing:
```
🔗 http://localhost:3000
```

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Change PORT in server.js: `const PORT = 3001;`

### Database not saving
- Check file permissions
- Ensure `leads.db` can be created in project folder

### Can't access from phone
- Use your computer's local IP instead of localhost
- Find IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Access: `http://192.168.x.x:3000`

## 📞 Support

For issues or questions:
- Check the console for error messages
- Ensure all dependencies are installed
- Verify file structure matches above

## 🔄 Database Backup

### Manual Backup
```bash
cp leads.db leads-backup-$(date +%Y%m%d).db
```

### Export to CSV (add this endpoint to server.js)
```javascript
app.get('/api/export-csv', (req, res) => {
    db.all('SELECT * FROM leads', (err, rows) => {
        const csv = rows.map(r => 
            `${r.id},${r.name},${r.phone},${r.status},${r.created_at}`
        ).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.send('ID,Name,Phone,Status,Created\n' + csv);
    });
});
```

## 📈 Next Steps

1. Add email notifications when new leads register
2. WhatsApp integration for instant alerts
3. Analytics and reporting
4. Lead scoring system
5. Automated follow-up reminders
6. Team member assignment
7. Export to Excel functionality

---

**Ready to Start?**
1. Run `npm install`
2. Run `npm start`
3. Open `http://localhost:3000/crm`
4. Start managing leads! 🎉
