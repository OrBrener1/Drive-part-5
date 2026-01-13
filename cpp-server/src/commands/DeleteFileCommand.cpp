#include "DeleteFileCommand.h"
#include <algorithm>
#include <exception>

using namespace std;

void DeleteFileCommand::execute(
    const vector<string>& args,
    IOutputDevice* m_output,
    SocketInputReader* /*reader*/
) {
    // -----------------------------
    // 1. Structural validation (400)
    // -----------------------------
    // Parser guarantees args.size() == 2, but:
    // - args[0] must contain a non-empty filename
    // - args[1] must be empty (DELETE takes only one argument)
    if (args.empty() || args[0].empty() || !args[1].empty()) {
        // Syntactically invalid request
        m_output->write("400 Bad Request\n");
        return;
    }

    const string& fileName = args[0];

    try {
        // -----------------------------
        // 2. Logical validation (404)
        // -----------------------------
        // Check if the file actually exists in storage
        vector<string> names = m_fileManager->FileNames();
        auto it = find(names.begin(), names.end(), fileName);
        if (it == names.end()) {
            // Command is structurally valid, but the resource does not exist
            m_output->write("404 Not Found\n");
            return;
        }

        // -----------------------------
        // 3. Actual delete (204 / 500)
        // -----------------------------
        bool deleted = m_fileManager->deleteFile(fileName);
        if (!deleted) {
            // File was expected to exist, but the delete operation failed.
            m_output->write("500 Internal Server Error\n");
            return;
        }

        // Successful delete
        m_output->write("204 No Content\n");
    } catch (const exception&) {
        // Any unexpected storage error → 500
        m_output->write("500 Internal Server Error\n");
        return;
    }
}
