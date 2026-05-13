namespace Artifax.Models
{
    public class Branch
    {
        public int BranchID {get; set;}
        public string BranchName {get; set;} = "";

        //Defining the many relationships, as far as im aware these do not show on the db and are purely for the relationships.
        public ICollection<Order?> Orders { get; set;} = new List<Order>();
        public ICollection<BranchMaterial?> BranchMaterials { get; set; } = new List<BranchMaterial>();
        public ICollection<BranchProduct?> BranchProducts { get; set; } = new List<BranchProduct>();
        public ICollection<Employee?> Employees { get; set; } = new List<Employee>();
    }
}