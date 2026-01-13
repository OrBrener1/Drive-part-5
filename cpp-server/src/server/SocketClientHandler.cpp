#include "SocketClientHandler.h"

#include "SocketConnection.h"
#include "SocketInputReader.h"
#include "SocketOutputDevice.h"
#include "IInputParser.h"
#include "ICommand.h"

#include <string>
#include <vector>
#include <map>

using namespace std;

// Constructor: stores references to the parser and the command table.
// The handler does NOT own these objects - dependency injection.
SocketClientHandler::SocketClientHandler(
    IInputParser& parser,
    map<string, ICommand*>& commands)
    : m_parser(parser), m_commands(commands) {}

// Handles a single connected client.
// Builds socket-based reader/writer objects and processes commands
// until the client disconnects.
void SocketClientHandler::handle(int clientSocket) {
    
    // Wrap the raw socket into an IConnection implementation.
    SocketConnection connection(clientSocket);

    // Reader that reads '\n'-terminated lines from the socket
    SocketInputReader reader(&connection);

    // Output device that writes responses back to the client
    SocketOutputDevice output(&connection);

       // Clean leading non-ASCII chars before parsing
    auto cleanLeadingNonAscii = [](std::string& s) {
        size_t i = 0;

        // skip ANY non-ASCII chars at the start
        while (i < s.size()) {
            unsigned char c = s[i];
            if (c >= 32 && c <= 126) {
                // stop on first printable ASCII (including space!)
                break;
            }
            i++;
        }

        if (i > 0) {
            s.erase(0, i);
        }
    };

    while (true) {
        // Read one full command line from the client
        string line = reader.readNextCommand();

        // Client disconnected or no more data
        if (line.empty()) {
            break;
        }
        
        cleanLeadingNonAscii(line);

        // Parse command name + args
        auto parsed = m_parser.parseCommand(line);
        const string commandName = parsed.first;
        const vector<string> args = parsed.second;

        // Unknown command → 400
        auto it = m_commands.find(commandName);
        if (it == m_commands.end()) {
            output.write("400 Bad Request\n");
            continue;
        }

        ICommand* cmd = it->second;

        // Execute command; unexpected error → 500
        try {
            cmd->execute(args, &output, &reader);
        } catch (...) {
            output.write("500 Internal Server Error\n");
        }
    }
    // SocketConnection closes the socket in its destructor

    
}
