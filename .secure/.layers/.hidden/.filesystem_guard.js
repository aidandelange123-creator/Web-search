// File System Guard Security Layer
// Enhanced with bot protection integration

const fs = require('fs');
const path = require('path');
const { sanitizeInput } = require('./.core/.validator');

class FileSystemGuard {
    constructor() {
        this.allowedPaths = new Set();
        this.blockedExtensions = new Set(['.exe', '.bat', '.cmd', '.sh', '.ps1', '.dll', '.so', '.dylib']);
        
        // Add default allowed paths
        this.allowedPaths.add('/workspace');
        this.allowedPaths.add('/workspace/uploads');
        this.allowedPaths.add('/workspace/public');
        
        console.log('[FILE-GUARD] File system guard initialized');
    }

    // Validate file path to prevent directory traversal
    validatePath(filePath) {
        if (!filePath || typeof filePath !== 'string') {
            console.log('[FILE-GUARD] Invalid file path provided');
            return false;
        }

        // Sanitize the path
        const sanitizedPath = sanitizeInput(filePath);
        if (sanitizedPath !== filePath) {
            console.log('[FILE-GUARD] Suspicious path detected after sanitization');
            return false;
        }

        // Check for directory traversal attempts
        if (filePath.includes('../') || filePath.includes('..\\') || filePath.includes('%2e%2e%2f') || filePath.includes('%2e%2e%5c')) {
            console.log('[FILE-GUARD] Directory traversal attempt detected');
            return false;
        }

        // Resolve the path to absolute path
        const absolutePath = path.resolve(filePath);
        
        // Check if the path is within allowed directories
        for (const allowedPath of this.allowedPaths) {
            if (absolutePath.startsWith(path.resolve(allowedPath))) {
                return true;
            }
        }

        console.log('[FILE-GUARD] Path is outside allowed directories');
        return false;
    }

    // Securely read file with validation
    async secureReadFile(filePath) {
        if (!this.validatePath(filePath)) {
            throw new Error('Invalid file path');
        }

        // Check file extension
        const ext = path.extname(filePath).toLowerCase();
        if (this.blockedExtensions.has(ext)) {
            console.log(`[FILE-GUARD] Blocked attempt to read file with dangerous extension: ${ext}`);
            throw new Error('Blocked file extension');
        }

        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            return content;
        } catch (error) {
            console.log(`[FILE-GUARD] Error reading file: ${error.message}`);
            throw error;
        }
    }

    // Securely write file with validation
    async secureWriteFile(filePath, data) {
        if (!this.validatePath(filePath)) {
            throw new Error('Invalid file path');
        }

        // Check file extension
        const ext = path.extname(filePath).toLowerCase();
        if (this.blockedExtensions.has(ext)) {
            console.log(`[FILE-GUARD] Blocked attempt to write file with dangerous extension: ${ext}`);
            throw new Error('Blocked file extension');
        }

        // Ensure the directory exists
        const dir = path.dirname(filePath);
        await fs.promises.mkdir(dir, { recursive: true });

        try {
            await fs.promises.writeFile(filePath, data, 'utf8');
            return true;
        } catch (error) {
            console.log(`[FILE-GUARD] Error writing file: ${error.message}`);
            throw error;
        }
    }

    // Add allowed path
    addAllowedPath(allowedPath) {
        this.allowedPaths.add(allowedPath);
        console.log(`[FILE-GUARD] Added allowed path: ${allowedPath}`);
    }

    // Get allowed paths
    getAllowedPaths() {
        return Array.from(this.allowedPaths);
    }

    // Check if file extension is allowed
    isExtensionAllowed(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return !this.blockedExtensions.has(ext);
    }
}

module.exports = new FileSystemGuard();