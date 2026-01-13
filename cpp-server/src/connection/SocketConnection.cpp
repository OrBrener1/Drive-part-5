#include "SocketConnection.h"
#include <unistd.h>     // close()
#include <sys/socket.h> // recv(), send()

//Stores the socket ID of this client.
// 'explicit' avoids accidental implicit construction from an int value.
SocketConnection::SocketConnection(int socketId)
    : m_socketId(socketId) {}

//ensures the socket is closed exactly once.
//This guarantees that every client connection is properly terminated
SocketConnection::~SocketConnection() {
    if (m_socketId >= 0) {
        close(m_socketId);
        m_socketId = -1;
    }
}

// Reads raw data directly into buffer.
// Returning ssize_t directly is safe: both ssize_t and std::ptrdiff_t are
// signed integer types used for byte counts, so the implicit conversion is correct.
// Return value: positive = bytes read, 0 = client disconnected, negative = error.
std::ptrdiff_t SocketConnection::readData(char* buffer, size_t maxLen) {
    ssize_t bytesRead = recv(m_socketId, buffer, maxLen, 0);
    return bytesRead;
}

// Writes the entire data string using repeated send() calls.
void SocketConnection::writeData(const std::string& data) {
    writeData(data, data.size());
}

void SocketConnection::writeData(const std::string& data, size_t length) {
    size_t totalSent = 0;
    const char* raw_data = data.data();

    while (totalSent < length) {
        ssize_t sent = send(
            m_socketId,
            raw_data + totalSent,
            length - totalSent,
            0
        );
        if (sent <= 0) {
            return;
        }

        totalSent += sent;
    }
}

