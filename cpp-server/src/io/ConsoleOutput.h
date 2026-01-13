#ifndef CONSOLE_OUTPUT_H
#define CONSOLE_OUTPUT_H

#include "IOutputDevice.h"
#include <string> 

// Output device that writes messages to the console
class ConsoleOutput : public IOutputDevice {
public:
    virtual ~ConsoleOutput() = default;
    
    // Prints a regular message (std::cout)
    void write(const std::string& message) const override;
    void writeRaw(const std::vector<uint8_t>& data) const override;
    // Prints an error message (std::cerr)
    void printError(const std::string& errorMessage) const override;
};

#endif // CONSOLE_OUTPUT_H
