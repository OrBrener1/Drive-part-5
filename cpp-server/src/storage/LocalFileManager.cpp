#include "LocalFileManager.h"

#include <iostream>
#include <filesystem>
#include <fstream>

using namespace std;

LocalFileManager::LocalFileManager(const string& storageDir,
                                   ICompression* compressor)
    : m_storage_dir(storageDir),
      m_compressor(compressor) {}

// Returns all file names in the storage directory
vector<string> LocalFileManager::FileNames() const {

    // Thread-safe access
    std::lock_guard<std::mutex> lock(m_mutex);

    vector<string> fileNames;

    try {
        if (!filesystem::exists(m_storage_dir)) {
            return fileNames;
        }

        for (const auto& entry : filesystem::directory_iterator(m_storage_dir)) {
            if (entry.is_regular_file()) {
                fileNames.push_back(entry.path().filename().string());
            }
        }
    } catch (const exception& e) {
        return {};
    }

    return fileNames;
}

// Read raw bytes from file
vector<uint8_t> LocalFileManager::fetch(const string& fileName) const {

    // Thread-safe access
    std::lock_guard<std::mutex> lock(m_mutex);

    string fullPath = m_storage_dir + "/" + fileName;

    ifstream inputFile(fullPath, ios::binary | ios::ate);
    if (!inputFile.is_open()) {
        return {};
    }

    streampos size = inputFile.tellg();
    inputFile.seekg(0, ios::beg);

    vector<uint8_t> buffer(static_cast<size_t>(size));
    if (size > 0) {
        inputFile.read(reinterpret_cast<char*>(buffer.data()), size);
    }

    inputFile.close();
    return buffer;
}

// Write raw bytes to file
bool LocalFileManager::uploadFile(const string& fileName,
                                  const vector<uint8_t>& data) {

    // Thread-safe access
    std::lock_guard<std::mutex> lock(m_mutex);

    string fullPath = m_storage_dir + "/" + fileName;
    ofstream outputFile(fullPath, ios::binary | ios::trunc);

    if (!data.empty()) {
        outputFile.write(reinterpret_cast<const char*>(data.data()), data.size());
    }

    bool success = outputFile.good();
    outputFile.close();
    return success;
}

// Delete a file from the storage directory
bool LocalFileManager::deleteFile(const string& fileName) {
    std::lock_guard<std::mutex> lock(m_mutex);
    string fullPath = m_storage_dir + "/" + fileName;

    try {
        //filesystem::remove returns true if a file was removed, false if it did not exist
        return filesystem::remove(fullPath);
    } catch (const exception&) {
        // On any error, report failure
        return false;
    }
}
