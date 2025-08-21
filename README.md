### HNIN Connect: A Professional Network for High Net-Worth Individuals ### 
This document provides instructions for setting up and running the Minimum Viable Product (MVP) for HNIN Connect, an exclusive social network for High Net-Worth Individuals.

Prerequisites
Before you begin, ensure you have the following software installed:  
Git  
Docker (v28+)  
Java 17 (Temurin/Oracle)  
Node.js (v22+)  
npm (v10+)  
  
You will also need VS Code or terminal access. Remember to add your user to the docker-users group and then log out and log back in for the changes to take effect.

To go to a certain directory:
```Bash
cd "full path"
```

Getting Started  
**1. Clone the Project**
Open a terminal or PowerShell and clone the project repository:
```Bash
git clone https://github.com/PranavKheny/elite-connect.git
```

**2. Start the Database Container**
If the Postgres container is not already running, use the following command to start it.   
```Bash
docker run -d --name elite_connect_db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=elite_connect_db -p 5432:5432 postgres:13-alpine
```
You can verify the container is running by using 
```Bash
docker ps
```
To clear and reset the database, navigate to the elite-connect/infrastructure directory in your terminal and run:
```Bash
docker compose down -v
docker compose up -d
```

**3. Run the Backend Services**
Open a new terminal, navigate to the elite-connect/backend/user-service directory, and run the following command:
```Bash
.\mvnw spring-boot:run
```
**4. Run the Frontend Services**
Open a new terminal, navigate to the elite-connect/frontend-app directory, and run these commands.  
The npm install command is only needed the first time you set up the project.  
Look at 6. npm error if you run into an error.
```Bash
npm install
npm start
```

**5. Verifying Users**
To manually verify a user, you'll need to run a SQL command inside the Postgres container.  
First, ensure the container is running with docker ps.  
Next, open a new terminal in the elite-connect/infrastructure directory and access the database's command line:    
```Bash
docker exec -it elite_connect_db psql -U user -d elite_connect_db
```
Once inside the SQL command line, run the following command to verify a user. Replace 'user1' with the desired username.
```Bash
UPDATE public.users SET is_verified = TRUE WHERE username IN ('user1');
```
To check the verification status of users, use this command:  
```Bash
SELECT id, username, is_verified FROM public.users WHERE username IN ('user1','user2');
```
To exit the SQL query mode:
```Bash
\q
```
**6. npm error**
If you encounter a PowerShell script policy error with npm, you can resolve it by running the following command:
```Bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```
