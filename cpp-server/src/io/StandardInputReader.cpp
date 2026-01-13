#include "StandardInputReader.h"
#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

string StandardInputReader::readNextCommand() {
    string commandLine;

    if (!getline(cin, commandLine)) {
        return "";
    }

    // Remove trailing '\r' if present (important for Docker / bash)
    if (!commandLine.empty() && commandLine.back() == '\r') {
        commandLine.pop_back();
    }

    // Ignore empty commands (don't send junk to server)
    if (commandLine.find_first_not_of(" \t") == string::npos) {
        return ""; 
    }

    return commandLine;
}
