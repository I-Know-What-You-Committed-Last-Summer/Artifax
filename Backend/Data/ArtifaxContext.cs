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
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductMaterial> ProductMaterials { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Branch>().HasMany(b => b.Orders).WithOne(o => o.Branch).HasForeignKey(o=> o.BranchID);
            modelBuilder.Entity<Branch>().HasMany(b => b.BranchMaterials).WithOne(bm => bm.Branch).HasForeignKey(bm => bm.BranchID);
            modelBuilder.Entity<Material>().HasMany(m => m.BranchMaterials).WithOne(bm => bm.Material).HasForeignKey(bm => bm.MaterialID);
            modelBuilder.Entity<Material>().HasMany(m => m.ProductMaterials).WithOne(pm => pm.Material).HasForeignKey(pm => pm.MaterialId);
            modelBuilder.Entity<Product>().HasMany(p => p.ProductMaterial).WithOne(pm => pm.Product).HasForeignKey(pm => pm.ProductId);
            modelBuilder.Entity<Branch>().HasMany(b => b.BranchProducts).WithOne(bp => bp.Branch).HasForeignKey(bp => bp.BranchID);
            modelBuilder.Entity<Product>().HasMany(p => p.BranchProducts).WithOne(bp => bp.Product).HasForeignKey(bp => bp.ProductID);
            modelBuilder.Entity<Order>().HasMany(o => o.Items).WithOne(oi => oi.Order).HasForeignKey(oi => oi.OrderId);
            modelBuilder.Entity<Product>().HasMany<OrderItem>().WithOne(oi => oi.Product).HasForeignKey(oi => oi.ProductID);
        }
    }
}