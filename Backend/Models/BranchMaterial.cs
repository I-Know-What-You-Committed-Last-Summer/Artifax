namespace Artifax.Models
{
    public class BranchMaterial
    {
        public int BranchMaterialID {get;set;}
        public int MaterialID {get;set;}
        public int BranchID {get;set;}
        public int BranchMaterialQuantity {get;set;}
        public Branch Branch {get;set;}
        public Material Material {get;set;}
    }
}