    #ifndef GET_FILE_COMMAND_H
    #define GET_FILE_COMMAND_H

    #include "ICommand.h"
    #include "IOutputDevice.h"
    #include "IFileManager.h"
    #include "ICompression.h"
    #include <string>
    #include <vector>

    // Command that retrieves and prints a stored file
    class GetFileCommand : public ICommand {
    public:
    // Injects file manager, compressor and output device
        GetFileCommand(IFileManager* fileManager, ICompression* compressor);
        void execute(
            const std::vector<std::string>& args,
            IOutputDevice* m_output,
            SocketInputReader* reader
        ) override;

    private: 
        IFileManager* m_fileManager; // pointer, ownership managed elsewhere!
        ICompression* m_compressor;
    };

    #endif // GET_FILE_COMMAND_H
