#ifndef DELETE_FILE_COMMAND_H
#define DELETE_FILE_COMMAND_H

#include "ICommand.h"
#include "IFileManager.h"
#include "IOutputDevice.h"

#include <string>
#include <vector>

// Command that handles: DELETE [filename]
// On success, prints "204 No Content\n".
class DeleteFileCommand : public ICommand {
public:
    DeleteFileCommand(IFileManager* fileManager)
        : m_fileManager(fileManager) {}

    void execute(
        const std::vector<std::string>& args,
        IOutputDevice* m_output,
        SocketInputReader* reader
    ) override;

private:
    IFileManager*  m_fileManager;

    // Non-copyable
    DeleteFileCommand(const DeleteFileCommand&) = delete;
    DeleteFileCommand& operator=(const DeleteFileCommand&) = delete;
};

#endif // DELETE_FILE_COMMAND_H
