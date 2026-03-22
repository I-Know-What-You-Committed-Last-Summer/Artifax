using Artifax.Models;

namespace Artifax
{
    public class Product
    {
        public int ProductID {get; set;}
        public string ProductName {get; set;}
        public float ProductionDuration {get; set;}
        public ICollection<ProductMaterial> ProductMaterial {get;set;}
        public ICollection<BranchProduct> BranchProducts {get;set;}
    }
}
