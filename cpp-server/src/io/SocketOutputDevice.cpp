#include "SocketOutputDevice.h"

// Constructor: binds this output device to an underlying IConnection.
SocketOutputDevice::SocketOutputDevice(IConnection* connection)
    : m_conn(connection) {}

// Sends a regular message to the client.
// High-level layers call write(), and we forward the raw text to the connection.
// SocketConnection::writeData() handles partial sends internally.
void SocketOutputDevice::write(const std::string& message) const {
    m_conn->writeData(message);
}

void SocketOutputDevice::writeRaw(const std::vector<uint8_t>& data) const {
    m_conn->writeData(
        std::string(reinterpret_cast<const char*>(data.data()), data.size()),
        data.size()
    );
}

// Sends an error message to the client (same logic as write).
void SocketOutputDevice::printError(const std::string& errorMessage) const {
    m_conn->writeData(errorMessage);
}
// SocketOutputDevice isolates high-level text output from the low-level transport.
// Even if it currently forwards messages as-is, it allows future formatting, testing, and protocol changes.
