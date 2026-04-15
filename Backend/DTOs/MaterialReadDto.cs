using Artifax.Models;
namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class MaterialReadDto
    {
        public int MaterialID {get; set;}
        public string MaterialName {get; set;}
        public string MaterialImageURL {get; set;}
        public static MaterialReadDto ToDto (Material incoming)
        {
            MaterialReadDto _result = new()
            {
                MaterialID = incoming.MaterialID,
                MaterialName = incoming.MaterialName,
                MaterialImageURL = incoming.MaterialImageURL
            };

            return _result;
        }
    }
}