import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Docker from 'dockerode';
import { SUPPORTED_LANGS } from '../../config';

const docker = new Docker();

// Set a maximum execution time in milliseconds (e.g., 5000 = 5 seconds)
const MAX_EXECUTION_TIME = 5000;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { language, code, stdin } = req.body;

    if (!language || !code) {
        return res.status(400).json({ error: 'Language and code are required.' });
    }

    if (!SUPPORTED_LANGS.includes(language)) {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    const filename = uuidv4();
    const tempDir = path.join('/tmp', filename);
    fs.mkdirSync(tempDir);

    let sourceFile;
    let imageName;

    try {
        // Map language to Docker image and source file
        switch (language) {
            case 'c':
                sourceFile = path.join(tempDir, `${filename}.c`);
                imageName = 'code-runner-c';
                break;
            case 'cpp':
                sourceFile = path.join(tempDir, `${filename}.cpp`);
                imageName = 'code-runner-c';
                break;
            case 'java':
                sourceFile = path.join(tempDir, 'Main.java');
                imageName = 'code-runner-java';
                break;
            case 'python':
                sourceFile = path.join(tempDir, `${filename}.py`);
                imageName = 'code-runner-python';
                break;
            case 'javascript':
                sourceFile = path.join(tempDir, `${filename}.js`);
                imageName = 'code-runner-node';
                break;
            case 'ruby':
                sourceFile = path.join(tempDir, `${filename}.rb`);
                imageName = 'code-runner-ruby';
                break;
            case 'go':
                sourceFile = path.join(tempDir, `${filename}.go`);
                imageName = 'code-runner-go';
                break;
            case 'php':
                sourceFile = path.join(tempDir, `${filename}.php`);
                imageName = 'code-runner-php';
                break;
            case 'rust':
                sourceFile = path.join(tempDir, `${filename}.rs`);
                imageName = 'code-runner-rust';
                break;
            case 'kotlin':
                sourceFile = path.join(tempDir, `${filename}.kt`);
                imageName = 'code-runner-kotlin';
                break;
            default:
                throw new Error('Unsupported language');
        }

        fs.writeFileSync(sourceFile, code);

        // Create tar archive to copy code into container
        const tar = require('tar-stream').pack();
        tar.entry({ name: path.basename(sourceFile) }, code);
        tar.finalize();

        // Create the container
        const container = await docker.createContainer({
            Image: imageName,
            Tty: false,
            AttachStdout: true,
            AttachStderr: true,
            Cmd: determineCommand(language, sourceFile, stdin),
            HostConfig: {
                AutoRemove: false,
                Memory: 256 * 1024 * 1024, // 256 MB
                CpuQuota: 25000, // 25% of a single CPU
            },
        });

        // Copy the source file into the container
        await container.putArchive(tar, { path: '/code' });

        // Start the container and process logs with timeout
        const output = await executeAndCaptureLogs(container, MAX_EXECUTION_TIME);

        // Respond with the captured output
        res.status(200).json(output);
    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({ error: error.message || 'An error occurred during execution.' });
    } finally {
        // Clean up temporary files
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

async function executeAndCaptureLogs(container, timeoutMs) {
    await container.start();

    const logs = await container.logs({
        stdout: true,
        stderr: true,
        follow: true,
    });

    let stdout = '';
    let stderr = '';

    let timeoutId;
    const logsPromise = new Promise((resolve, reject) => {
        logs.on('data', (chunk) => {
            const cleanOutput = cleanDockerLogStream(chunk);
            stdout += cleanOutput.stdout;
            stderr += cleanOutput.stderr;
        });

        logs.on('error', (err) => reject(err));

        logs.on('end', async () => {
            // Logs ended naturally before timeout
            clearTimeout(timeoutId);
            // Attempt to stop and remove the container if still running
            try {
                await container.stop({ t: 0 });
            } catch (stopErr) {
                // If stopping fails, try killing
                try {
                    await container.kill();
                } catch (killErr) {
                    console.error('Error killing container after logs end:', killErr);
                }
            }

            try {
                await container.remove({ force: true });
            } catch (removeErr) {
                console.error('Error removing container after logs end:', removeErr);
            }

            resolve({ stdout, stderr });
        });

        // Set the timeout
        timeoutId = setTimeout(async () => {
            // Timeout reached, attempt to stop/kill container
            try {
                await container.stop({ t: 0 });
            } catch (e) {
                console.error('Error stopping container on timeout:', e);
                // If stop fails, try kill
                try {
                    await container.kill();
                } catch (killErr) {
                    console.error('Error killing container on timeout:', killErr);
                }
            }

            try {
                await container.remove({ force: true });
            } catch (removeErr) {
                console.error('Error removing container on timeout:', removeErr);
            }

            reject(new Error('Execution timed out'));
        }, timeoutMs);
    });

    return logsPromise.catch((error) => {
        // On error, return the stderr message
        return { stdout: '', stderr: error.message };
    });
}

/**
 * Cleans Docker log stream output by removing the 8-byte header.
 */
function cleanDockerLogStream(chunk) {
    let stdout = '';
    let stderr = '';

    let i = 0;
    while (i < chunk.length) {
        const streamType = chunk[i]; // First byte: stream type
        const payloadLength = chunk.readUInt32BE(i + 4); // 4-byte length
        const payload = chunk.slice(i + 8, i + 8 + payloadLength);

        if (streamType === 1) {
            stdout += payload.toString();
        } else if (streamType === 2) {
            stderr += payload.toString();
        }

        i += 8 + payloadLength;
    }

    return { stdout, stderr };
}

/**
 * Determines the command to execute based on language.
 */
function determineCommand(language, sourceFile, stdin) {
    switch (language) {
        case 'python':
            return ['sh', '-c', `echo "${stdin}" | python3 /code/${path.basename(sourceFile)}`];
        case 'c':
            return ['sh', '-c', `gcc /code/${path.basename(sourceFile)} -o /code/a.out && echo "${stdin}" | /code/a.out`];
        case 'cpp':
            return ['sh', '-c', `g++ /code/${path.basename(sourceFile)} -o /code/a.out && echo "${stdin}" | /code/a.out`];
        case 'java':
            return ['sh', '-c', `javac /code/${path.basename(sourceFile)} && echo "${stdin}" | java -cp /code Main`];
        case 'javascript':
            return ['sh', '-c', `echo "${stdin}" | node /code/${path.basename(sourceFile)}`];
        case 'ruby':
            return ['sh', '-c', `echo "${stdin}" | ruby /code/${path.basename(sourceFile)}`];
        case 'go':
            return ['sh', '-c', `go run /code/${path.basename(sourceFile)}`];
        case 'php':
            return ['sh', '-c', `echo "${stdin}" | php /code/${path.basename(sourceFile)}`];
        case 'rust':
            return ['sh', '-c', `rustc /code/${path.basename(sourceFile)} -o /code/a.out && echo "${stdin}" | /code/a.out`];
        case 'kotlin':
            return ['sh', '-c', `kotlinc /code/${path.basename(sourceFile)} -include-runtime -d /code/main.jar && echo "${stdin}" | java -jar /code/main.jar`];
        default:
            throw new Error('Unsupported language');
    }
}