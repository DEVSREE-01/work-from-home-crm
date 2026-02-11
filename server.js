// server.js - Backend server with database
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize SQLite Database
const db = new sqlite3.Database('./leads.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

// Create tables if they don't exist
function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            called_at DATETIME,
            created_by TEXT DEFAULT 'website'
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Leads table ready');
        }
    });
}

// API Routes

// 1. Submit new lead (from landing page)
app.post('/api/register', (req, res) => {
    const { name, phone } = req.body;

    // Validation
    if (!name || !phone) {
        return res.status(400).json({ 
            success: false, 
            message: 'Name and phone are required' 
        });
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid phone number' 
        });
    }

    // Check for duplicate phone number
    db.get('SELECT * FROM leads WHERE phone = ?', [phone], (err, row) => {
        if (row) {
            return res.status(400).json({ 
                success: false, 
                message: 'This phone number is already registered' 
            });
        }

        // Insert new lead
        const stmt = db.prepare('INSERT INTO leads (name, phone) VALUES (?, ?)');
        stmt.run(name, phone, function(err) {
            if (err) {
                console.error('Error inserting lead:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error saving data' 
                });
            }

            res.json({ 
                success: true, 
                message: 'Registration successful',
                leadId: this.lastID
            });
        });
        stmt.finalize();
    });
});

// 2. Get all leads (for CRM dashboard)
app.get('/api/leads', (req, res) => {
    const { status, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM leads';
    let params = [];

    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching leads:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching data' 
            });
        }

        // Get total count
        db.get('SELECT COUNT(*) as total FROM leads', (err, countRow) => {
            res.json({ 
                success: true, 
                leads: rows,
                total: countRow ? countRow.total : 0
            });
        });
    });
});

// 3. Get single lead by ID
app.get('/api/leads/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching data' 
            });
        }

        if (!row) {
            return res.status(404).json({ 
                success: false, 
                message: 'Lead not found' 
            });
        }

        res.json({ 
            success: true, 
            lead: row 
        });
    });
});

// 4. Update lead status/notes
app.put('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    let updates = [];
    let params = [];

    if (status) {
        updates.push('status = ?');
        params.push(status);
        
        if (status === 'called') {
            updates.push('called_at = CURRENT_TIMESTAMP');
        }
    }

    if (notes !== undefined) {
        updates.push('notes = ?');
        params.push(notes);
    }

    if (updates.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'No updates provided' 
        });
    }

    params.push(id);

    const query = `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, params, function(err) {
        if (err) {
            console.error('Error updating lead:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error updating data' 
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Lead not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Lead updated successfully' 
        });
    });
});

// 5. Delete lead
app.delete('/api/leads/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM leads WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error deleting data' 
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Lead not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Lead deleted successfully' 
        });
    });
});

// 6. Get statistics
app.get('/api/stats', (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM leads',
        new: 'SELECT COUNT(*) as count FROM leads WHERE status = "new"',
        called: 'SELECT COUNT(*) as count FROM leads WHERE status = "called"',
        converted: 'SELECT COUNT(*) as count FROM leads WHERE status = "converted"',
        today: 'SELECT COUNT(*) as count FROM leads WHERE DATE(created_at) = DATE("now")'
    };

    const stats = {};
    let completed = 0;

    Object.keys(queries).forEach(key => {
        db.get(queries[key], (err, row) => {
            stats[key] = row ? row.count : 0;
            completed++;

            if (completed === Object.keys(queries).length) {
                res.json({ 
                    success: true, 
                    stats 
                });
            }
        });
    });
});

// Serve landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing-page.html'));
});

// Serve CRM dashboard
app.get('/crm', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'crm-dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Landing page: http://localhost:${PORT}`);
    console.log(`CRM Dashboard: http://localhost:${PORT}/crm`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
