#ifndef I_INPUT_READER_H
#define I_INPUT_READER_H

#include <string>


// Abstraction over a command input source
class IInputReader {
public:
    virtual ~IInputReader() = default;

    // Reads the next full command line; returns empty string on end of input
    virtual std::string readNextCommand() = 0;
};

#endif // I_INPUT_READER_H