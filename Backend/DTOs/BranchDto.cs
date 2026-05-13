using Artifax.Models;

namespace Artifax.DTOs
{
    public class BranchDto
    {
        public int BranchID { get; set; }
        public string BranchName { get; set; } = "";

        public static BranchDto ToDto (Branch branch)
        {
            BranchDto _result = new ()
            {
                BranchID = branch.BranchID,
                BranchName = branch.BranchName
            };

            return _result;
        }

        public Branch ToBranch ()
        {
            Branch _result = new Branch
            {
                BranchID = BranchID,
                BranchName = BranchName
            };

            return _result;
        }
    }
}