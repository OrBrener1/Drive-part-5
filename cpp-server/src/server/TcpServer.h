#ifndef TCP_SERVER_H
#define TCP_SERVER_H

#include "IClientHandler.h"
#include "IInputParser.h"
#include "ICommand.h"
#include "ThreadPool.h"
#include <map>
#include <atomic>
#include <netinet/in.h>
#include <sys/socket.h>

/**
 * TCPServer:
 *  - Creates and binds a listening TCP socket.
 *  - Accepts incoming client connections.
*  - For each accepted client, creates a new SocketClientHandler instance
 *    using the shared parser and command table, and runs it in a dedicated thread.
 *
 * Notes:
 *  - Thread-per-client model: each client runs on its own detached thread.
 *  - stop() closes the listening socket, causing start() to exit cleanly.
 */

class TCPServer {
public:

    TCPServer(int port, IInputParser& parser, std::map<std::string, ICommand*>& commands);
    ~TCPServer();

    void start();  // Blocking main loop
    void stop();   // Stops the server

private:
    void acceptLoop();  // internal loop
    
    int m_port;                  
    int m_server_socket;  
    ThreadPool m_threadPool;
    std::atomic<bool> m_running;  
    // References to shared parser and command table, injected at construction of each handler
    IInputParser& m_parser;
    std::map<std::string, ICommand*>& m_commands;      
};

#endif // TCP_SERVER_H
