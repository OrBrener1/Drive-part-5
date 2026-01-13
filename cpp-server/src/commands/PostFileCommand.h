#ifndef POST_FILE_COMMAND_H
#define POST_FILE_COMMAND_H

#include "ICompression.h"
#include "ICommand.h"
#include "IFileManager.h"
#include "IOutputDevice.h"
#include <string>
#include <vector>
#include <cstdint>

// Command that handles: POST [filename] [content]
class PostFileCommand : public ICommand {
public:
    PostFileCommand(IFileManager* fileManager, ICompression* compressor);

    void execute(
        const std::vector<std::string>& args,
        IOutputDevice* m_output,
        SocketInputReader* reader
    ) override;

    std::vector<uint8_t> string_to_bytes(const std::string& str);

private:
    IFileManager*   m_fileManager;
    ICompression*   m_compressor;

    PostFileCommand(const PostFileCommand&) = delete;
    PostFileCommand& operator=(const PostFileCommand&) = delete;
};

#endif // POST_FILE_COMMAND_H
