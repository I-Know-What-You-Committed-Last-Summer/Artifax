namespace Artifax.Models
{
    public class Admin
    {
        public int AdminId { get; set; }
        public string AdminEmail { get; set; } = string.Empty; // Initialize with default value
        public string AdminName { get; set; } = string.Empty; // Initialize with default value
        public string AdminPasswordHash { get; set; } = string.Empty; // Initialize with default value
    }
}
