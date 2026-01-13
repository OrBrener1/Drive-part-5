#ifndef I_COMPRESSION_H
#define I_COMPRESSION_H

#include <vector>
#include <cstdint>

// Compression interface: compresses and decompresses raw byte data
class ICompression {
public:
    virtual ~ICompression() = default;

    // Compress raw data into a compact representation
    virtual std::vector<uint8_t> compress(const std::vector<uint8_t>& data) = 0;

    // Decompress data back to its original form
    virtual std::vector<uint8_t> decompress(const std::vector<uint8_t>& compressed_data) = 0;
};

#endif // I_COMPRESSION_H