/**
 * Connects to Cloud Server SSH (119.59.102.161:2222) and maintains the Express API on port 3112
 * Student: std6730251506 (Peerakorn Nilkaew)
 */
const { Client } = require('ssh2');

const conn = new Client();

console.log('================================================================');
console.log(' 🔄 Connecting to Cloud Server SSH (119.59.102.161:2222)...');
console.log(' Student ID: std6730251506');
console.log('================================================================');

conn.on('ready', () => {
    console.log('✅ SSH Connection Established!');
    console.log('🚀 Starting HR Manager & Salary Analytics API on Port 3112...');
    
    conn.shell((err, stream) => {
        if (err) throw err;

        stream.on('data', (data) => {
            process.stdout.write(data.toString());
        });

        stream.on('close', () => {
            console.log('\n❌ SSH Connection Terminated');
            conn.end();
            process.exit(0);
        });

        // Navigate to /app and start server.js
        stream.write('cd /app && node server.js\n');
    });
}).on('error', (err) => {
    console.error('❌ SSH Error:', err.message);
}).connect({
    host: '119.59.102.161',
    port: 2222,
    username: 'std6730251506',
    password: 'D1w!uPiR'
});
