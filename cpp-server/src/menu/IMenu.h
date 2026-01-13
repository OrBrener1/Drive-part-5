#ifndef I_MENU_H
#define I_MENU_H

#include <map>
#include <string>
#include "ICommand.h" 

// Builds the mapping from command names to ICommand instances
class IMenu {
public:
    virtual ~IMenu() = default;

    virtual std::map<std::string, ICommand*> createMenu() const = 0;
};

#endif // I_MENU_H