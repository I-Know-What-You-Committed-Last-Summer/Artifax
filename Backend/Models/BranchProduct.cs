namespace Artifax.Models
{
    public class BranchProduct
    {
        public int BranchProductID {get;set;}
        public int ProductID {get;set;}
        public int BranchID {get;set;}
        public int ProductMaterialQuantity {get;set;}

        //Defining the one relationships
        public Branch Branch {get;set;}
        public Product Product {get;set;}
    }
}