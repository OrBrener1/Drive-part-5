#ifndef I_OUTPUT_DEVICE_H
#define I_OUTPUT_DEVICE_H

#include <string>
#include <vector>
#include <cstdint>

// Abstraction for sending normal and error messages to some output
class IOutputDevice {
public:
    virtual ~IOutputDevice() = default;

    // Writes a regular message
    virtual void write(const std::string& message) const = 0;

    // Writes raw binary data (file content)
    virtual void writeRaw(const std::vector<uint8_t>& data) const = 0;

    // Prints an error message
    virtual void printError(const std::string& errorMessage) const = 0;
};

#endif // I_OUTPUT_DEVICE_H
