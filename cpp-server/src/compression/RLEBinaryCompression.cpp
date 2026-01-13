#include "RLEBinaryCompression.h"
#include <vector>
#include <cstdint> 
#include <stdexcept>
#include <arpa/inet.h>   // for htonl/ntohl, to handle endianness

using namespace std;

// Appends one RLE block: [4-byte count in big-endian][1-byte value]
void RLEBinaryCompression::save_block(vector<uint8_t>& compressed, uint32_t count, uint8_t value) {
    // Convert count to network byte order (big endian) to ensure cross-platform compatibility
    uint32_t net_count = htonl(count); 
    // Interpret the integer as a 4-byte array for insertion
    uint8_t* ptr = reinterpret_cast<uint8_t*>(&net_count);
    compressed.insert(compressed.end(), ptr, ptr + 4); // Append 4 bytes of count
    compressed.push_back(value); // Append the value byte
}

// Compresses raw bytes using RLE encoding
vector<uint8_t> RLEBinaryCompression::compress(const vector<uint8_t>& data) {
    vector<uint8_t> compressed;
    if (data.empty()) return compressed;  // Return empty if input is empty

    uint8_t current = data[0];
    uint32_t count = 1;

    for (size_t i = 1; i < data.size(); ++i)
    {
        if (data[i] == current && count < UINT32_MAX) {
            ++count; // Continue counting the run
        } else {
            save_block(compressed, count, current); // Save finished run
            current = data[i];  // Start new run
            count = 1;
        }
    }
    save_block(compressed, count, current); // Save last run
    return compressed;
}

// Decompresses RLE-encoded bytes back to original data
vector<uint8_t> RLEBinaryCompression::decompress(const vector<uint8_t>& compressed_data) {
    vector<uint8_t> data;
    size_t len = compressed_data.size();

    // Validate block structure (5 bytes per block)
    if (len % 5 != 0)
        return {};

    for (size_t i = 0; i < len; i += 5) {
        uint32_t net_count = 0;
        for (int j = 0; j < 4; ++j) {
            net_count = (net_count << 8) | compressed_data[i + j];
        }
        uint32_t count = net_count;

        if (count == 0)
            return {};

        uint8_t value = compressed_data[i + 4];

        if (data.size() + count > data.max_size())
           return {};

        data.insert(data.end(), count, value);
    }

    return data;
}
