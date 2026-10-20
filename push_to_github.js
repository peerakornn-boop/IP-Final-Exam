const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const dir = __dirname;
const remoteUrl = 'https://github.com/peerakornn-boop/IP-Final-Exam.git';

async function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        if (file === '.git' || file === 'node_modules' || file === '.DS_Store' || file === 'do_push.js') return;
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            const relPath = path.relative(dir, fullPath).replace(/\\/g, '/');
            arrayOfFiles.push(relPath);
        }
    });

    return arrayOfFiles;
}

async function prepareAndPush(token) {
    console.log('📦 Initializing Git repository...');
    try {
        await git.init({ fs, dir });
    } catch (e) {}

    const allFiles = await getAllFiles(dir);
    console.log(`📁 Adding ${allFiles.length} files to Git index...`);

    for (const f of allFiles) {
        await git.add({ fs, dir, filepath: f });
    }

    console.log('✍️ Creating commit...');
    try {
        const sha = await git.commit({
            fs,
            dir,
            message: 'Final Exam: HR Manager & Salary Analytics System complete implementation (std6730251506)',
            author: {
                name: 'Peerakorn Nilkaew',
                email: 'peerakorn.n@ku.th'
            }
        });
        console.log(`✅ Commit created: ${sha}`);
    } catch(e) {
        console.log('ℹ️ Commit status:', e.message);
    }

    try {
        await git.branch({ fs, dir, ref: 'main', checkout: true });
    } catch(e) {}

    try {
        await git.addRemote({
            fs,
            dir,
            remote: 'origin',
            url: remoteUrl,
            force: true
        });
    } catch (e) {}

    if (!token) {
        console.log('\n================================================================');
        console.log('⚠️ ไม่พบ GitHub Personal Access Token (PAT)');
        console.log('คุณสามารถ Push ไปยัง GitHub ได้ง่ายๆ เพียงพิมพ์คำสั่ง:');
        console.log('node push_to_github.js <YOUR_GITHUB_TOKEN>');
        console.log('================================================================\n');
        return;
    }

    console.log(`🚀 กำลัง Push ไปยัง ${remoteUrl} (branch: main)...`);
    try {
        const pushResult = await git.push({
            fs,
            http,
            dir,
            remote: 'origin',
            ref: 'main',
            force: true,
            onAuth: () => ({
                username: 'peerakornn-boop',
                password: token
            })
        });
        console.log('🎉 Push to GitHub สำเร็จเรียบร้อยสมบูรณ์!', pushResult);
    } catch (err) {
        console.error('❌ Push Failed:', err.message);
    }
}

const tokenArg = process.argv[2] || process.env.GITHUB_TOKEN;
if (tokenArg) {
    prepareAndPush(tokenArg);
} else {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('กรุณากรอก GitHub Personal Access Token (PAT): ', (t) => {
        rl.close();
        prepareAndPush(t.trim());
    });
}
