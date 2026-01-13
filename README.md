# Drive me nuts – Web-Based Drive Application

Drive me nuts is a web-based storage application that extends the backend system developed in
**Exercises 2 and 3** with a **React frontend**.

The project simulates core functionality of a Google Drive–like application, including users,
authentication, file and folder management, permissions, search, and a graphical user interface.

The system consists of a **C++ storage server**, * a **NodeJS web server** , and a **React web application**.

## Architecture Overview

### C++ Storage Server 
The C++ server is responsible for physical file storage and persistence on disk.
It runs as an independent storage service and is treated as a black box by the higher layers.

### NodeJS Web Server
The NodeJS server exposes a RESTful JSON API and manages users, authentication, files, permissions, and search.
It serves as the single backend interface used by the React application.

### React Web Application 
The React application provides the user interface of the system and communicates exclusively with the NodeJS server.
It is implemented as a single-page application and displays real, dynamic data returned from the backend.

## Application Flow
This section describes a typical user flow while using the application.

### 1. Entry Point – Login Screen
When accessing the application, unauthenticated users are presented with a login screen.
* Existing users can log in using username and password
* A clear option is provided to navigate to the registration screen

<img width="1200" alt="image" src="https://github.com/user-attachments/assets/e53094c5-a45c-4285-ac95-762a5875cb39" />

### 2. Registration
New users can register by providing:
* Username
* Password + password confirmation
* Display name
* Profile image
Client-side validation ensures that invalid input is handled immediately and clearly.

<img width="1200" alt="image" src="https://github.com/user-attachments/assets/073dd3ee-f913-4b59-b16e-f22eaaa8ca36" />

### 3. Main Application Screen
After successful authentication, the user is redirected to the main screen.

The main screen includes:
* Top menu with user information and logout option (appears when clicking the user's avatar)
* Side menu for navigation (e.g. Home, My Drive, Starred, Shared with me, Recent, Bin)
* Central area displaying files and folders
All data shown is fetched dynamically from the backend.

<img width="1200" alt="image" src="https://github.com/user-attachments/assets/de6a69d0-3ccc-40c3-8ffd-cfd93f5f3027" />

### 4. File & Folder Management
From the main screen, users can:
* Create files and folders
* View file contents, or images
* Edit files (basic editing)
* Delete items
* Restore items when applicable

Actions are immediately reflected in the UI based on server responses.

creating folder:
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/51d06af5-d909-47e3-9df4-055398a3e94d" />

creating file:
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/ccb6c988-1fd9-44e1-ae59-c300e3f679fe" />

uploading picture and file:
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/708f71d6-dc27-48e1-b305-15d97b9b5af9" />

<img width="1200" alt="image" src="https://github.com/user-attachments/assets/5461625f-87c2-43c1-839d-9b901a0a96f1" />

Edit file:
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/a92b3701-7923-426b-8d75-812eb8830b87" />

replace image:
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/d4d4a4cd-231f-489e-8467-ea00a4f84258" />

Move file to bin: 
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/1396caff-5e75-435b-916c-a3a3c93f0e59" />

Delete forever / restore: 
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/b462a0c2-e609-47c6-ad9e-9b29816ad598" />

Additional file actions are available through the user interface.

### 5. Permissions

Users can manage permissions for files and folders:
* View permissions
  <img width="1200" alt="image" src="https://github.com/user-attachments/assets/cb788fb3-728c-450c-9ce6-83edc46ddec9" />

* Add new permissions
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/c6a12045-c88a-44a7-8a40-5a595ea0b3c5" />

* Update or remove permissions
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/0719544a-5147-47e8-83a3-c2cafe06636b" />

### 6. Search
The application supports searching files and folders by name and content.
Search results are displayed dynamically as returned from the backend.
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/b534140b-0c52-4177-9b00-576cffd4d771" />

### 7. Theme & Logout

* Users can toggle between **Light** and **Dark** themes
* Logging out ends the session and redirects back to the login screen
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/89d2f053-a206-4f7f-8d9b-c12c89a73ce2" />

## Running the Application
The system is compiled and executed using **Docker and docker-compose**.
From the project root:
***npm run docker:start:open***
<img width="1200" alt="image" src="https://github.com/user-attachments/assets/76b37659-dfdb-47e3-ade0-46602323c6c5" />
This command builds and starts all required services including opening the drive website in browser. 

To stop the system:
***docker-compose down***
This command stops and removes all running containers.

## A Note from the Team
<img width="3584" height="1184" alt="Gemini_Generated_Image_wo6y2uwo6y2uwo6y" src="https://github.com/user-attachments/assets/d6dad860-ad9c-4cc4-92d3-11607f0771bf" />
We called it Drive me nuts for a reason.
Somewhere between sockets, JWTs and React - it did exactly that.

Still works though. Surprisingly.
