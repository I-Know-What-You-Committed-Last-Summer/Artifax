using Artifax.Models;
namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class BranchItemCapacityReadDto
    {
        public int BranchItemCapacityID { get; set; }
        public int BranchID { get; set; }
        public int ItemID { get; set; }
        public int ItemQuantity { get; set; }
        public static BranchItemCapacityReadDto ToDto (BranchItemCapacity incoming)
        {
            BranchItemCapacityReadDto _result = new()
            {
               BranchItemCapacityID = incoming.BranchItemCapacityID,
               BranchID = incoming.BranchID,
               ItemID = incoming.ItemID,
               ItemQuantity = incoming.ItemQuantity
            };

            return _result;
        }
    }
}
