using Artifax.Models;

namespace Artifax.DTOs
{
    public class BranchMaterialReadDto
    {
        public int BranchMaterialID {get;set;}
        public int MaterialID {get;set;}
        public int BranchID {get;set;}
        public int MaterialQuantity {get;set;}

        public static BranchMaterialReadDto ToDto (BranchMaterial incoming)
        {
            BranchMaterialReadDto _result = new()
            {
                BranchMaterialID = incoming.BranchMaterialID,
                MaterialID = incoming.MaterialID,
                BranchID = incoming.BranchID,
                MaterialQuantity = incoming.BranchMaterialQuantity
            };

            return _result;
        }

    }
}