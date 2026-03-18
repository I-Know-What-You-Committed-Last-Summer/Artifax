using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Artifax.Models
{
    public class ProductMaterial
    {
        [Key]
        public int ProductMaterialId { get; set; }
        [ForeignKey("Product")]
        public int ProductId { get; set; }
        [ForeignKey("Material")]
        public int MaterialId { get; set; }
        public int Quantity { get; set; }

    }
}
