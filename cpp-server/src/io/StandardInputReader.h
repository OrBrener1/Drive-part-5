#ifndef STANDARD_INPUT_READER_H
#define STANDARD_INPUT_READER_H

#include "IInputReader.h"

// Reads commands from standard input (std::cin)
class StandardInputReader : public IInputReader {
public:
    StandardInputReader() = default;

    // Returns the next full line as a command string
    std::string readNextCommand() override;
};

#endif // STANDARD_INPUT_READER_H