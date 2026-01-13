#include "PostFileCommand.h"
#include "SocketInputReader.h"
#include <iostream>
#include <sstream>
#include <string>
#include <algorithm>
#include <vector>
#include <cstdint>
#include <exception>

using namespace std;

// Convert string to bytes
vector<uint8_t> PostFileCommand::string_to_bytes(const string& str) {
    return vector<uint8_t>(
        reinterpret_cast<const uint8_t*>(str.data()),
        reinterpret_cast<const uint8_t*>(str.data()) + str.size()
    );
}

PostFileCommand::PostFileCommand(IFileManager* fileManager,
                                 ICompression* compressor)
    : m_fileManager(fileManager),
      m_compressor(compressor) {}


void PostFileCommand::execute(
    const vector<string>& args,
    IOutputDevice* m_output,
    SocketInputReader* reader
) {

    // 1. Structural validation (400)
    // Must have at least filename
    if (args.empty() || args[0].empty()) {
        m_output->write("400 Bad Request\n");
        return;
    }

    const string& fileName = args[0];
    if (fileName.find(' ') != string::npos) {
    m_output->write("400 Bad Request\n");
    return;
    }

    try {
        // 2. Logical validation – file must NOT exist (404 in this exercise)
        vector<string> existingFiles = m_fileManager->FileNames();
        if (find(existingFiles.begin(), existingFiles.end(), fileName) != existingFiles.end()) {
            // File exists → "overwrite not allowed"
            m_output->write("404 Not Found\n");
            return;
        }

        // 3. Build content string from args[1], args[2]
       string content;
        // Try to find Length header
        auto it = find_if(args.begin(), args.end(), [](const string& s) {
            return s.rfind("Length:", 0) == 0;
        });

        if (it != args.end()) {
            // Length header found
            if (!reader) {
                m_output->write("500 Internal Server Error\n");
                return;
            }
            // Length-based body (binary-safe, multiline-safe)
            size_t length = stoul(it->substr(7));
            content = reader->readExactBytes(length);
        } else {
            // Fallback: old behavior (single-line content)
            if (args.size() == 1) {
                content = "";
            } else if (args.size() == 2) {
                content = args[1];
            } else {
                if (args[1].empty()) {
                    content = args[2];
                } else {
                    content = args[1] + " " + args[2];
                }
            }
        }

        vector<uint8_t> contentBytes = string_to_bytes(content);

        // 4. Compress
        vector<uint8_t> compressedBytes = m_compressor->compress(contentBytes);

        // If compression fails (non-empty input but empty compressed output) → 500
        if (!contentBytes.empty() && compressedBytes.empty()) {
            m_output->write("500 Internal Server Error\n");
            return;
        }

        // 5. Upload to storage
        bool success = m_fileManager->uploadFile(fileName, compressedBytes);

        if (!success) {
            // System/storage failure
            m_output->write("500 Internal Server Error\n");
            return;
        }

        // SUCCESS RESPONSE
        m_output->write("201 Created\n");

    } catch (const exception&) {
        // Any unexpected system-level error
        m_output->write("500 Internal Server Error\n");
    }
}
