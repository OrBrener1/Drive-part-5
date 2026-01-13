#include "TcpServer.h"
#include "SocketClientHandler.h"   // We create a new handler per connection
#include <unistd.h>      // For close()
#include <sys/socket.h>  // For socket(), bind(), listen(), accept()
#include <netinet/in.h>  // For sockaddr_in structure
#include <cstring>       // For memset
#include <thread>        // For std::thread

using namespace std;

TCPServer::TCPServer(int port, IInputParser& parser, std::map<std::string, ICommand*>& commands)
    : m_port(port), m_server_socket(-1),m_threadPool(4), m_running(false), m_parser(parser), m_commands(commands) {
}

TCPServer::~TCPServer() {
    stop();
}

void TCPServer::start() {
    // Create socket
    // AF_INET = IPv4, SOCK_STREAM = TCP
    m_server_socket = socket(AF_INET, SOCK_STREAM, 0);
    //if fail close and leave
    if (m_server_socket < 0) {
        return;
    }

    // Reuse Address
    // This option allows restarting the server immediately after a stop
    // without waiting for the OS to release the port.
    int opt = 1;
    if (setsockopt(m_server_socket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        close(m_server_socket);
        return;
    }

    // 3. Bind socket to port
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr)); // Zero out the structure
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;     // Listen on all network interfaces
    server_addr.sin_port = htons(m_port);         // Convert host byte order to network byte order

    if (bind(m_server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        close(m_server_socket);
        return;
    }

    // Listen for connections
    // is the backlog queue size (waiting connections)
    if (listen(m_server_socket, 5) < 0) {
        close(m_server_socket);
        return;
    }

    m_running = true;
    
    // Start accepting clients
    acceptLoop();
}

void TCPServer::acceptLoop() {
    //endless loop
    while (m_running) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);

        // Accept a new connection (Blocking call)
        int client_socket = accept(m_server_socket, (struct sockaddr*)&client_addr, &client_len);

        // If accept() fails, client_socket will be < 0
        if (client_socket < 0) {
            //accept() can fail for two different reasons:
            //The server was stopped manually (stop() closed the listening socket).
            //In this case m_running == false, and the failure is expected.
            //A transient OS/network error occurred while the server is still running.
            // In both cases we simply continue the loop and try again.
            // This prevents crashes or infinite loops and keeps the server stable.      
            continue;
        }
        // Handle the client connection in the thread pool
        m_threadPool.submit([this, client_socket]() {
    SocketClientHandler handler(m_parser, m_commands);
    handler.handle(client_socket);});
    }
}

void TCPServer::stop() {
    m_running = false;
    if (m_server_socket >= 0) {
        // Closing the socket forces 'accept' to return, breaking the loop
        close(m_server_socket);
        m_server_socket = -1;
        // ThreadPool is shut down automatically in its destructor
    }
}