#include "TcpServer.h"
#include "ICompression.h"
#include "RLEBinaryCompression.h"
#include "IFileManager.h"
#include "LocalFileManager.h"
#include "IInputParser.h"
#include "StandardInputParser.h"
#include "ICommand.h"
#include "IMenu.h"
#include "StandardMenu.h"
#include <cstdlib>
#include <string>
#include <map>

using namespace std;

int main(int argc, char* argv[]) {

    // Expect server port as argument: ./server <PORT>
    if (argc != 2) {
        return 1;   // Silent exit, as required
    }

    int port = stoi(argv[1]);

    // Compression component
    ICompression* compressor = new RLEBinaryCompression();

    // Storage directory (default or from environment)
    const char* envPath = getenv("STORAGE_DIR");
    string storageDir = envPath ? envPath : "/storage_file/";

    // File manager
    IFileManager* fileManager = new LocalFileManager(storageDir, compressor);

    // Build command table
    IMenu* menu = new StandardMenu(fileManager, compressor);
    map<string, ICommand*> commands = menu->createMenu();

    // Input parser
    // Parser is stateless and lightweight, so stack allocation is ideal and avoids manual memory management.
    StandardInputParser parser;

    // TCP Server — parser + command map are shared across sessions
    TCPServer server(port, parser, commands);

    // Start the server
    server.start();

    // Cleanup
    delete menu;
    delete fileManager;
    delete compressor;

    return 0;
}
