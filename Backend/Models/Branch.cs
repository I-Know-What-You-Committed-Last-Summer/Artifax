namespace Artifax.Models
{
    public class Branch
    {
        public int BranchID { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public List<Order> Orders { get; set; } = new List<Order>();
        public List<BranchMaterial> BranchMaterials { get; set; } = new List<BranchMaterial>();
        public List<BranchProduct> BranchProducts { get; set; } = new List<BranchProduct>();
    }
}