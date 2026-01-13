#ifndef I_FILE_MANAGER_H
#define I_FILE_MANAGER_H

#include <string>
#include <vector>
#include <cstdint>


// Interface for file storage and retrieval
class IFileManager {
public:
    virtual ~IFileManager() = default;

    
    // Returns names of all stored files
    virtual std::vector<std::string> FileNames() const = 0;

    // Fetches raw (typically compressed) file content
    virtual std::vector<uint8_t> fetch(const std::string& fileName) const = 0;
    
    // Uploads compressed data for the given file
    virtual bool uploadFile(const std::string& fileName,
                            const std::vector<uint8_t>& Compressed_data) = 0;
        
    // Delete a file by name. Returns true if the file existed and was removed.
    virtual bool deleteFile(const std::string& fileName) = 0;
};

#endif // I_FILE_MANAGER_H