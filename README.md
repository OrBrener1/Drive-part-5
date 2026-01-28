# Drive Me Nuts - Web & Mobile Drive Application

Drive Me Nuts is a Google Drive-like storage system developed as part of the
Advanced Programming course.

The project extends the backend system developed in previous exercises and
adds full web and mobile clients.

The system supports user authentication, file and folder management,
permissions, search, and cross-platform usage.

## System Architecture

The system consists of three main components:

### C++ Storage Server
Responsible for physical file storage and persistence on disk.
The storage server is treated as a black box by higher layers.

### Node.js Backend Server
Exposes a RESTful JSON API and manages users, authentication, files,
permissions, and search logic.
All clients communicate exclusively with this backend server.

### Client Applications
- A React-based web application
- A React Native mobile application

Both clients provide access to the same backend functionality.


## Running the Project

The system is designed to be executed using **Docker and docker-compose**.
# change ! 
At a high level, running the project includes:
- Building all services using docker-compose
- Starting the backend and storage servers
- Running the web and mobile clients

## Documentation

Full documentation of the system, including:
- Environment setup
- Running the complete system
- Authentication flows
- File and folder operations
- Client behavior
- Design decisions

is available in the **GitHub Wiki** of this repository.

## A Note from the Team

Drive Me Nuts was developed as part of an academic assignment that involved
multiple components and non-trivial design choices.
Between backend logic, client integration, and design decisions, the project
lived up to its name - and still works.

<img width="700" alt="ChatGPT Image Jan 26, 2026, 06_11_25 PM" src="https://github.com/user-attachments/assets/59bb0c91-33bf-46e6-b832-e8c28d3de8db" />

