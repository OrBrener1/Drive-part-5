#ifndef LOCAL_FILE_MANAGER_H
#define LOCAL_FILE_MANAGER_H

#include "IFileManager.h"
#include "ICompression.h"
#include <string>
#include <vector>
#include <fstream>
#include <mutex>       

// IFileManager implementation that uses the local filesystem
class LocalFileManager : public IFileManager {
public:
    // Uses a base storage directory and a compression strategy
    LocalFileManager(const std::string& storageDir, ICompression* compressor);

    // Returns all file names in the storage directory
    std::vector<std::string> FileNames() const override;

    // Read file as raw bytes
    std::vector<uint8_t> fetch(const std::string& fileName) const override;

    // Write raw bytes to a file
    bool uploadFile(const std::string& fileName,
                    const std::vector<uint8_t>& compressedData) override;

    // Delete file from the storage directory
    bool deleteFile(const std::string& fileName) override;

    ~LocalFileManager() override = default;

private:
    std::string m_storage_dir;
    ICompression* m_compressor;

    // Mutex for protecting access to the shared storage directory.
    // Marked as mutable so 'const' methods can still lock it safely.
    mutable std::mutex m_mutex;

    LocalFileManager(const LocalFileManager&) = delete;
    LocalFileManager& operator=(const LocalFileManager&) = delete;
};

#endif // LOCAL_FILE_MANAGER_H
