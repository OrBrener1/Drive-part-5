#ifndef STANDARD_MENU_H
#define STANDARD_MENU_H

#include "IMenu.h"
#include "ICommand.h"
#include "IFileManager.h"
#include "ICompression.h"
#include "IOutputDevice.h"
#include <map>
#include <string>

// Default implementation of IMenu that wires command names to ICommand objects
class StandardMenu : public IMenu {
public:
    StandardMenu(IFileManager* fm, ICompression* comp);
    ~StandardMenu() override = default; 
    
    // Creates the map: command name -> ICommand*
    std::map<std::string, ICommand*> createMenu() const override;

    private:
    IFileManager* m_fileManager;
    ICompression* m_compressor;
};
#endif