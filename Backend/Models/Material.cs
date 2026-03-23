namespace Artifax.Models
{
    public class Material
    {
        public int MaterialID {get; set;}
        public string MaterialName {get; set;}
        public ICollection<BranchMaterial> BranchMaterials {get;set;}
        public ICollection<ProductMaterial> ProductMaterials {get;set;}
    }
}