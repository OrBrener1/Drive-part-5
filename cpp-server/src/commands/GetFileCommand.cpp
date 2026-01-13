#include "GetFileCommand.h"
#include "IOutputDevice.h"
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <stdexcept>
#include <algorithm>

using namespace std;

// Constructor stores pointers to FileManager and Compressor
GetFileCommand::GetFileCommand(IFileManager* fileManager, ICompression* compressor)
    : m_fileManager(fileManager), m_compressor(compressor) {}

// Execute: print the decompressed content of the given file
void GetFileCommand::execute(
    const vector<string>& args,
    IOutputDevice* m_output,
    SocketInputReader* /*reader*/
) {
    // 1. Structural validation (400)
    if (args.empty() || args[0].empty() || !args[1].empty()) {
        m_output->write("400 Bad Request\n");
        return;
    }

    const string& fileName = args[0];

    try {
        // 2. Logical validation (404)
        vector<string> names = m_fileManager->FileNames();
        if (find(names.begin(), names.end(), fileName) == names.end()) {
            m_output->write("404 Not Found\n");
            return;
        }

        // 3. Fetch + decompress
        vector<uint8_t> compressedData = m_fileManager->fetch(fileName);
        vector<uint8_t> decompressedData = m_compressor->decompress(compressedData);

        m_output->write("200 Ok\n\n");
        m_output->writeRaw(decompressedData);
        m_output->write("\n");

    } catch (const exception&) {
        // Any IO / compression failure that is not the user's fault
        m_output->write("500 Internal Server Error\n");
        return;
    }
}
