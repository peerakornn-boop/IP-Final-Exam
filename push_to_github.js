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
        if (file === '.git' || file === 'node_modules' || file === '.DS_Store') return;
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
    console.log(`📁 Adding ${allFiles.length} files to Git index:`);

    for (const f of allFiles) {
        await git.add({ fs, dir, filepath: f });
        console.log(`   + ${f}`);
    }

    console.log('✍️ Creating commit...');
    const sha = await git.commit({
        fs,
        dir,
        message: 'Final Exam: Complete HR Manager & Salary Analytics System implementation (std6730251506)',
        author: {
            name: 'Peerakorn Nilkaew',
            email: 'peerakorn.n@ku.th'
        }
    });
    console.log(`✅ Commit created: ${sha}`);

    // Set remote
    try {
        await git.addRemote({
            fs,
            dir,
            remote: 'origin',
            url: remoteUrl,
            force: true
        });
    } catch (e) {
        // remote might already exist
    }

    if (!token) {
        console.log('\n⚠️ No GitHub token provided yet.');
        console.log('To push to https://github.com/peerakornn-boop/IP-Final-Exam.git :');
        console.log('Run: node push_to_github.js <YOUR_GITHUB_TOKEN>');
        return;
    }

    console.log(`🚀 Pushing to ${remoteUrl} (branch: main)...`);
    try {
        const pushResult = await git.push({
            fs,
            http,
            dir,
            remote: 'origin',
            ref: 'main',
            force: true,
            onAuth: () => ({
                username: token || 'peerakornn-boop',
                password: token
            })
        });
        console.log('🎉 Push to GitHub Successful!', pushResult);
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
    rl.question('กรุณากรอก GitHub Personal Access Token (PAT) เพื่อ push (หรือกด Enter เพื่อ commit ไว้อย่างเดียว): ', (t) => {
        rl.close();
        prepareAndPush(t.trim());
    });
}
