## HNIN Connect: A Professional Network for High Net-Worth Individuals

**MVP for an exclusive social network for High Net-Worth Individuals (HNIN).**

Prerequisites:
Git
Docker (v28+)
Java 17 (Temurin/Oracle)
Node.js (v22+)
npm (v10+)
VS Code or terminal access
Add user to docker-users group (then log out/in)

Steps to run the project:

1) Clone the project:
       git clone https://github.com/PranavKheny/elite-connect.git

3) Get the container running:
        If the Postgres container isn’t running (your docker ps was empty), start it in powershell :
   
        docker run -d --name elite_connect_db `
          -e POSTGRES_USER=user `
          -e POSTGRES_PASSWORD=password `
          -e POSTGRES_DB=elite_connect_db `
          -p 5432:5432 postgres:13-alpine
        
        docker ps   # should list elite_connect_db
   
  to clear and reset the database:
    in vs code go to the elite-connect\infrastructure directory
    then run:
      docker compose down -v
      docker compose up -d

3) To run the backend services:
        in vs code Open another terminal
        go to the elite-connect\backend\user-service directory
        then run:
             .\mvnw spring-boot:run

4) To run the frontend services:
         in vs code Open another terminal
         go to the elite-connect\frontend-app directory
         then run:
           npm install  # only the first time u want to run it, from next time you dont need to
           npm start

6) To verify certain users:
         Verify the container is running
         Run the SQL inside Postgres
               in vs code, in a separate terminal from backend, frontend go to the elite-connect\infrastrcture
                 run: docker ps
                      docker exec -it elite_connect_db psql -U user -d elite_connect_db
                  it will open the sql query command line in which u need to run this command to verify certain users, change username accordingly:
                       UPDATE public.users SET is_verified = TRUE WHERE username IN ('user1');
                  to check the user data and if they are verified run this command in the same sql command line:
                       SELECT id,username, is_verified FROM public.users WHERE username IN ('user1','user2');


If anyone hits a PowerShell script policy error with npm, they can run:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force


