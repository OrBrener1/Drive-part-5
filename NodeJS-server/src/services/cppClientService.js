// TCP socket module (no HTTP)
const net = require('net');

// C++ server connection details
const CPP_HOST = process.env.SERVER_HOST || '127.0.0.1';
const CPP_PORT = process.env.SERVER_PORT
  ? Number(process.env.SERVER_PORT): 8080;

/**
 * Sends a single command to the C++ server over TCP
 * and waits until the full response is received.
 */
const sendCommand = (line) => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const chunks = [];
    let resolved = false;

    const cleanup = () => {
      try { client.removeAllListeners(); } catch {}
      try { client.destroy(); } catch {}
    };

    client.connect(CPP_PORT, CPP_HOST, () => {
      client.write(line + '\n');
      client.end();
    });

    client.on('data', (data) => {
      chunks.push(data);
    });

    client.on('end', () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(Buffer.concat(chunks));
    });

    client.on('error', (err) => {
      console.error('[cppClientService] TCP error:', err?.message || err);
      cleanup();
      reject(err);
    });
  });
};


/**
 * Creates a physical file in the C++ file server.
 * If content is provided, it's sent in the POST line.
 * Backward compatible: if content is empty, behaves like before.
 */
const createFile = async (fileId, content = '') => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const chunks = [];

    const buffer =
      Buffer.isBuffer(content)
        ? content
        : Buffer.from(String(content), 'utf8');

    client.connect(CPP_PORT, CPP_HOST, () => {
      if (buffer.length === 0) {
        // Backward compatible: empty file
        client.end(`POST ${fileId}\n`);
      } else {
        // Length-based POST (binary + multiline safe)
        client.write(`POST ${fileId} Length:${buffer.length}\n`);
        client.write(buffer);
        client.end();
      }
    });

    client.on('data', (data) => {
      chunks.push(data);
    });

    client.on('end', () => {
      const response = Buffer.concat(chunks).toString('utf8');
      resolve(response.startsWith('201'));
    });

    client.on('error', () => {
      reject(new Error('C++ server unreachable'));
    });
  });
};


/**
 * Deletes a physical file from the C++ file server.
 */
const deleteFile = async (fileId) => {
  try {
    const response = await sendCommand(`DELETE ${fileId}`);
    return response.toString('utf8').startsWith('204');
  } catch {
    throw new Error('C++ server unreachable');
  }
};

/**
 * SEARCH <query>
 * Returns the raw response from the C++ server.
 */
const searchFile = async (query) => {
  try {
    return await sendCommand(`SEARCH ${query}`);
  } catch {
    throw new Error('C++ server unreachable');
  }
};
// Retrieves the content of a physical file from the C++ file server.
const getFileContent = async (fileId) => {
  const raw = await sendCommand(`GET ${fileId}`);
  return raw;
};


module.exports = {
  createFile,
  deleteFile,
  searchFile,
  getFileContent,
};
