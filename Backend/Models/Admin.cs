namespace Artifax.Models
{
    public class Admin
    {
        public int AdminId { get; set; }
        public string AdminEmail { get; set; }
        public string AdminName { get; set; }
        public string AdminPasswordHash { get; set; }
    }
}
