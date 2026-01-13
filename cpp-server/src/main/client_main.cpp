#include "client.h"
#include "StandardInputReader.h"
#include "ConsoleOutput.h"

using namespace std;
/**
 *Entry point for the C++ client
 * format for running: ./client <SERVER_IP> <PORT>
 */
int main(int argc, char* argv[]) {
    if (argc != 3) {
        // Incorrect number of arguments
        return 1;
    }

    // Read server address from command-line arguments
    string ip = argv[1];
    int port = stoi(argv[2]);

     // Create input/output devices (polymorphic use)
    IInputReader* reader = new StandardInputReader();   // console input
    IOutputDevice* output = new ConsoleOutput(); // console output
    
    // Create the client using the IO interfaces
    Client client(reader, output);

    // Connect once to the server (single TCP connection)
    // Even if connection fails, client MUST NOT exit or print errors
    client.connectToServer(ip, port);

    // Start the main loop: read → send → receive → print
    client.run();
    
    // Cleanup
    delete reader;
    delete output;
    
    return 0;
}
