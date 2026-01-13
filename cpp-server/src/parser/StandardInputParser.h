#ifndef STANDARD_INPUT_PARSER_H
#define STANDARD_INPUT_PARSER_H

#include "IInputParser.h"
#include <string>
#include <vector>
#include <string>
#include <utility>

// Parses a raw input line into command name and arguments
class StandardInputParser : public IInputParser {
public:
    StandardInputParser() = default;
    ~StandardInputParser() override = default;

    
    // For "add foo.txt some text" -> {"add", {"foo.txt", "some text"}}
    std::pair<std::string, std::vector<std::string>> parseCommand(const std::string& input) override;

private:
    static std::string toLowerCopy(const std::string& s);
};
#endif // STANDARD_INPUT_PARSER_H
