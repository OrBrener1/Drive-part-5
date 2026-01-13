#ifndef I_COMMAND_H
#define I_COMMAND_H
 
#include <vector>
#include <string>
#include "IOutputDevice.h"

class SocketInputReader;

// Command interface: all commands implement execute(args)
class ICommand {
public:
    virtual void execute(
        const std::vector<std::string>& args,
        IOutputDevice* m_output,
        SocketInputReader* reader
    ) = 0;
    virtual ~ICommand() = default;
};

#endif // I_COMMAND_H
