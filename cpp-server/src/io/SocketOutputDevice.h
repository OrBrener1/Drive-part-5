#ifndef SOCKET_OUTPUT_DEVICE_H
#define SOCKET_OUTPUT_DEVICE_H

#include "IOutputDevice.h"
#include "IConnection.h"
#include <string>

/**
 * SocketOutputDevice
 *
 * Output device that sends text over an IConnection.
 * Responsible only for text framing; raw sending is handled by the connection.
 */
class SocketOutputDevice : public IOutputDevice {
public:
    explicit SocketOutputDevice(IConnection* connection);

    // Writes a regular message through the underlying connection.
    void write(const std::string& message) const override;

    void writeRaw(const std::vector<uint8_t>& data) const override;
    
    // Writes an error message through the underlying connection.
    void printError(const std::string& errorMessage) const override;

private:
    IConnection* m_conn;
};

#endif // SOCKET_OUTPUT_DEVICE_H
