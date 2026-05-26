using Artifax.Models;

namespace Artifax.DTOs
{
    public class EmployeeReadDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeEmail { get; set; }
        public string EmployeeName { get; set; }
        public int BranchId { get; set; }

        public static EmployeeReadDto ToDto (Employee incoming)
        {
            EmployeeReadDto _result = new ()
            {
                BranchId = incoming.BranchId,
                EmployeeEmail = incoming.EmployeeEmail,
                EmployeeId = incoming.EmployeeId,
                EmployeeName = incoming.EmployeeName
            };
            return _result;
        }
    }
}