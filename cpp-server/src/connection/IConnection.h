#ifndef I_CONNECTION_H
#define I_CONNECTION_H

#include <string>
#include <cstddef>

/**
 * IConnection- Low-level, generic communication interface for any underlying channel
 * (TCP, file, memory, mock, etc.).
 *
 * Provides data-based read/write operations without assuming text structure or protocol semantics.
 * Higher-level layers (input readers / output devices) handle interpretation such as line parsing.
 */
class IConnection {
public:
    virtual ~IConnection() = default;

    /**
     * Reads up to maxLen bytes of raw data into buffer.
     *
     * @param buffer   destination
     * @param maxLen   maximum bytes to read
     * @return number of bytes read (>0), 0 on clean disconnect, or negative value on error.
     * std::ptrdiff_t is a portable signed type ideal for returning byte counts, EOF (0), or errors.
     */
    virtual std::ptrdiff_t readData(char* buffer, size_t maxLen) = 0;

    /**
     * Writes all bytes in the given string, handling partial writes internally.
     */
    virtual void writeData(const std::string& data) = 0;

    /**
     * Writes exactly "length" bytes from the given string buffer.
     */
    virtual void writeData(const std::string& data, size_t length) = 0;
};

#endif // I_CONNECTION_H
