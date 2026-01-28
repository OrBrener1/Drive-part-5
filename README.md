# Drive Me Nuts - Mobile & Web Application

Drive Me Nuts is a Google Drive-like file storage system developed as part of the
**Advanced Programming** course.

This repository focuses on the **mobile and application layer**, built on
top of the backend system developed in previous parts of the course.

The project demonstrates client-side integration with an existing backend,
including authentication, file management, permissions, and search.


## Project Components (High-Level)

The system consists of the following components:

- **C++ Storage Server** – Handles physical file storage (provided from previous exercises)
- **Node.js Backend Server** – Exposes a REST API and manages application logic
- **React Web Client** – Browser-based client
- **React Native Mobile Client** – Cross-platform mobile application (Expo)

Detailed architecture and design decisions are documented in the **GitHub Wiki**.


## Running the Project

The project is designed to run on **Linux-based systems** using
**Docker and docker-compose**.

### Prerequisites

- Linux environment
- Docker
- Docker Compose
- Node.js and npm 
- (Optional) Android Emulator or a real mobile device with **Expo Go**


## Running the application: 
From the root of the repository, in a Linux terminal:

**chmod +x setup.sh**   
<img width="250" alt="image" src="https://github.com/user-attachments/assets/6d00f947-c796-4204-8bb2-2014d296010b" />


and then :

**./setup.sh**

<img width="250" alt="image" src="https://github.com/user-attachments/assets/c5e6087f-82bb-479c-9c84-1f336c72eb45" />



### Finding the Host IP Address

When running the mobile application on a **real device**, the backend server
must be accessible over the local network.

To find the correct IP address of the host machine:

- Open a terminal on the host machine
- Run the following command:
ip addr show
Locate the active network interface (e.g. WiFi or Ethernet)
Use the IPv4 address marked as inet, for example:

inet 192.168.1.42/24. 

## Setup Script Overview

The setup script guides you through the entire execution process and performs
the following steps:

- Verifies that Docker is installed and running
- Prompts you to choose how to test the application:
  - **Web only**
  - **Mobile client** (Android Emulator or real device)
- Creates the required environment configuration files
- Builds and starts all backend services using Docker
- Guides you through running the mobile application (if selected)

## Mobile Application – Network Configuration 

When running the **mobile client**, the backend server must be reachable from
the mobile device.

We explored automatically detecting the correct host IP address.  
However, since **network configuration and routing were not part of the course
material**, and because execution environments may vary (e.g. university
networks, NAT, VPNs, virtual machines), we intentionally chose **not to rely on
automatic IP detection**.

Instead, the setup script:

- Explains how to identify the correct network IP
- Validates user input
- Avoids assumptions about the underlying network configuration

This approach ensures predictable and reliable behavior across different
environments and avoids hidden networking dependencies.


### Common Scenarios

#### Android Emulator
The Android emulator uses the special address: 10.0.2.2
to access the host machine.  
This configuration is handled automatically by the setup script.

#### Real Mobile Device (Expo Go)
Running the application on a real mobile device requires the host machine’s
local network IP, for example:

- 192.168.x.x
- 172.18.x.x

(depending on the network configuration).
The setup script provides clear, step-by-step instructions for identifying and
entering the correct IP address.

## Web Client
After the backend services are running, the web client is available at: http://localhost:3000  
The browser is **not opened automatically**.


## Documentation
Full documentation of the system is available in the **GitHub Wiki** and
includes:

- File views and navigation
- Basic and advanced file actions
- Upload and download flows
- Mobile and web client behavior
- Design decisions


## Development Process
The project was developed incrementally:

- The backend API was treated as a stable interface
- The mobile and web clients were built on top of the same API
- Features were added iteratively with continuous testing
- Design decisions prioritized clarity, robustness, and alignment with
  course material
  

## Platform Notes

This project is officially supported on **Linux**.

Running the project on Windows may require additional configuration
(e.g. WSL and Docker Desktop) and is not guaranteed.

## A Note from the Team

Drive Me Nuts was developed as part of an academic assignment involving multiple
components and non-trivial design decisions.

Between backend integration, mobile development, and deployment considerations,
the project lived up to its name - and still works.


<img width="800" alt="ChatGPT Image Jan 26, 2026, 06_11_25 PM" src="https://github.com/user-attachments/assets/2c9a2bd2-a04c-41b0-8cb3-d4caebdf98b7" />



