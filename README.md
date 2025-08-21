## HNIN Connect: A Professional Network for High Net-Worth Individuals

**MVP for an exclusive social network for High Net-Worth Individuals (HNIN).**

### Prerequisites:
- Git  
- Docker (v28+)  
- Java 17 (Temurin/Oracle)  
- Node.js (v22+)  
- npm (v10+)  
- VS Code or terminal access  
- Add user to docker-users group (then log out/in)  

---

### Steps to run the project:

**1) Clone the project:**
```bash
git clone https://github.com/PranavKheny/elite-connect.git

**2) Get the container running:**
If the Postgres container isn’t running (your docker ps was empty), start it in PowerShell:

docker run -d --name elite_connect_db `
  -e POSTGRES_USER=user `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=elite_connect_db `
  -p 5432:5432 postgres:13-alpine

docker ps   # should list elite_connect_db


To clear and reset the database:
In VS Code go to the elite-connect\infrastructure directory
Then run:

docker compose down -v
docker compose up -d


**3) To run the backend services:**
In VS Code open another terminal
Go to the elite-connect\backend\user-service directory
Then run:

.\mvnw spring-boot:run


**4) To run the frontend services:**
In VS Code open another terminal
Go to the elite-connect\frontend-app directory
Then run:

npm install    # only the first time you want to run it, from next time you don’t need to
npm start


**5) To verify certain users:**
Verify the container is running
Run the SQL inside Postgres
In VS Code, in a separate terminal from backend/frontend
Go to the elite-connect\infrastructure directory
Run:

docker ps
docker exec -it elite_connect_db psql -U user -d elite_connect_db


It will open the SQL query command line in which you need to run this command to verify certain users (change username accordingly):

UPDATE public.users SET is_verified = TRUE WHERE username IN ('user1');


To check the user data and if they are verified, run this in the same SQL command line:

SELECT id, username, is_verified FROM public.users WHERE username IN ('user1', 'user2');


**npm error**
If anyone hits a PowerShell script policy error with npm, they can run:

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
