using Artifax.Data;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;

// Load environment variables from .env.local file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            // Replace with your actual React app's URL/Port
            policy.WithOrigins("http://localhost:3000", "http://localhost:5253") 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Build connection string from environment variables
var host = Environment.GetEnvironmentVariable("DATABASE_HOST");
var port = Environment.GetEnvironmentVariable("DATABASE_PORT");
var database = Environment.GetEnvironmentVariable("DATABASE_NAME");
var username = Environment.GetEnvironmentVariable("DATABASE_USERNAME");
var password = Environment.GetEnvironmentVariable("DATABASE_PASSWORD");

var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";

builder.Services.AddDbContext<ArtifaxContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(option => {
    option.IdleTimeout = TimeSpan.FromHours(14);
    option.Cookie.HttpOnly = true;
    option.Cookie.IsEssential = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseCors("AllowReactApp");

app.UseHttpsRedirection();

app.UseSession();

app.UseAuthorization();

app.MapControllers();

app.Run();
