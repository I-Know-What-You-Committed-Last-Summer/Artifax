using Microsoft.EntityFrameworkCore;
using Artifax.Models;

namespace Artifax.Data
{
    public class ArtifaxContext : DbContext
    {
        public ArtifaxContext(DbContextOptions<ArtifaxContext> options) : base(options)
        {
            
        }

        public DbSet<Admin> Admins { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<BranchMaterial> BranchMaterials { get; set; }
        public DbSet<BranchProduct> BranchProducts { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Material> Materials { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductMaterial> ProductMaterials { get; set; }
    }
}