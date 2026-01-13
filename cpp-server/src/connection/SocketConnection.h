#ifndef SOCKET_CONNECTION_H
#define SOCKET_CONNECTION_H

#include "IConnection.h"
#include <string>

/**
 * SocketConnection - Low-level TCP implementation of IConnection.
 * Responsibilities:
 *  - Manage the lifetime of a TCP socket (open/use/close)
 *  - Perform raw data reading via recv()
 *  - Perform raw data writing via send()
 * Notes:
 *  - Does NOT parse lines or commands.
 *  - Does NOT handle newline or text framing.
 *  - Higher layers (SocketInputReader / SocketOutputDevice) interpret data using readData/writeData.
 */
class SocketConnection : public IConnection {
public:
    // 'explicit' prevents unintended implicit conversions from int to SocketConnection.
    explicit SocketConnection(int socketId);
    ~SocketConnection() override;

    /**
     * Reads up to maxLen bytes from the underlying TCP socket
     * into the provided buffer.
     *
     * @return number of bytes read (>0),
     *         0 on clean disconnect,
     *         or negative value on error.
     * std::ptrdiff_t is a portable signed type ideal for returning byte counts, EOF (0), or errors.
     */
    std::ptrdiff_t readData(char* buffer, size_t maxLen) override;

    /**
     * Writes all bytes in the given string to the TCP socket,
     * performing multiple send() calls if necessary.
     */
    void writeData(const std::string& data) override;

    void writeData(const std::string& data, size_t length) override;

    // Prevent copying
    SocketConnection(const SocketConnection&) = delete;
    SocketConnection& operator=(const SocketConnection&) = delete;

private:
    int m_socketId;   ///< Underlying TCP socket descriptor
};

#endif // SOCKET_CONNECTION_H
