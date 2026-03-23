namespace Artifax.Models
{
    public class Branch
    {
        public int BranchID {get; set;}
        public string BranchName {get; set;}
        public ICollection<Order> Orders { get; set;}
        public ICollection<BranchMaterial> BranchMaterials {get;set;}
        public ICollection<BranchProduct> BranchProducts {get;set;}
    }
}