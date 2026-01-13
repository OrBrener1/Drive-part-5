#ifndef SOCKET_CLIENT_HANDLER_H
#define SOCKET_CLIENT_HANDLER_H

#include "IClientHandler.h"
#include "IInputParser.h"
#include "ICommand.h"

#include <map>
#include <string>
#include <vector>

/**
 * SocketClientHandler - Handles a single client session over a socket.
 * Responsibilities:
 *  - Wrap the client socket in a SocketConnection
 *  - Create a SocketInputReader for reading text lines
 *  - Create a SocketOutputDevice for sending responses
 *  - Read and parse commands using IInputParser
 *  - Dispatch parsed commands to ICommand implementations
 *
 * Parser and command table are injected once in the constructor.
 * Connection / reader / writer are created per-session inside handle().
 */
class SocketClientHandler : public IClientHandler {
public:
    SocketClientHandler(
        IInputParser& parser,
        std::map<std::string, ICommand*>& commands);

    void handle(int clientSocket) override;

private:
    IInputParser& m_parser;                        // Command parser
    std::map<std::string, ICommand*>& m_commands; // Command lookup table
};

#endif // SOCKET_CLIENT_HANDLER_H