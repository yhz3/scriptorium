import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Docker from 'dockerode';
import { SUPPORTED_LANGS } from '../../config';

const docker = new Docker();

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
                imageName = 'code-runner-c'; // Docker image for C
                break;
            case 'cpp':
                sourceFile = path.join(tempDir, `${filename}.cpp`);
                imageName = 'code-runner-c'; // Docker image for C++
                break;
            case 'java':
                sourceFile = path.join(tempDir, 'Main.java');
                imageName = 'code-runner-java'; // Docker image for Java
                break;
            case 'python':
                sourceFile = path.join(tempDir, `${filename}.py`);
                imageName = 'code-runner-python'; // Docker image for Python
                break;
            case 'javascript':
                sourceFile = path.join(tempDir, `${filename}.js`);
                imageName = 'code-runner-node'; // Docker image for Node.js
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
            Cmd: determineCommand(language, sourceFile),
            HostConfig: {
                AutoRemove: true, // Automatically remove container after execution
            },
        });

        // Copy the source file into the container
        await container.putArchive(tar, { path: '/code' });

        // Start the container and process logs
        const output = await executeAndCaptureLogs(container, stdin);

        // Respond with the captured output
        res.status(200).json(output);
    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({ error: 'An error occurred during execution.' });
    } finally {
        // Clean up temporary files
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

async function executeAndCaptureLogs(container, stdinData) {
    try {
        await container.start();

        const logs = await container.logs({
            stdout: true,
            stderr: true,
            follow: true,
        });

        let stdout = '';
        let stderr = '';

        return new Promise((resolve, reject) => {
            logs.on('data', (chunk) => {
                // Remove Docker log stream metadata (8-byte header)
                const cleanOutput = cleanDockerLogStream(chunk);
                stdout += cleanOutput.stdout;
                stderr += cleanOutput.stderr;
            });

            logs.on('error', reject);

            logs.on('end', () => {
                resolve({ stdout: stdout, stderr: stderr });
            });
        });
    } catch (error) {
        throw new Error(`Error executing container: ${error.message}`);
    }
}

/**
 * Cleans Docker log stream output by removing the 8-byte header.
 * Docker log streams use a binary frame format where each frame starts with:
 * - 1 byte: Stream type (0=stdin, 1=stdout, 2=stderr)
 * - 3 bytes: Reserved (null bytes)
 * - 4 bytes: Payload length
 */
function cleanDockerLogStream(chunk) {
    let stdout = '';
    let stderr = '';

    let i = 0;
    while (i < chunk.length) {
        const streamType = chunk[i]; // First byte determines stream type
        const payloadLength = chunk.readUInt32BE(i + 4); // Read payload length (4 bytes)

        const payload = chunk.slice(i + 8, i + 8 + payloadLength); // Extract payload

        if (streamType === 1) {
            stdout += payload.toString(); // Append to stdout
        } else if (streamType === 2) {
            stderr += payload.toString(); // Append to stderr
        }

        i += 8 + payloadLength; // Move to the next frame
    }

    return { stdout, stderr };
}

/**
 * Determines the command to execute based on language.
 */
function determineCommand(language, sourceFile) {
    switch (language) {
        case 'c':
            return ['sh', '-c', `gcc /code/${path.basename(sourceFile)} -o /code/a.out && /code/a.out`];
        case 'cpp':
            return ['sh', '-c', `g++ /code/${path.basename(sourceFile)} -o /code/a.out && /code/a.out`];
        case 'java':
            return ['sh', '-c', `javac /code/${path.basename(sourceFile)} && java -cp /code Main`];
        case 'python':
            return ['python3', `/code/${path.basename(sourceFile)}`];
        case 'javascript':
            return ['node', `/code/${path.basename(sourceFile)}`];
        default:
            throw new Error('Unsupported language');
    }
}