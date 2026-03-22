using Artifax.Models;

namespace Artifax.DTOs
{
    public class AdminReadDto
    {
        public int AdminId { get; set; }
        public string AdminEmail { get; set; }
        public string AdminName { get; set; }

        public static AdminReadDto ToDto (Admin incoming)
        {
            AdminReadDto _result = new()
            {
                AdminEmail = incoming.AdminEmail,
                AdminId = incoming.AdminId,
                AdminName = incoming.AdminName
            };

            return _result;
        }
    }
}