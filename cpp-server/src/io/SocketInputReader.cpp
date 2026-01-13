#include "SocketInputReader.h"
#include <cstring>  

using namespace std;

SocketInputReader::SocketInputReader(IConnection* conn)
    : m_conn(conn) {}


// Reads the next full command line (terminated by '\n').
// Returns empty string on disconnect or error.
string SocketInputReader::readNextCommand() {

    char tempBuf[1024];

    while (true) {
        // Check if we already have a full line in our buffer
        size_t pos = m_buffer.find('\n');
        if (pos != string::npos) {
            // Extract line WITHOUT \n
            string line = m_buffer.substr(0, pos);
            // Remove processed part (including newline)
            m_buffer.erase(0, pos + 1);
            return line;
        }

        // Need more data - read from underlying connection
        ptrdiff_t bytesRead = m_conn->readData(tempBuf, sizeof(tempBuf));

        if (bytesRead <= 0) {
            // 0 = disconnect, negative = error
            return "";
        }

        // Append newly received bytes to our buffer
        m_buffer.append(tempBuf, bytesRead);
    }
}

string SocketInputReader::readExactBytes(size_t length) {
    string result;
    result.reserve(length);

    while (result.size() < length) {
        if (!m_buffer.empty()) {
            size_t take = min(length - result.size(), m_buffer.size());
            result.append(m_buffer.substr(0, take));
            m_buffer.erase(0, take);
            continue;
        }

        char tempBuf[1024];
        ptrdiff_t bytesRead = m_conn->readData(tempBuf, sizeof(tempBuf));

        if (bytesRead <= 0) {
            break;
        }

        m_buffer.append(tempBuf, bytesRead);
    }

    return result;
}
