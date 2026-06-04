# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["Artifax.csproj", "./"]
RUN dotnet restore "Artifax.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "Artifax.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Serve the application
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .

# Tell Render to run this DLL when the server starts
ENTRYPOINT ["dotnet", "Artifax.dll"]