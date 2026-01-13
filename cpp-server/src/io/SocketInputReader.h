#ifndef SOCKET_INPUT_READER_H
#define SOCKET_INPUT_READER_H

#include "IInputReader.h"
#include "IConnection.h"
#include <string>

/**
 * SocketInputReader - High-level reader that converts raw data from an IConnection
 * into complete newline-terminated command strings.
 *
 * Responsibilities:
 *  - Maintain an internal buffer
 *  - Accumulate raw bytes via connection.readData()
 *  - Detect '\n' and return full command lines (without newline)
 *
 * This class does NOT perform parsing of commands — only text framing.
 */
class SocketInputReader : public IInputReader {
public:
    explicit SocketInputReader(IConnection* conn);

    /**
     * Reads the next full command line (terminated by '\n').
     * Returns empty string on disconnect or error.
     */
    std::string readNextCommand() override;
    std::string readExactBytes(size_t length);

private:
    IConnection* m_conn;      // Underlying raw data connection
    std::string m_buffer;     // Accumulated partial data
};

#endif // SOCKET_INPUT_READER_H
