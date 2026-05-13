namespace Artifax.Models
{
    public class ProductMaterial
    {
        public int ProductMaterialId { get; set; }
        public int ProductId { get; set; }
        public int MaterialId { get; set; }
        public int Quantity { get; set; }
        //Defining the one relationships
        public Material Material {get;set;}
        public Product Product {get;set;}
    }
}
