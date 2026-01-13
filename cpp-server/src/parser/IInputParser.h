#ifndef I_INPUT_PARSER_H
#define I_INPUT_PARSER_H

#include <string>
#include <vector>
#include <utility>


// Parses an input line into command name and arguments
class IInputParser {
public:
    virtual ~IInputParser() = default;
    virtual std::pair<std::string, std::vector<std::string>> parseCommand(const std::string& input) = 0;
};

#endif // I_INPUT_PARSER_H
