using Artifax.Models;

namespace Artifax
{
    public class Product
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public float ProductionDuration { get; set; }
        public ICollection<ProductMaterial> ProductMaterial { get; set; } = new List<ProductMaterial>();
        public ICollection<BranchProduct> BranchProducts { get; set; } = new List<BranchProduct>();
    }
}
