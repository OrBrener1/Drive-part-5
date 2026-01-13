    #ifndef SEARCH_FILE_COMMAND_H
    #define SEARCH_FILE_COMMAND_H

    #include "ICommand.h"
    #include "IFileManager.h"
    #include "ICompression.h"
    #include "IOutputDevice.h"
    #include <string>
    #include <vector>

    // Command that searches stored files for a given text query
    class SearchFileCommand : public ICommand {
    public:
        // Injects file manager, compression and output services
        SearchFileCommand(IFileManager* fileManager, ICompression* compressor);
        void execute(
            const std::vector<std::string>& args,
            IOutputDevice* m_output,
            SocketInputReader* reader
        ) override;

    private: 
        IFileManager* m_fileManager; // pointer, ownership managed elsewhere!
        ICompression* m_compressor;
    };

    #endif // SEARCH_FILE_COMMAND_H
