using Artifax.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Use InMemory database if the connection string has placeholders, otherwise use PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("ArtifaxDatabase") ?? "";
if (connectionString.Contains("(*"))
{
    builder.Services.AddDbContext<ArtifaxContext>(options => options.UseInMemoryDatabase("ArtifaxTestDb"));
}
else
{
    builder.Services.AddDbContext<ArtifaxContext>(options => options.UseNpgsql(connectionString));
}

var app = builder.Build();

// Seed test data when using InMemory database
if (connectionString.Contains("(*"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ArtifaxContext>();
    SeedTestData(db);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

// Seed test data for InMemory database
void SeedTestData(ArtifaxContext db)
{
    // Materials
    var wood = new Artifax.Models.Material { MaterialID = 1, MaterialName = "Wood" };
    var metal = new Artifax.Models.Material { MaterialID = 2, MaterialName = "Metal" };
    var fabric = new Artifax.Models.Material { MaterialID = 3, MaterialName = "Fabric" };
    db.Materials.AddRange(wood, metal, fabric);

    // Products
    var chair = new Artifax.Product { ProductID = 1, ProductName = "Chair", ProductionDuration = 2.0f };
    var table = new Artifax.Product { ProductID = 2, ProductName = "Table", ProductionDuration = 4.0f };
    var lamp = new Artifax.Product { ProductID = 3, ProductName = "Lamp", ProductionDuration = 1.5f };
    db.Products.AddRange(chair, table, lamp);

    // ProductMaterials (recipes)
    db.ProductMaterials.AddRange(
        new Artifax.Models.ProductMaterial { ProductMaterialId = 1, ProductId = 1, MaterialId = 1, Quantity = 4 },  // Chair needs 4 Wood
        new Artifax.Models.ProductMaterial { ProductMaterialId = 2, ProductId = 1, MaterialId = 2, Quantity = 2 },  // Chair needs 2 Metal
        new Artifax.Models.ProductMaterial { ProductMaterialId = 3, ProductId = 2, MaterialId = 1, Quantity = 8 },  // Table needs 8 Wood
        new Artifax.Models.ProductMaterial { ProductMaterialId = 4, ProductId = 2, MaterialId = 2, Quantity = 4 },  // Table needs 4 Metal
        new Artifax.Models.ProductMaterial { ProductMaterialId = 5, ProductId = 3, MaterialId = 2, Quantity = 1 },  // Lamp needs 1 Metal
        new Artifax.Models.ProductMaterial { ProductMaterialId = 6, ProductId = 3, MaterialId = 3, Quantity = 2 }   // Lamp needs 2 Fabric
    );

    // Branch
    var branch = new Artifax.Models.Branch { BranchID = 1, BranchName = "Main Workshop" };
    db.Branches.Add(branch);

    // BranchMaterials (stock)
    db.BranchMaterials.AddRange(
        new Artifax.Models.BranchMaterial { BranchMaterialID = 1, BranchID = 1, MaterialID = 1, BranchMaterialQuantity = 50 },  // 50 Wood
        new Artifax.Models.BranchMaterial { BranchMaterialID = 2, BranchID = 1, MaterialID = 2, BranchMaterialQuantity = 30 },  // 30 Metal
        new Artifax.Models.BranchMaterial { BranchMaterialID = 3, BranchID = 1, MaterialID = 3, BranchMaterialQuantity = 20 }   // 20 Fabric
    );

    // Employee
    db.Employees.Add(new Artifax.Models.Employee { EmployeeId = 1, EmployeeEmail = "worker@artifax.com", EmployeeName = "Test Worker", EmployeePasswordHash = "test", BranchId = 1 });

    db.SaveChanges();
}
