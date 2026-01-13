#include "ConsoleOutput.h"
#include <iostream>

using namespace std;


// Writes a message to standard output
void ConsoleOutput::write(const string& message) const {
    // Use std::cout for standard output
    cout << message;
}

void ConsoleOutput::writeRaw(const vector<uint8_t>& data) const {
    cout.write(reinterpret_cast<const char*>(data.data()), data.size());
}

//empty implementation
void ConsoleOutput::printError(const string& errorMessage) const {}
    
