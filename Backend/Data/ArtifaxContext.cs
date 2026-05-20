using Microsoft.EntityFrameworkCore;
using Artifax.Models;

namespace Artifax.Data
{
    public class ArtifaxContext : DbContext
    {
        public ArtifaxContext(DbContextOptions<ArtifaxContext> options) : base(options)
        {
        }

        public DbSet<Branch> Branches { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; } 
        public DbSet<Item> Items { get; set; }
        public DbSet<ItemIngredient> ItemIngredients { get; set; }
        public DbSet<BranchItemCapacity> BranchItemCapacities { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 1. Existing Group Relationships (DO NOT REMOVE)
            modelBuilder.Entity<Branch>().HasMany(b => b.BranchItemCapacities).WithOne(bic => bic.Branch).HasForeignKey(bic => bic.BranchID);
            modelBuilder.Entity<Item>().HasMany(i => i.BranchItemCapacities).WithOne(bic => bic.Item).HasForeignKey(bic => bic.ItemID);
            modelBuilder.Entity<Item>().HasMany(i => i.IngredientItemIngredients).WithOne(ig => ig.IngredientItem).HasForeignKey(ig => ig.IngredientID);
            modelBuilder.Entity<Item>().HasMany(i => i.ProductItemIngredients).WithOne(ig => ig.ProductItem).HasForeignKey(ig => ig.ProductID);
            modelBuilder.Entity<Branch>().HasMany(b => b.Employees).WithOne(e => e.Branch).HasForeignKey(e => e.BranchId);

// Links Order to OrderItems
            modelBuilder.Entity<Order>()
                .HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderID);

            // Links the Item table to OrderItems
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Item)
                .WithMany() 
                .HasForeignKey(oi => oi.ItemID);
                
            modelBuilder.Entity<Branch>().HasMany(b => b.Orders).WithOne(o => o.Branch).HasForeignKey(o => o.BranchID);
        }
    }
}