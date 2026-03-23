using Artifax.Data;
using Artifax.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Artifax.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class BranchController : ControllerBase
    {
        readonly ArtifaxContext context;

        public BranchController (ArtifaxContext incoming)
        {
            context = incoming;
        }

        #region GET
            [HttpGet]
            public async Task<ActionResult<IEnumerable<Branch>>> GetAll ()
            {
                return await context.Branches.ToListAsync();
            }

            [HttpGet("{id}")]
            public async Task<ActionResult<IEnumerable<Branch>>> GetBranchById (int id)
            {
                var _result = await context.Branches.FindAsync(id);
                if (_result == null) return NotFound();
                return Ok(_result);
            }
        #endregion

        #region CREATE
            [HttpPost]
            public async Task<ActionResult<Branch>> CreateBranch (Branch incoming)
            {
                incoming.BranchID = context.Branches.Max(b => b.BranchID + 1);
                context.Branches.Add(incoming);
                await context.SaveChangesAsync();
                return CreatedAtAction("GetBranchById", new { id = incoming.BranchID}, incoming);;
            }
        #endregion

        #region UPDATE
            [HttpPatch]
            public async Task<ActionResult<Branch>> UpdateBranchName (int id, string incoming)
            {
                var _result = await context.Branches.FindAsync(id);
                if (_result == null) return NotFound();

                _result.BranchName = incoming;
                await context.SaveChangesAsync();

                return Ok(_result);
            }
        #endregion

        #region DELETE
            [HttpDelete]
            public async Task<IActionResult> DeleteBranch (int id)
            {
                var _result = await context.Branches.FindAsync(id);
                if (_result == null) return NotFound();

                context.Branches.Remove(_result);
                await context.SaveChangesAsync();

                return NoContent();
            }
        #endregion
    }
}