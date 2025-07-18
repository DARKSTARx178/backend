const fs = require('fs');
const path = require('path');
const { hashPassword } = require('./hash'); // Assuming hash.js is in the same directory

const usersFilePath = path.resolve(process.cwd(), 'api', 'users.json');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        let users = {};
        if (fs.existsSync(usersFilePath)) {
            const data = fs.readFileSync(usersFilePath, 'utf8');
            if (data) {
                users = JSON.parse(data);
            }
        }

        if (users[username]) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash the password before storing
        const hashedPassword = await hashPassword(password);
        users[username] = { password: hashedPassword }; // Store hashed password

        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
