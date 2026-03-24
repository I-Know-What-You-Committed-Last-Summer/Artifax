namespace Artifax.Models
{
    public class Employee
    {
        public int EmployeeId { get; set; }
        public string EmployeeEmail { get; set; } = string.Empty; // Initialize with default value
        public string EmployeeName { get; set; } = string.Empty; // Initialize with default value
        public string EmployeePasswordHash { get; set; } = string.Empty; // Initialize with default value
        public int BranchId { get; set; }
    }
}
