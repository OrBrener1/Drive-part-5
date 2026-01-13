#include "StandardMenu.h"
#include "IOutputDevice.h"
#include "PostFileCommand.h"
#include "GetFileCommand.h"
#include "SearchFileCommand.h"
#include "DeleteFileCommand.h"
#include <string>
#include <map>

using namespace std;

// Stores shared dependencies used to build commands
StandardMenu::StandardMenu(IFileManager* fm, ICompression* comp)
    : m_fileManager(fm), m_compressor(comp) {}

// Builds the command map: command name -> ICommand instance
map<string, ICommand*> StandardMenu::createMenu() const {
    map<string, ICommand*> commandMap;

    commandMap["post"] = new PostFileCommand(m_fileManager, m_compressor);
    commandMap["get"] = new GetFileCommand(m_fileManager, m_compressor);
    commandMap["search"] = new SearchFileCommand(m_fileManager, m_compressor);
    commandMap["delete"] = new DeleteFileCommand(m_fileManager);

    return commandMap;
}
