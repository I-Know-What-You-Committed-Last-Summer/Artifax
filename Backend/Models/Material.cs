namespace Artifax.Models
{
    public class Material
    {
        public int MaterialID {get; set;}
        public string MaterialName { get; set; } = string.Empty; // Initialize with default value
        public ICollection<BranchMaterial> BranchMaterials { get; set; } = new List<BranchMaterial>(); // Initialize with default value
        public ICollection<ProductMaterial> ProductMaterials { get; set; } = new List<ProductMaterial>(); // Initialize with default value
    }
}