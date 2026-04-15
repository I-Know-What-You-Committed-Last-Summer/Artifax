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

        #region ProductEndpoints

        [HttpGet("AllProducts")]
        public async Task<ActionResult<IEnumerable<ProductReadDto>>> GetAllProducts()
        {
            return await _context.Products.Select(p => ProductReadDto.toDto(p)).ToListAsync();
        }
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
        [HttpGet("AllProductMaterials")]
        public async Task<ActionResult<IEnumerable<ProductMaterialReadDto>>> GetAllProductMaterials()
        {
            return await _context.ProductMaterials.Select(pm => ProductMaterialReadDto.ToDto(pm)).ToListAsync();
        }
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

        #region BranchProductEndpoints
        #endregion
    }
}