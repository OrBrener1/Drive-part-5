cmake_minimum_required(VERSION 3.10)

project(CompressedStorage CXX C)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ----------------------------------------------------
# 1. Core sources (shared by server, client and tests)
# ----------------------------------------------------
set(CORE_SOURCES
    # menu
    src/menu/StandardMenu.cpp

    # io
    src/io/ConsoleOutput.cpp
    src/io/StandardInputReader.cpp
    src/io/SocketInputReader.cpp
    src/io/SocketOutputDevice.cpp

    # parser
    src/parser/StandardInputParser.cpp

    # compression
    src/compression/RLEBinaryCompression.cpp

    # storage
    src/storage/LocalFileManager.cpp

    # commands
    src/commands/PostFileCommand.cpp
    src/commands/GetFileCommand.cpp
    src/commands/SearchFileCommand.cpp
    src/commands/DeleteFileCommand.cpp

    # networking / server + ThreadPool
    src/connection/SocketConnection.cpp
    src/server/SocketClientHandler.cpp
    src/server/TcpServer.cpp
    src/server/ThreadPool.cpp
)

# ----------------------------------------------------
# 2. Include directories
# ----------------------------------------------------
set(PROJECT_INCLUDE_DIRS
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/src/server
    ${CMAKE_CURRENT_SOURCE_DIR}/src/storage
    ${CMAKE_CURRENT_SOURCE_DIR}/src/parser
    ${CMAKE_CURRENT_SOURCE_DIR}/src/commands
    ${CMAKE_CURRENT_SOURCE_DIR}/src/compression
    ${CMAKE_CURRENT_SOURCE_DIR}/src/menu
    ${CMAKE_CURRENT_SOURCE_DIR}/src/io
    ${CMAKE_CURRENT_SOURCE_DIR}/src/connection
)

# ----------------------------------------------------
# 2. Server executable
# ----------------------------------------------------
add_executable(drive-server
    src/main/server_main.cpp
    ${CORE_SOURCES}
)

target_include_directories(drive-server PRIVATE
    ${PROJECT_INCLUDE_DIRS}
)