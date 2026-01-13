#include "SearchFileCommand.h"
#include <string>
#include <vector>
#include <stdexcept>

using namespace std;

// Stores dependencies for searching in stored files
SearchFileCommand::SearchFileCommand(IFileManager* fileManager, ICompression* compressor)
    : m_fileManager(fileManager), m_compressor(compressor) {}

void SearchFileCommand::execute(
    const vector<string>& args,
    IOutputDevice* m_output,
    SocketInputReader* /*reader*/
) {
    // -----------------------------
    // 1. Structural validation (400)
    // -----------------------------
    // Parser always gives {arg0, arg1}, but we only care that
    // the FINAL query string is non-empty.
    string query;

    if (!args.empty()) {
        if (!args[0].empty()) {
            query = args[0];
        }
        if (args.size() >= 2 && !args[1].empty()) {
            // preserve real space between parts
            if (!query.empty()) {
                query += " ";
            }
            query += args[1];
        }
    }

    // No query at all → illegal search command
    if (query.empty()) {
        m_output->write("400 Bad Request\n");
        return;
    }

    // -----------------------------
    // 2. Get file list (may fail)
    // -----------------------------
    vector<string> files;
    try {
        files = m_fileManager->FileNames();
    } catch (const exception&) {
        // Storage problem – not user's fault
        m_output->write("500 Internal Server Error\n");
        return;
    }

    // -----------------------------
    // 3. Status line: 200 Ok for any *valid* SEARCH query
    // -----------------------------
    m_output->write("200 Ok\n\n");  // exactly: 200 Ok + two newlines

    bool firstPrinted = false;

    // -----------------------------
    // 4. Search both name and content
    // -----------------------------
    for (const string& fileName : files) {
        try {
            vector<uint8_t> compressed = m_fileManager->fetch(fileName);
            vector<uint8_t> decompressed = m_compressor->decompress(compressed);
            string text(decompressed.begin(), decompressed.end());

            // Match either in file name or in file content
            if (fileName.find(query) != string::npos ||
                text.find(query) != string::npos) {

                if (firstPrinted) {
                    // separate file names with a single space
                    m_output->write(" ");
                }
                m_output->write(fileName);
                firstPrinted = true;
            }
        } catch (...) {
            // Any unexpected system/storage/compression failure
            // after a valid request → internal server error
            m_output->write("500 Internal Server Error\n");
            return;
        }
    }
      m_output->write("\n");
}
