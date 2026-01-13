#include "ICompression.h"
#include <arpa/inet.h> 

// RLE-based compression implementation for binary data
class RLEBinaryCompression : public ICompression {
public:
    std::vector<uint8_t> compress(const std::vector<uint8_t>& data) override;
    std::vector<uint8_t> decompress(const std::vector<uint8_t>& compressed_data) override;
private:
    void save_block(std::vector<uint8_t>& compressed, uint32_t count, uint8_t value);
};  