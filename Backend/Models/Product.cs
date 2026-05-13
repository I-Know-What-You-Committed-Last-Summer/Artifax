using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Artifax.Models
{
    [Table("Items")] // ERD Compliance
    public class Product
    {
        [Key]
        [Column("ItemID")] // ERD Compliance
        public int ProductID { get; set; }

        [Column("ItemCategory")] // ERD Compliance
        public string ItemCategory { get; set; } = "General";

        [Column("Name")] // ERD Compliance
        public string ProductName { get; set; } = string.Empty;

        [Column("ProductionTime")] // ERD Compliance
        public float ProductionDuration { get; set; }

        // Team's Extra Features
        public string ProductImageURL { get; set; } = string.Empty;

        // Relationships
        public ICollection<ProductMaterial>? ProductMaterial { get; set; }
        public ICollection<BranchProduct>? BranchProducts { get; set; }
    }
}