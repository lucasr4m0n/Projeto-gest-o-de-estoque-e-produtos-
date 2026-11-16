# ---------- Etapa 1: build ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Wrapper do Maven + pom primeiro (aproveita cache de dependencias)
COPY .mvn .mvn
COPY mvnw pom.xml ./
# Remove CRLF caso o mvnw tenha sido salvo no Windows e garante permissao de execucao
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw -B dependency:go-offline

COPY src src
# Testes ficam de fora: dependem de banco e nao rodam no build da plataforma
RUN ./mvnw -B -DskipTests package

# ---------- Etapa 2: execucao ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Limita a memoria da JVM (instancia gratuita tem 512 MB)
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:TieredStopAtLevel=1"

EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]