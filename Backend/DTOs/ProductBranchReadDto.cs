using Artifax.Models;

namespace Artifax.DTOs
{
    public class BranchProductReadDto
    {
        public int BranchProductID {get;set;}
        public int ProductID {get;set;}
        public int BranchID {get;set;}
        public int ProductMaterialQuantity {get;set;}

        public static BranchProductReadDto ToDto (BranchProduct incoming)
        {
            BranchProductReadDto _result = new()
            {
                BranchProductID = incoming.BranchProductID,
                ProductID = incoming.ProductID,
                BranchID = incoming.BranchID,
                ProductMaterialQuantity = incoming.ProductMaterialQuantity
            };

            return _result;
        }
    }
}