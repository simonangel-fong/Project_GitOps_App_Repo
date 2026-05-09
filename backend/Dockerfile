FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app
COPY app/mvnw app/pom.xml ./
COPY app/.mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q
COPY app/src src
RUN ./mvnw package -DskipTests -q

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=builder /app/target/app-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
