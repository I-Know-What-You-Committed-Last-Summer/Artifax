using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Artifax.Models;
using Artifax.Data;

namespace Artifax.Controllers
{

    /// Handles all product related CRUD operations.
    /// Each product has a "recipe"  a list of ProductMaterials that define which raw materials and how much of each are needed to craft it.
   
    [ApiController]
    [Route("api/[Controller]")]
    public class ProductController : ControllerBase
    {
        readonly ArtifaxContext context;

        public ProductController(ArtifaxContext incoming)
        {
            context = incoming;
        }

        #region GetRoutes

        // GET /api/Product — Returns all products with their material recipes
        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await context.Products
                .Include(p => p.ProductMaterial)       // Load the recipe (join table)
                    .ThenInclude(pm => pm.Material)    // Load the actual material details for each recipe entry
                .ToListAsync();
            return Ok(products);
        }

        // GET /api/Product/{id} — Returns a single product by ID with its material recipe
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await context.Products
                .Include(p => p.ProductMaterial)
                    .ThenInclude(pm => pm.Material)
                .FirstOrDefaultAsync(p => p.ProductID == id);

            if (product == null)
                return NotFound($"Product with ID {id} not found.");

            return Ok(product);
        }

        #endregion

        #region CreateRoutes

        // POST /api/Product/create — Creates a new product with optional material recipe
        // Request body: { productName, productionDuration, productMaterial: [{ materialId, quantity }] }
        [HttpPost("create")]
        public async Task<IActionResult> CreateProduct([FromBody] Product newProduct)
        {
            if (string.IsNullOrWhiteSpace(newProduct.ProductName))
                return BadRequest("Product name is required.");

            // Validate that every material in the recipe actually exists in the database
            if (newProduct.ProductMaterial != null)
            {
                foreach (var pm in newProduct.ProductMaterial)
                {
                    var material = await context.Materials.FindAsync(pm.MaterialId);
                    if (material == null)
                        return BadRequest($"Material with ID {pm.MaterialId} does not exist.");

                    // Clear navigation properties so EF doesn't try to insert/track related entities
                    pm.Product = null;
                    pm.Material = null!;
                }
            }

            context.Products.Add(newProduct);
            await context.SaveChangesAsync();

            // Reload with includes so the response contains full material details
            var created = await context.Products
                .Include(p => p.ProductMaterial)
                    .ThenInclude(pm => pm.Material)
                .FirstOrDefaultAsync(p => p.ProductID == newProduct.ProductID);

            return CreatedAtAction(nameof(GetProductById), new { id = newProduct.ProductID }, created);
        }

        #endregion

        #region UpdateRoutes

        // PUT /api/Product/{id} — Updates a product's name, duration and material recipe
        // Uses full replacement: old recipe entries are deleted and replaced with the new ones
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            var existing = await context.Products
                .Include(p => p.ProductMaterial)
                .FirstOrDefaultAsync(p => p.ProductID == id);

            if (existing == null)
                return NotFound($"Product with ID {id} not found.");

            // Validate that all referenced materials exist before making changes
            if (updatedProduct.ProductMaterial != null)
            {
                foreach (var pm in updatedProduct.ProductMaterial)
                {
                    var material = await context.Materials.FindAsync(pm.MaterialId);
                    if (material == null)
                        return BadRequest($"Material with ID {pm.MaterialId} does not exist.");
                }
            }

            // Update basic product fields
            existing.ProductName = updatedProduct.ProductName;
            existing.ProductionDuration = updatedProduct.ProductionDuration;

            // Full replacement strategy: remove all old recipe entries then add the new ones
            context.ProductMaterials.RemoveRange(existing.ProductMaterial);
            if (updatedProduct.ProductMaterial != null)
            {
                foreach (var pm in updatedProduct.ProductMaterial)
                {
                    existing.ProductMaterial.Add(new ProductMaterial
                    {
                        MaterialId = pm.MaterialId,
                        Quantity = pm.Quantity
                    });
                }
            }

            await context.SaveChangesAsync();

            // Reload with includes for the response
            var result = await context.Products
                .Include(p => p.ProductMaterial)
                    .ThenInclude(pm => pm.Material)
                .FirstOrDefaultAsync(p => p.ProductID == id);

            return Ok(result);
        }

        #endregion

        #region DeleteRoutes

        // DELETE /api/Product/{id} — Deletes a product and its material recipe entries
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await context.Products
                .Include(p => p.ProductMaterial)
                .FirstOrDefaultAsync(p => p.ProductID == id);

            if (product == null)
                return NotFound($"Product with ID {id} not found.");

            // Remove recipe entries first (child records) then the product itself
            context.ProductMaterials.RemoveRange(product.ProductMaterial);
            context.Products.Remove(product);
            await context.SaveChangesAsync();

            return NoContent(); // 204 — successful deletion
        }

        #endregion
    }
}