#include "StandardInputParser.h"
#include <sstream>

using namespace std;

// helper: lowercase copy of a string
std::string StandardInputParser::toLowerCopy(const std::string& s) {
    string out = s;
    for (char& c : out) {
        c = static_cast<char>(tolower(static_cast<unsigned char>(c)));
    }
    return out;
}

pair<string, vector<string>> StandardInputParser::parseCommand(const string& input) {
    // Copy input to mutable string, we don't use stream to preserve spacing.
    string line = input;

    // Handle Windows CR (precaution)
    if (!line.empty() && line.back() == '\r') {
        line.pop_back();
    }

    // 1. find first space = end of command (command may start with spaces)
    size_t cmdEnd = line.find(' ');

    string command, rest;

    // no spaces , whole line is command
    if (cmdEnd == string::npos) {
        // no args , whole line is the command (even if it starts with space!)
        // in that case, command will be empty string! we won't find it in commands map, so it's invalid.
        command = toLowerCopy(line);
        return {command, {"", ""}};
    }

    // extract command EXACTLY as typed (it won't have leading spaces anyway- we took care of that above)
    command = line.substr(0, cmdEnd);
    command = toLowerCopy(command);

    // extract rest EXACTLY as typed
    rest = (cmdEnd + 1 < line.size() ? line.substr(cmdEnd + 1) : "");

    // if no args
    if (rest.empty()) {
        return {command, {"", ""}};
    }

    // CASE A: rest begins with space , all of rest is ONE argument (cause file name can't have spaces)
    if (rest[0] == ' ') {
        return {command, {rest, ""}};
    }

    // CASE B: split into arg0 + raw remainder
    size_t pos = rest.find(' ');
    if (pos == string::npos) {
        return {command, {rest, ""}};
    }

    string first = rest.substr(0, pos);
    string second = (pos + 1 < rest.size() ? rest.substr(pos + 1) : "");

    return {command, {first, second}};
}