#ifndef I_CLIENT_HANDLER_H
#define I_CLIENT_HANDLER_H

/**
 * Interface for handling a single client connection.
 * 
 * Implementations should:
 *  - Read commands from the client
 *  - Parse them
 *  - Dispatch to ICommand objects
 *  - Send responses back to the client
 *
 * This interface decouples the TCPServer from the concrete handler logic
 * and allows future extension (e.g., Mock handlers for testing,
 * HTTP-based handlers, etc.).
 */
class IClientHandler {
public:
    virtual ~IClientHandler() = default;

    /**
     * Handle a single connected client.
     * Implementations receive the accepted client socket
     * and manage the full lifetime of the connection.
     *
     * @param clientSocket The file descriptor of the accepted client.
     */
    virtual void handle(int clientSocket) = 0;
};

#endif // I_CLIENT_HANDLER_H
