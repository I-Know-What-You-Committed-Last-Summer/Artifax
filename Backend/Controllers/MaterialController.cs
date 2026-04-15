using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Artifax.Models;
using Artifax.Data;
using Artifax.DTOs;

namespace Artifax.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class MaterialController : ControllerBase
    {
        private readonly ArtifaxContext _context;
        public MaterialController(ArtifaxContext context)
        {
            _context = context;
        }

        //All materials and branch materials, as well as endpoints for creating, updating, and deleting materials and branch materials. Branch material endpoints are not fully completed until the branch controller is completed and fully functional, as the branch does not yet have DTOs.

        [HttpGet("AllMaterials")]
        public async Task<ActionResult<IEnumerable<MaterialReadDto>>> GetAllMaterials()
        {
            return await _context.Materials.Select(m => MaterialReadDto.ToDto(m)).ToListAsync();
        }
        [HttpGet("BranchMaterials")]
        public async Task<ActionResult<IEnumerable<BranchMaterial>>> GetAllBranchMaterials()
        {
            return await _context.BranchMaterials.ToListAsync();
        }
        [HttpGet("BranchMaterials/{id}")]
        public async Task<ActionResult<IEnumerable<BranchMaterial>>> GetAllBranchMaterials(int id)
        {
            return await _context.BranchMaterials.Where(bm => bm.BranchID == id).ToListAsync();
        }
        [HttpPost("Material")]
        public async Task<ActionResult<Material>> CreateMaterial(MaterialWriteDto _incoming)
        {
            Material _material = new Material()
            {
                MaterialName = _incoming.MaterialName,
                MaterialImageURL = _incoming.MaterialImageURL
            };
            _context.Materials.Add(_material);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAllMaterials), new { id = _material.MaterialID }, new MaterialReadDto(){
                MaterialID = _material.MaterialID,
                MaterialName = _material.MaterialName,
                MaterialImageURL = _material.MaterialImageURL
            });
        }
        [HttpPost("BranchMaterial")]
        public async Task<ActionResult<BranchMaterial>> CreateBranchMaterial(BranchMaterialWriteDto _incoming)
        {
            BranchMaterial _branchMaterial = new BranchMaterial()
            {
                MaterialID = _incoming.MaterialID,
                BranchID = _incoming.BranchID,
                BranchMaterialQuantity = _incoming.MaterialQuantity
            };
            _context.BranchMaterials.Add(_branchMaterial);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAllBranchMaterials), new { id = _branchMaterial.BranchMaterialID }, new BranchMaterialReadDto(){
                BranchMaterialID = _branchMaterial.BranchMaterialID,
                MaterialID = _branchMaterial.MaterialID,
                BranchID = _branchMaterial.BranchID,
                MaterialQuantity = _branchMaterial.BranchMaterialQuantity
            });
        }
        [HttpPut("Material/{id}")]
        public async Task<IActionResult> UpdateMaterial(int id, MaterialWriteDto _incoming)
        {
            var _material = await _context.Materials.FindAsync(id);
            if (_material == null) return NotFound();
            _material.MaterialName = _incoming.MaterialName;
            _material.MaterialImageURL = _incoming.MaterialImageURL;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpPut("Material/imageUrl/{id}")]
        public async Task<IActionResult> UpdateMaterialUrl(int id, string _incoming)
        {
            var _material = await _context.Materials.FindAsync(id);
            if (_material == null) return NotFound();
            _material.MaterialImageURL = _incoming;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("Material/{id}")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            var _material = await _context.Materials.FindAsync(id);
            if (_material == null) return NotFound();
            _context.Materials.Remove(_material);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        //TODO: Finish CRUD for branch material once changes for branch have been made by OT

    }
}