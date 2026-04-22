using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Artifax.Models;
using Artifax.Data;
using Artifax.DTOs;

namespace Artifax.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ArtifaxContext _context;
        public ProductController(ArtifaxContext context)
        {
            _context = context;
        }

        //Endpoints for general products

        #region ProductEndpoints

        //List of all products we can make

        [HttpGet("AllProducts")]
        public async Task<ActionResult<IEnumerable<ProductReadDto>>> GetAllProducts()
        {
            return await _context.Products.Select(p => ProductReadDto.toDto(p)).ToListAsync();
        }

        //Specific product by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductReadDto>> GetProduct(int id)
        {
            var _product = await _context.Products.FindAsync(id);
            if (_product == null)
            {
                return NotFound();
            }
            return ProductReadDto.toDto(_product);
        }
        //Create a new product, we do not assign materials with this endpoint as that is done with the ProductMaterial endpoints
        [HttpPost("")]
        public async Task<ActionResult<Product>> CreateProduct(ProductWriteDto _incoming)
        {
            Product _product = new Product()
            {
                ProductName = _incoming.ProductName,
                ProductionDuration = _incoming.ProductionDuration,
                ProductImageURL = _incoming.ProductImageURL
            };
            _context.Products.Add(_product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProduct), new { id = _product.ProductID }, new ProductReadDto(){
                ProductID = _product.ProductID,
                ProductName = _product.ProductName,
                ProductionDuration = _product.ProductionDuration,
                ProductImageURL = _product.ProductImageURL
            });
        }
        //Update a product
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, ProductWriteDto _incoming)
        {
            var _product = await _context.Products.FindAsync(id);
            if (_product == null)
            {
                return NotFound();
            }
            _product.ProductName = _incoming.ProductName;
            _product.ProductionDuration = _incoming.ProductionDuration;
            _product.ProductImageURL = _incoming.ProductImageURL;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        //Delete a product. DB auto collapes foreign relations so no need to collapse related product materials and product branches
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var _product = await _context.Products.FindAsync(id);
            if (_product == null)
            {
                return NotFound();
            }
            _context.Products.Remove(_product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        #endregion

        #region ProductMaterialEndpoints

        //Endpoints for assigning materials to products and managing those relationships

        //All product materials regardless of product
        [HttpGet("AllProductMaterials")]
        public async Task<ActionResult<IEnumerable<ProductMaterialReadDto>>> GetAllProductMaterials()
        {
            return await _context.ProductMaterials.Select(pm => ProductMaterialReadDto.ToDto(pm)).ToListAsync();
        }

        // Get all materials for a specific product
        [HttpGet("ProductMaterials/{id}")]
        public async Task<ActionResult<IEnumerable<ProductMaterialReadDto>>> GetAllProductMaterials(int id)
        {
            return await _context.ProductMaterials.Where(pm => pm.ProductId == id).Select(pm => ProductMaterialReadDto.ToDto(pm)).ToListAsync();
        }

        //Create a new product material
        [HttpPost("ProductMaterial")]
        public async Task<ActionResult<ProductMaterialReadDto>> CreateProductMaterial(ProductMaterialWriteDto _incoming)
        {
            ProductMaterial _productMaterial = new ProductMaterial()
            {
                ProductId = _incoming.ProductId,
                MaterialId = _incoming.MaterialId,
                Quantity = _incoming.Quantity
            };
            _context.ProductMaterials.Add(_productMaterial);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAllProductMaterials), new { id = _productMaterial.ProductMaterialId }, ProductMaterialReadDto.ToDto(_productMaterial));
        }
        //Update a product material
        [HttpPut("ProductMaterial/{id}")]
        public async Task<IActionResult> UpdateProductMaterial(int id, ProductMaterialWriteDto _incoming)
        {
            var _productMaterial = await _context.ProductMaterials.FindAsync(id);
            if (_productMaterial == null)
                return NotFound();
            _productMaterial.ProductId = _incoming.ProductId;
            _productMaterial.MaterialId = _incoming.MaterialId;
            _productMaterial.Quantity = _incoming.Quantity;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        //Delete a product material
        [HttpDelete("ProductMaterial/{id}")]
        public async Task<IActionResult> DeleteProductMaterial(int id)
        {
            var _productMaterial = await _context.ProductMaterials.FindAsync(id);
            if (_productMaterial == null)
            {
                return NotFound();
            }
            _context.ProductMaterials.Remove(_productMaterial);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        #endregion

        //Endpoints for assigning products to branches and managing those relationships
        //Not yet completed, waiting on the branch controller to be completed and fully functional.
        #region BranchProductEndpoints
        #endregion
    }
}