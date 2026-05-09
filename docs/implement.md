
- Create Spring Boot Project
  - using vscode gradle extension.

```sh
cd backend/app && mvn test
```


```sh
cd backend/


docker build -t gitops-backend .
docker run -d --name gitops-backend -e APP_VERSION=1.2.3  -p 8080:8080 gitops-backend

curl http://localhost:8080/version
# {"code":200,"version":"1.2.3","status":"success"}
```