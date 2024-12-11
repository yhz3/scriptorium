// pages/api/execute.js

import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SUPPORTED_LANGS } from '../../config';

/**
 * Handler for executing a code body.
 * The POST request body must contain language, code, and optionally stdin.
 * @param {object} req - The HTTP request object
 * @param {object} res - The HTTP response object
 * @returns {object} - The JSON response containing the output or error.
 */
export default async function handler(req, res) {
    // make sure method is post
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // validate required fields. note that stdin is optional
    const { language, code, stdin } = req.body;
    if (!language) {
        return res.status(400).json({ error: "Language must be provided." });
    }
    if (!code) {
        return res.status(400).json({ error: "Code must be provided." });
    }

    // make sure language is supported
    if (!SUPPORTED_LANGS.includes(language)) {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    // make sure code is provided and is a string
    if (typeof code !== 'string') {
        return res.status(400).json({ error: 'Code must be a string' });
    }

    // creates a unique filename
    const filename = uuidv4();

    // we use a temporary directory to store the source file and the executable
    const tempDir = path.join('/tmp', filename);
    fs.mkdirSync(tempDir);

    let sourceFile;

    // used temporarily for storing the executable file path
    let executable;

    // commands to compile and run the code from a terminal
    let compileCmd, runCmd;

    // arguments to be passed to the compile command
    let compileArgs = [];

    // arguments to be passed to the run command
    let runArgs = [];

    let compileOptions = { cwd: tempDir };
    let runOptions = { cwd: tempDir };

    // checks language and sets the appropriate commands for running and
    // potentially compiling the code
    try {
        switch (language) {
            case 'c':
                sourceFile = path.join(tempDir, `${filename}.c`);
                executable = path.join(tempDir, 'a.out');
                compileCmd = 'gcc';
                compileArgs = [sourceFile];
                runCmd = executable;
                runArgs = []; 
                break;
            case 'cpp':
                sourceFile = path.join(tempDir, `${filename}.cpp`);
                executable = path.join(tempDir, 'a.out');
                compileCmd = 'g++';
                compileArgs = [sourceFile];
                runCmd = executable;
                runArgs = [];
                break;
            case 'java':
                sourceFile = path.join(tempDir, 'Main.java');
                compileCmd = 'javac';
                compileArgs = [sourceFile];
                runCmd = 'java';
                runArgs = ['Main'];
                break;
            case 'python':
                sourceFile = path.join(tempDir, `${filename}.py`);
                runCmd = 'python3';
                runArgs = [sourceFile];
                break;
            case 'javascript':
                sourceFile = path.join(tempDir, `${filename}.js`);
                runCmd = 'node';
                runArgs = [sourceFile];
                break;
            default:
                throw new Error('Unsupported language');
        }

        // puts code into a file so that it can be compiled/interpreted from there
        fs.writeFileSync(sourceFile, code);

        // general function for running a command, potentially with stdin data
        // can be used both for compiling and running the code
        const executeCommand = (command, args, options, stdinData) => {
            return new Promise((resolve, reject) => {
                const child = spawn(command, args, options);
                let stdout = '';
                let stderr = '';

                if (stdinData) {
                    child.stdin.write(stdinData);
                }
                child.stdin.end();

                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
                child.stderr.on('data', (data) => {
                stderr += data.toString();
                });

                child.on('error', (error) => {
                    reject({ error, stderr });
                });

                child.on('close', (code, signal) => {
                    resolve({ stdout, stderr, code, signal});

                });
            });
        };

        // compile the code for c, c++ and java
        if (['c', 'cpp', 'java'].includes(language)) {
            const { stdout: compileStdout, stderr: compileStderr, code: compileExitCode } = await executeCommand(
                compileCmd,
                compileArgs,
                compileOptions
            );
            if (compileExitCode !== 0) {
                return res.status(200).json({
                    compile: {
                        stdout: compileStdout,
                        stderr: compileStderr,
                        exitCode: compileExitCode,
                    },
                    run: null,
                });
            }
        }

        // run the code
        const { stdout: runStdout, stderr: runStderr, code: runExitCode, signal: runSignal } = await executeCommand(
            runCmd,
            runArgs,
            runOptions,
            stdin
        );

        if (runSignal) {
            // process terminated by a signal
            return res.status(200).json({
                compile: null,
                run: {
                    stdout: runStdout,
                    stderr: runStderr,
                    exitCode: runExitCode,
                    signal: runSignal,
                },
            });
        } else {
            return res.status(200).json({
                compile: null,
                run: {
                    stdout: runStdout,
                    stderr: runStderr,
                    exitCode: runExitCode,
                    signal: null,
                },
            });
        }
    } catch (err) {
        console.error('Execution error:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        // Clean up
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}